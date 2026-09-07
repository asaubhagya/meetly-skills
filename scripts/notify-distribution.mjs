import { pathToFileURL } from 'node:url';

// Never expose request URLs, credentials, response bodies, or raw fetch errors:
// the deploy-hook URL itself is a credential.
export async function notifyDistribution(env, { fetch: request = globalThis.fetch, log = console.log } = {}) {
  const { GITHUB_EVENT_NAME: event, SOURCE_REPOSITORY: repository, SOURCE_REF: ref, SOURCE_SHA: sha } = env;
  const stable = /^refs\/tags\/v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(ref ?? '');
  if (event !== 'push' || repository !== 'asaubhagya/meetly-skills' || (ref !== 'refs/heads/main' && !stable)) {
    log('::notice::Distribution skipped: only trusted main or stable semver tag pushes notify downstream.');
    return 'skipped';
  }

  const hook = env.MEETLY_AGENTS_DEPLOY_HOOK;
  const token = env.MEETLY_DISTRIBUTION_TOKEN;
  if (!hook && !token) {
    log('::notice::Distribution not configured: set MEETLY_AGENTS_DEPLOY_HOOK (preferred) or MEETLY_DISTRIBUTION_TOKEN. Checks passed; notification skipped.');
    return 'skipped';
  }

  const route = hook ? 'Vercel deploy hook' : 'repository dispatch';
  let response;
  try {
    if (hook) {
      const url = new URL(hook);
      if (url.protocol !== 'https:' || url.hostname !== 'api.vercel.com' || url.port || url.username || url.password || !url.pathname.startsWith('/v1/integrations/deploy/')) {
        throw new Error('Invalid hook');
      }
      response = await request(hook, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(30_000) });
    } else {
      response = await request('https://api.github.com/repos/asaubhagya/get-meetly-ai/dispatches', {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(30_000),
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          event_type: 'meetly-skills-updated',
          client_payload: { repository, sha, ref, channel: stable ? 'latest' : 'beta' }
        })
      });
    }
  } catch {
    throw new Error(`${route} request failed; check secret configuration and downstream availability. No fallback attempted.`);
  }
  if (hook ? !response.ok : response.status !== 204) {
    throw new Error(`${route} rejected the request (HTTP ${response.status}); no fallback attempted.`);
  }
  log(`Distribution accepted via ${route}; downstream deployment completion is not verified here.`);
  return hook ? 'hook' : 'dispatch';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await notifyDistribution(process.env);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
