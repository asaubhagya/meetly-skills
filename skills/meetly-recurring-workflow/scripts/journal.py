"""Durable per-operation approvals and receipts for a single-user workflow host.

Read one JSON object from stdin; emit one small JSON receipt on stdout. The
host supplies an authorized, refreshed field diff and performs connector calls.
"""
import argparse
import hashlib
import json
import os
import sqlite3
import sys
import time

IDENTITY = ("grant", "space", "type", "id", "revision", "destination", "tenant", "action")
COMMANDS = ("preview", "approve", "claim", "receipt", "complete", "retry", "status")


def digest(value):
    encoded = json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True,
                         allow_nan=False)
    return hashlib.sha256(encoded.encode()).hexdigest()


def operate(db, command, body, now):
    identity = {name: body[name] for name in IDENTITY}
    if not all(isinstance(value, str) and 0 < len(value) <= 512 for value in identity.values()):
        raise ValueError("Missing or invalid operation identity")
    if not isinstance(body["diff"], dict) or not body["diff"]:
        raise ValueError("Supply the exact nonempty reviewed field diff")
    key = digest(identity)
    # Keep create ownership across revisions, including while a send is uncertain.
    binding = digest({k: v for k, v in identity.items() if k != "revision"})
    fingerprint = digest(body["diff"])
    db.execute("BEGIN IMMEDIATE")
    try:
        row = db.execute("SELECT * FROM work WHERE key=?", (key,)).fetchone()
        if command == "preview" and row is None:
            db.execute("INSERT INTO work(key,fingerprint,state) VALUES(?,?,'preview')", (key, fingerprint))
        elif row is None:
            raise ValueError("Preview this operation first")
        elif row["fingerprint"] != fingerprint:
            # This includes destination state and field map changes. Invalidate
            # the obsolete approval, but never discard an uncertain write.
            if command != "preview" or row["state"] not in ("preview", "approved"):
                raise ValueError("The reviewed diff changed; reconcile the previous operation")
            db.execute("UPDATE work SET fingerprint=?, state='preview' WHERE key=?", (fingerprint, key))
        elif command == "approve":
            if row["state"] != "preview" or body.get("approvedFingerprint") != fingerprint:
                raise ValueError("Approval must match the preview receipt")
            db.execute("UPDATE work SET state='approved' WHERE key=?", (key,))
        elif command == "claim":
            if row["state"] != "approved" or row["retry_at"] > now:
                raise ValueError("No eligible approval; inspect state before sending")
            if identity["action"] == "create":
                existing = db.execute("SELECT owner FROM creates WHERE binding=?", (binding,)).fetchone()
                if existing and existing["owner"] != key:
                    raise ValueError("Earlier revision owns this create; inspect its receipt and reconcile")
                db.execute("INSERT OR IGNORE INTO creates(binding,owner) VALUES(?,?)", (binding, key))
            db.execute("UPDATE work SET state='sending',attempts=attempts+1 WHERE key=?", (key,))
        elif command == "receipt":
            external = body.get("externalId")
            if not isinstance(external, str) or not 0 < len(external) <= 512:
                raise ValueError("A verified external record ID is required")
            if row["state"] == "sending":
                db.execute("UPDATE work SET state='reconcile',external=? WHERE key=?", (external, key))
            elif row["external"] != external or row["state"] not in ("reconcile", "complete"):
                raise ValueError("Receipt conflicts with the journal")
        elif command == "complete":
            if row["state"] not in ("reconcile", "complete") or body.get("externalId") != row["external"]:
                raise ValueError("Verify the recorded destination before completing reconciliation")
            db.execute("UPDATE work SET state='complete' WHERE key=?", (key,))
        elif command == "retry":
            if row["state"] != "sending" or body.get("verifiedNoEffect") is not True:
                raise ValueError("Resolve the ambiguous external write before retry")
            if identity["action"] == "create":
                db.execute("DELETE FROM creates WHERE binding=? AND owner=?", (binding, key))
            exhausted = row["attempts"] >= 3
            delay = max(2 ** row["attempts"] * 30, int(body.get("retryAfterSeconds", 0)))
            db.execute("UPDATE work SET state=?,retry_at=? WHERE key=?",
                       ("review" if exhausted else "approved", now + delay, key))
        current = dict(db.execute("SELECT * FROM work WHERE key=?", (key,)).fetchone())
        db.commit()
        return current
    except BaseException:
        db.rollback()
        raise


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("database")
    cli.add_argument("command", choices=COMMANDS)
    args = cli.parse_args()
    os.umask(0o077)
    with sqlite3.connect(args.database, timeout=10, isolation_level=None) as db:
        db.row_factory = sqlite3.Row
        db.execute("""CREATE TABLE IF NOT EXISTS work(
            key TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, state TEXT NOT NULL,
            attempts INTEGER NOT NULL DEFAULT 0, retry_at INTEGER NOT NULL DEFAULT 0, external TEXT
        )""")
        db.execute("""CREATE TABLE IF NOT EXISTS creates(
            binding TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES work(key)
        )""")
        result = operate(db, args.command, json.load(sys.stdin), int(time.time()))
        print(json.dumps(result))


if __name__ == "__main__":
    try:
        main()
    except (KeyError, ValueError, sqlite3.Error) as error:
        sys.exit("Workflow journal: " + str(error))
