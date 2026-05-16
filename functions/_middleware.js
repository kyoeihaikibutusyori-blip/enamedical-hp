// Basic Authentication for Cloudflare Pages preview
// Credentials are read from environment variables set in the Pages dashboard:
//   BASIC_AUTH_USER, BASIC_AUTH_PASS

export async function onRequest(context) {
  const { request, env, next } = context;

  const expectedUser = env.BASIC_AUTH_USER;
  const expectedPass = env.BASIC_AUTH_PASS;

  if (!expectedUser || !expectedPass) {
    return new Response("Basic auth is not configured.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const header = request.headers.get("Authorization") || "";

  if (header.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const idx = decoded.indexOf(":");
      const user = idx >= 0 ? decoded.slice(0, idx) : decoded;
      const pass = idx >= 0 ? decoded.slice(idx + 1) : "";

      if (user === expectedUser && pass === expectedPass) {
        return next();
      }
    } catch (_) {
      // fall through to 401
    }
  }

  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Ena Medical Preview", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
