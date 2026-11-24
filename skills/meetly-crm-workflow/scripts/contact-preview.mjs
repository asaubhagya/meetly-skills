// Inputs come from a host's authorized, current source and destination reads.
// Candidates are the union of exact verified-email matches and the mapped ID,
// all from one tenant and one object. Never pass name-search matches as identities.
export function previewContact({ tenant, object, mappedId, verifiedEmail, candidates, schema, fields }) {
  if (!tenant || !object) throw new Error('Select a destination tenant and object');
  const hold = reason => ({ tenant, object, action: 'hold', reason });
  if (!mappedId && !verifiedEmail) return hold('Missing verified identifier');
  const email = value => String(value ?? '').trim().toLowerCase();
  const matches = candidates.filter(row => verifiedEmail && email(row.email) === email(verifiedEmail));
  const mapped = mappedId ? candidates.find(row => row.id === mappedId) : null;
  if (mappedId && !mapped) return hold('Saved destination record unavailable');
  if (matches.length > 1 || (mapped && matches.some(row => row.id !== mapped.id))) {
    return hold('Conflicting destination identities');
  }
  if (mapped?.email && verifiedEmail && email(mapped.email) !== email(verifiedEmail)) {
    return hold('Mapped contact email conflicts with verified identifier');
  }

  const target = mapped ?? matches[0];
  const changes = [];
  const skipped = [];
  const keys = new Set();
  for (const field of fields) {
    const property = schema.find(item => item.key === field.key);
    if (keys.has(field.key)) return hold('Multiple proposals for one property');
    keys.add(field.key);
    if (!property?.writable || !field.source || typeof field.value !== 'string' || !field.value.trim() ||
        (property.options && !property.options.includes(field.value))) {
      skipped.push(field.key);
      continue;
    }
    const before = target?.properties[field.key] ?? null;
    if (before !== field.value) changes.push({ key: field.key, before, after: field.value, source: field.source });
  }
  if (!target && schema.some(p => p.required && !changes.some(c => c.key === p.key))) {
    return hold('Missing required create fields');
  }
  const action = !changes.length ? 'unchanged' : target ? 'update' : 'create';
  return { tenant, object, id: target?.id ?? null, action, changes, skipped };
}
