const TOKEN_LIFETIME_MS = 30 * 60 * 1000;
const SESSION_START_WINDOW_MS = 60 * 1000;

export default async function handler() {
  if (typeof process.env.GEMINI_API_KEY !== 'string' || process.env.GEMINI_API_KEY.length === 0) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  const now = Date.now();
  const payload = {
    uses: 1,
    expireTime: new Date(now + TOKEN_LIFETIME_MS).toISOString(),
    newSessionExpireTime: new Date(now + SESSION_START_WINDOW_MS).toISOString(),
  };
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/auth_tokens?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    return new Response(JSON.stringify({ error: body.error?.message ?? 'Gemini token provisioning failed' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ token: body.name, expireTime: body.expireTime }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
