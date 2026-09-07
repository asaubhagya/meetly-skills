import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { buildManifest, serialize } from './catalog.mjs';

try {
  if (process.argv.slice(2).some(arg => arg !== '--check') || process.argv.slice(2).length > 1) {
    throw new Error('Usage: node scripts/build-manifest.mjs [--check]');
  }
  const root = fileURLToPath(new URL('../', import.meta.url));
  const expected = serialize(await buildManifest(root));
  const target = join(root, 'manifest.json');
  if (process.argv.includes('--check')) {
    let actual;
    try { actual = await readFile(target, 'utf8'); } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (actual !== expected) throw new Error('manifest.json is missing or stale; run npm run build');
    console.log('manifest.json is current');
  } else {
    await writeFile(target, expected);
    console.log('Built manifest.json');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
