import { fileURLToPath } from 'node:url';
import { buildManifest } from './catalog.mjs';

try {
  const manifest = await buildManifest(fileURLToPath(new URL('../', import.meta.url)));
  console.log(`Validated ${manifest.skills.length} skills and GUIDE.md`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
