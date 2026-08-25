import { defineConfig, type Plugin } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import fs from 'node:fs'
import path from 'node:path'

// Load VITE_* variables from the shared env_vars.env file (also used by Docker
// Compose) so the dev server can inject the TMDB API key server-side.
function loadEnvFile(fileName: string): Record<string, string> {
    const filePath = path.resolve(fileName);
    if (!fs.existsSync(filePath))
        return {};
    const vars: Record<string, string> = {};
    for (const line of fs.readFileSync(filePath, 'utf-8').split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (match) {
            const [, key, value] = match;
            vars[key] = value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1)
                : value.startsWith("'") && value.endsWith("'") ? value.slice(1, -1)
                : value;
        }
    }
    return vars;
}

const tmdbApiKey = loadEnvFile('env_vars.env').VITE_TMDB_API_KEY ?? process.env.VITE_TMDB_API_KEY ?? "";

// Proxies /api/tmdb/* to TMDB and injects the API key server-side so the key
// never reaches the browser (TMDB does not allow browser CORS).
function tmdbProxy(): Plugin {
    return {
        name: 'tmdb-proxy',
        configureServer(server) {
            server.middlewares.use('/api/tmdb', (req, res) => {
                const url = new URL(req.url ?? '/', 'http://localhost');
                const apiPath = url.pathname.replace(/^\/api\/tmdb/, '') || '/';
                const target = new URL(`https://api.themoviedb.org/3${apiPath}`);
                target.search = url.search;
                target.searchParams.set('api_key', tmdbApiKey);

                fetch(target.toString())
                    .then(async (response) => {
                        res.statusCode = response.status;
                        res.setHeader('content-type', response.headers.get('content-type') ?? 'application/json');
                        const body = Buffer.from(await response.arrayBuffer());
                        res.end(body);
                    })
                    .catch((err: unknown) => {
                        console.error('[tmdb-proxy] TMDB request failed:', err);
                        res.statusCode = 502;
                        res.end('Bad Gateway');
                    });
            });
        },
    };
}

// https://vite.dev/config/
export default defineConfig({
  css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tmdbProxy(),
  ],
})