import { readdir, readFile, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const keyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const fail = (message) => { throw new Error(message); };
const quoted = (value, label) => {
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed !== 'string' || !parsed.trim()) throw new Error();
    return parsed;
  } catch { fail(`${label}: expected a nonempty JSON-quoted YAML string`); }
};

// Deliberately constrained YAML subset, documented in README. Reject unsupported
// syntax rather than partially parsing a manifest's security-relevant metadata.
export function frontmatter(text, key) {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]+)$/.exec(text);
  if (!match) fail(`${key}: missing frontmatter or body (use LF line endings)`);
  const fields = {};
  for (const line of match[1].split('\n')) {
    const field = /^(name|version|description): (.+)$/.exec(line);
    if (!field || Object.hasOwn(fields, field[1])) fail(`${key}: unsupported or duplicate frontmatter field`);
    fields[field[1]] = field[2];
  }
  if (fields.name !== key || key.length > 64 || !keyPattern.test(key)) fail(`${key}: invalid or mismatched name`);
  if (!/^[1-9][0-9]*$/.test(fields.version) || !Number.isSafeInteger(Number(fields.version))) fail(`${key}: version must be a positive safe integer`);
  if (!fields.description?.trim() || fields.description.length > 1024 ||
      /[:]\s|\s#|^[\[\]{}"'>&*!|%@\x60]/.test(fields.description)) fail(`${key}: invalid plain description`);
  if (!match[2].trim()) fail(`${key}: empty skill body`);
  return { key, version: Number(fields.version), description: fields.description };
}

export function metadata(text, key) {
  const lines = text.trimEnd().split('\n');
  const result = { interface: {}, dependencies: [] };
  let section;
  let dependency;
  let sawTools = false;
  const sections = new Set();
  for (const line of lines) {
    if (!line.trim()) continue;
    if (/^(interface|dependencies|policy):$/.test(line)) {
      section = line.slice(0, -1);
      if (sections.has(section)) fail(`${key}: duplicate metadata section`);
      sections.add(section);
      continue;
    }
    let m;
    if (section === 'interface' && (m = /^  (display_name|short_description|brand_color|default_prompt): (.+)$/.exec(line))) {
      if (Object.hasOwn(result.interface, m[1])) fail(`${key}: duplicate interface field`);
      result.interface[m[1]] = quoted(m[2], key);
    } else if (section === 'dependencies' && line === '  tools:' && !sawTools) {
      sawTools = true;
    } else if (section === 'dependencies' && sawTools && (m = /^    - type: (.+)$/.exec(line))) {
      dependency = { type: quoted(m[1], key) };
      result.dependencies.push(dependency);
    } else if (section === 'dependencies' && dependency && (m = /^      (value|description|transport|url): (.+)$/.exec(line))) {
      if (Object.hasOwn(dependency, m[1])) fail(`${key}: duplicate dependency field`);
      dependency[m[1]] = quoted(m[2], key);
    } else if (section === 'policy' && (m = /^  allow_implicit_invocation: (true|false)$/.exec(line)) && result.implicit === undefined) {
      result.implicit = m[1] === 'true';
    } else fail(`${key}: unsupported metadata line: ${line}`);
  }
  for (const field of ['display_name', 'short_description', 'default_prompt']) {
    if (!result.interface[field]) fail(`${key}: missing interface.${field}`);
  }
  if (result.interface.short_description.length < 25 || result.interface.short_description.length > 64) fail(`${key}: short description must be 25–64 characters`);
  if (!result.interface.default_prompt.includes('$' + key)) fail(`${key}: default prompt must name the skill`);
  if (result.interface.brand_color && !/^#[0-9a-fA-F]{6}$/.test(result.interface.brand_color)) fail(`${key}: invalid brand color`);
  if (result.implicit !== !key.startsWith('create-')) fail(`${key}: artifact skills must be explicit; setup/catch-up/briefing implicit`);
  if (result.dependencies.length !== 1) fail(`${key}: exactly one Meetly MCP dependency required`);
  const dep = result.dependencies[0];
  if (dep.type !== 'mcp' || dep.value !== 'meetly' || !dep.description ||
      dep.transport !== 'streamable_http' || dep.url !== 'https://mcp.getmeetly.ai/mcp') fail(`${key}: invalid Meetly dependency`);
  return result;
}

async function filesUnder(root, prefix = '') {
  const paths = [];
  for (const entry of (await readdir(join(root, prefix), { withFileTypes: true })).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(entry.name)) fail(`unsafe path: ${prefix}${entry.name}`);
    const path = prefix + entry.name;
    if (entry.isSymbolicLink()) fail(`symlinks are not distributable: ${path}`);
    if (entry.isDirectory()) paths.push(...await filesUnder(root, path + '/'));
    else if (entry.isFile()) paths.push(path);
    else fail(`unsupported file type: ${path}`);
  }
  return paths.sort();
}

async function digest(root, src) {
  if (!(await lstat(join(root, src))).isFile()) fail(`not a regular file: ${src}`);
  const bytes = await readFile(join(root, src));
  return { src, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length };
}

export async function buildManifest(root) {
  const skillsRoot = join(root, 'skills');
  const entries = (await readdir(skillsRoot, { withFileTypes: true })).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  if (!entries.length) fail('skills catalog must not be empty');
  const skills = [];
  for (const entry of entries) {
    const key = entry.name;
    if (!entry.isDirectory() || !keyPattern.test(key) || key.length > 64) fail(`invalid skill directory: ${key}`);
    const paths = await filesUnder(join(skillsRoot, key));
    for (const required of ['SKILL.md', 'agents/openai.yaml']) {
      if (!paths.includes(required)) fail(`${key}: missing ${required}`);
    }
    const record = frontmatter(await readFile(join(skillsRoot, key, 'SKILL.md'), 'utf8'), key);
    metadata(await readFile(join(skillsRoot, key, 'agents/openai.yaml'), 'utf8'), key);
    const files = [];
    for (const path of paths) files.push({ path, ...await digest(root, `skills/${key}/${path}`) });
    skills.push({ ...record, files });
  }
  const guide = await digest(root, 'GUIDE.md');
  if (!guide.bytes) fail('GUIDE.md must not be empty');
  return { schema: 'meetly-skills/1', skills, guide };
}

export const serialize = (manifest) => JSON.stringify(manifest, null, 2) + '\n';
