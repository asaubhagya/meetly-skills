import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { previewContact } from '../skills/meetly-crm-workflow/scripts/contact-preview.mjs';

const schemas = {
  'hubspot-a': { object: 'contacts', email: 'email', name: 'fixture_name', tag: 'interest', options: ['warm'] },
  'hubspot-b': { object: 'contacts', email: 'email', name: 'fixture_name', tag: 'interest', options: ['qualified'] },
  'crm-c': { object: 'Contacts', email: 'Email', name: 'Full_Name', tag: 'Category', options: ['warm'] },
};
const script = fileURLToPath(new URL('../skills/meetly-recurring-workflow/scripts/journal.py', import.meta.url));

// A tenant-scoped HTTP double exercises destination discovery, distinct property
// keys and read-after-write. It accepts duplicate creates so journal regressions
// surface in record counts instead of getting masked by destination deduplication.
async function startCrm(t) {
  const records = new Map(Object.keys(schemas).map(key => [key, []]));
  const server = createServer(async (req, res) => {
    const [, tenant, route, id] = req.url.split('/');
    const config = schemas[tenant];
    const rows = records.get(tenant);
    const reply = (status, body) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    };
    if (!config) return reply(404, {});
    if (route === 'schema') return reply(200, {
      object: config.object,
      properties: [
        { key: config.email, writable: true, required: true },
        { key: config.name, writable: true },
        { key: config.tag, writable: true, options: config.options },
      ],
    });
    if (route !== config.object) return reply(404, {});
    if (req.method === 'GET') {
      const body = id ? rows.find(row => row.id === id) : rows;
      return reply(body ? 200 : 404, body ?? {});
    }
    const parts = [];
    for await (const chunk of req) parts.push(chunk);
    const properties = JSON.parse(Buffer.concat(parts));
    const row = req.method === 'PATCH' ? rows.find(row => row.id === id) : { id: tenant + '-' + (rows.length + 1), properties: {} };
    if (!row) return reply(404, {});
    Object.assign(row.properties, properties);
    row.email = row.properties[config.email];
    if (req.method === 'POST') rows.push(row);
    return reply(200, { id: row.id });
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  return 'http://127.0.0.1:' + server.address().port;
}

test('one fictional Meetly contact reconciles independently through two CRM schemas and three tenants', async t => {
  const base = await startCrm(t);
  const dir = await mkdtemp(join(tmpdir(), 'meetly-fixture-portals-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const journal = (command, body) => JSON.parse(execFileSync('python3', [script, join(dir, 'journal.db'), command], {
    input: JSON.stringify(body), stdio: ['pipe', 'pipe', 'pipe'],
  }));
  async function request(path, method = 'GET', body) {
    const result = await fetch(base + path, { method, body: body && JSON.stringify(body) });
    assert.ok(result.ok);
    return result.json();
  }
  // The native graph person projection drops local contact IDs. The verified
  // address and permitted CRM tag below are explicitly selected fixture facts.
  const source = { type: 'person', id: 'bd4d387f91fab63473584e87a596583a3071f12ee7dd0a39552922e05e6a055a',
    revision: 'da26a7eece1f47efd1ca641c84cb730e8f258887428802972ac9cd1fe8e35be7', nativeJSON: JSON.stringify({
    emails: ['avery@clients.example'], linkedContactNames: [], merged: [], name: 'Avery Fixture',
  }) };
  const person = JSON.parse(source.nativeJSON);
  for (const [tenant, keys] of Object.entries(schemas)) {
    const catalog = await request('/' + tenant + '/schema');
    const path = '/' + tenant + '/' + catalog.object;
    const input = { tenant, object: catalog.object, verifiedEmail: person.emails[0], schema: catalog.properties,
      fields: [
        { key: keys.email, value: person.emails[0], source: 'verified-fixture-contact' },
        { key: keys.name, value: person.name, source: 'native-person-fixture' },
        { key: keys.tag, value: 'warm', source: 'fixture-lead-label' },
      ] };
    const first = previewContact({ ...input, candidates: await request(path) });
    assert.equal(first.action, 'create');
    assert.deepEqual(first.skipped, tenant === 'hubspot-b' ? [keys.tag] : []);
    const op = { grant: 'fixture', space: 'client', type: source.type, id: source.id,
      revision: source.revision, destination: catalog.object, tenant, action: first.action, diff: first };
    const approve = plan => journal('approve', { ...plan, approvedFingerprint: journal('preview', plan).fingerprint });
    approve(op);
    journal('claim', op);
    // Discard the create response, then recover through a separate matching read.
    await request(path, 'POST', Object.fromEntries(first.changes.map(f => [f.key, f.after])));
    const candidates = await request(path);
    assert.equal(candidates.length, 1);
    const [saved] = candidates;
    assert.equal(saved.email, person.emails[0]);
    assert.equal(saved.properties[keys.tag], tenant === 'hubspot-b' ? undefined : 'warm');
    const receipt = { ...op, externalId: saved.id };
    journal('receipt', receipt);
    journal('complete', receipt);
    const amended = { ...op, revision: 'r2' };
    approve(amended);
    assert.throws(() => journal('claim', amended), /Earlier revision owns/);
    assert.equal(previewContact({ ...input, candidates, mappedId: saved.id }).action, 'unchanged');
    const revised = { ...input, fields: input.fields.map(f => f.key === keys.name ? { ...f, value: 'Avery Q Reviewer' } : f) };
    const update = previewContact({ ...revised, candidates, mappedId: saved.id });
    assert.equal(update.action, 'update');
    const updateOp = { ...amended, action: update.action, diff: update };
    approve(updateOp);
    journal('claim', updateOp);
    await request(path + '/' + update.id, 'PATCH', Object.fromEntries(update.changes.map(f => [f.key, f.after])));
    const refreshed = await request(path + '/' + update.id);
    assert.equal(refreshed.properties[keys.name], 'Avery Q Reviewer');
    journal('receipt', { ...updateOp, externalId: refreshed.id });
    journal('complete', { ...updateOp, externalId: refreshed.id });
    assert.equal((await request(path)).length, 1);
    const duplicate = { ...refreshed, id: 'other-id' };
    assert.equal(previewContact({ ...input, candidates: [saved, duplicate] }).action, 'hold');
    assert.equal(previewContact({ ...input, candidates: [], verifiedEmail: undefined }).action, 'hold');
  }
});
