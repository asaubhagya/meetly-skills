// One authored source; per-skill copies keep every downloaded skill self-contained.
import {readFile, readdir, mkdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const check=process.argv.includes('--check');
for(const entry of await readdir(join(root,'skills'),{withFileTypes:true})) {
  if(!entry.isDirectory())continue;
  for(const name of ['editorial.md','document.css']) {
    const source=await readFile(join(root,'shared',name));
    const dest=join(root,'skills',entry.name,'references',name);
    if(check) {
      const actual=await readFile(dest).catch(()=>null);
      if(!actual?.equals(source))throw new Error(`${entry.name}: stale shared ${name}; run npm run build`);
    } else {
      await mkdir(join(root,'skills',entry.name,'references'),{recursive:true});
      await writeFile(dest,source);
    }
  }
}
