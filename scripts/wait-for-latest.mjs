import { pathToFileURL } from 'node:url';

export const channelsUrl = 'https://agents.getmeetly.ai/channels.json';

export async function latestMatches(sha, request = globalThis.fetch, timeoutMs = 15_000) {
  try {
    const response = await request(channelsUrl, {
      headers: { 'Cache-Control': 'no-cache' },
      redirect: 'error', signal: AbortSignal.timeout(timeoutMs)
    });
    if (!response.ok) return false;
    const channels = await response.json();
    return channels.schema === 'meetly-channels/1' && channels.latest?.sha === sha;
  } catch { return false; }
}

export async function waitForLatest(sha, {
  fetch: request = globalThis.fetch, now = Date.now,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
  log = console.log, timeoutMs = 600_000
} = {}) {
  if (!/^[a-f0-9]{40}$/.test(sha ?? '')) throw new Error('Expected a peeled Git commit SHA.');
  const deadline = now() + timeoutMs;
  while (now() < deadline) {
    if (await latestMatches(sha, request, Math.max(1, Math.min(15_000, deadline - now())))) {
      log('Website latest points to the triggering commit.');
      return;
    }
    const remaining = deadline - now();
    if (remaining <= 0) break;
    log('Waiting for website latest propagation; response content is not logged.');
    await sleep(Math.min(15_000, remaining));
  }
  throw new Error('Website latest did not reach the triggering commit within the bounded wait; plugin was not promoted.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await waitForLatest(process.env.EXPECTED_SKILLS_SHA); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
