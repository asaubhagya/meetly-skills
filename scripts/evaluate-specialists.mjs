// Opt-in subscription-native model evaluation. Outputs are ignored review artifacts.
import {readFile, mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const mode = process.argv[2];
if (!['baseline','guided'].includes(mode)) throw new Error('Use baseline or guided');
const fixtures = JSON.parse(await readFile(join(root,'benchmarks/specialists.json'),'utf8'));
const selected = process.argv.slice(3);
const coreCases = [
  {...fixtures.cases[0], id:'conversation-summary', skill:'meetly-catch-up',
    request:'Summarize this product conversation. Adapt to its intent, explain what matters, and include a useful bounded draft if warranted. Do not turn this into the full specialist PRD.'},
  {id:'daily-brief',skill:'meetly-briefing',title:'The daily executive brief',
    request:'Create my private daily executive brief for 7 September 2026. Start with a dense executive one-pager of 350-400 words including source references, using bold inline leads rather than separate subheadings. Then a substantial detailed edition with a thoughtful article for each conversation and useful connections. Cover the four supplied business conversations, not the separate legal fixture. Do not claim these are all my recordings or that I attended every call. Research is covered by supplied source notes. Aim for 1800-2400 useful words total, without padding. Use the exact heading ## Detailed edition after the executive opening so the exporter can begin it on a fresh page.',
    metadata:'Supplied scope: P1 09:00, E1 10:30, C1 13:00, S1 15:00 on 2026-09-07 Asia/Singapore. Complete texts of these four fixtures supplied; whole-account coverage not checked.',
    transcript:fixtures.cases.slice(0,4).map(c=>c.metadata+'\n'+c.transcript).join('\n\n'),
    companyContext:fixtures.cases.slice(0,4).map(c=>c.companyContext).join('\n\n')},
];
const cases = [...fixtures.cases,...coreCases].filter(c => !selected.length || selected.includes(c.id));
const out = join(root,'output/evaluation',mode);
await mkdir(out,{recursive:true});
const guide = await readFile(join(root,'GUIDE.md'),'utf8');
for (const c of cases) {
  let instructions = '';
  if (mode === 'guided') {
    instructions = guide + '\n' + await readFile(join(root,'skills',c.skill,'SKILL.md'),'utf8');
    instructions += '\n' + await readFile(join(root,'skills',c.skill,'references/editorial.md'),'utf8');
    try { instructions += '\n' + await readFile(join(root,'skills',c.skill,'references/professional.md'),'utf8'); } catch (e) {if(e.code!=='ENOENT')throw e;}
  }
  const prompt = `You are evaluating Meetly document quality in an isolated synthetic scenario. Do not call tools, browse, read files, save preferences, or take any external action. All authorized evidence is below. Produce the actual finished document in Markdown, not an explanation of the task. Label it Synthetic evaluation sample. Use substantive connected prose, useful headings, evidence citations using fixture IDs and timestamps, and the supplied research links where relevant. Aim for 900-1300 words for a specialist document; density means useful detail, never padding. No invented evidence, metrics or research. Include one grounded next-step question. Current preference: ${fixtures.preferences}\n${instructions}\nUSER REQUEST: ${c.request}\nMETADATA: ${c.metadata}\nTRANSCRIPT:\n${c.transcript}\nSIMULATED CONNECTED CONTEXT:\n${c.companyContext}\nPUBLIC SOURCE NOTES (reviewed by primary agent; not fetched by you):\n${JSON.stringify(fixtures.sources)}\nEnd of evidence.`;
  const child = spawn('npx',['--yes','@openai/codex@0.153.4','exec','--ignore-user-config','--ephemeral','--skip-git-repo-check','-C','/tmp','-s','read-only','-m','gpt-6-astra','-c','model_reasoning_effort="high"','--color','never','-o',join(out,c.id+'.md'),'-'],{stdio:['pipe','ignore','pipe']});
  let err=''; child.stderr.on('data',b=>{err=(err+b).slice(-2000);});
  child.stdin.end(prompt + '\nThe host will convert this Markdown to a PDF after your response. Omit export/tool-availability commentary from the document. Do not narrate your inability to call setup; its relevant instructions, preferences and authorized sources are supplied above.');
  const code=await new Promise(resolve=>child.on('close',resolve));
  if(code)throw new Error(`${c.id}: evaluation failed (${code}): ${err}`);
  console.log(`${mode}: ${c.id} generated`);
}
