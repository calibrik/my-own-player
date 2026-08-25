export default async (req) => {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!TMDB_API_KEY) {
    return Response.json({ error: "TMDB_API_KEY env var is not set on Netlify." }, { status: 500 });
  }

  const url = new URL(req.url);
  const apiPath = url.pathname.replace(/^\/api\/tmdb/, "") || "/";

  // Rebuild the TMDB request server-side, injecting the key so it never reaches the browser.
  const target = new URL(`https://api.themoviedb.org/3${apiPath}`);
  url.searchParams.forEach((value, key) => target.searchParams.set(key, value));
  target.searchParams.set("api_key", TMDB_API_KEY);

  const response = await fetch(target.toString());
  return new Response(response.body, {
    status: response.status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};

export const config = {
  path: "/api/tmdb/*",
};