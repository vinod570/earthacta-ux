# EarthActa Explorer — Local & Git Setup

## 1. Get the code into Git

```bash
unzip earthacta-explorer.zip
cd earthacta-explorer
git init
git add .
git commit -m "Initial import from Lovable"
git branch -M main
git remote add origin git@github.com:YOUR-ORG/earthacta-explorer.git
git push -u origin main
```

## 2. Install & run

```bash
bun install         # or: npm install / pnpm install
cp .env.example .env
# edit .env with your database credentials (see below)
bun run dev         # http://localhost:8080
```

## 3. Configure the database (any Supabase project)

The app reads its database connection from environment variables — nothing is
hard-coded. Point it at any Supabase project you own:

| Variable                        | Where to find it                                        |
| ------------------------------- | ------------------------------------------------------- |
| `SUPABASE_URL` / `VITE_SUPABASE_URL`                   | Project Settings → API → Project URL     |
| `SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API → `anon`/publishable key |
| `SUPABASE_PROJECT_ID` / `VITE_SUPABASE_PROJECT_ID`     | The subdomain of your project URL        |

Both the `SUPABASE_*` (server) and `VITE_SUPABASE_*` (browser) copies must be
set — Vite inlines the `VITE_` ones into the client bundle at build time.

To switch environments (dev/staging/prod), keep separate `.env.local`,
`.env.staging`, `.env.production` files and load the one you want.

## 4. Apply the schema

Migrations live in `supabase/migrations/`. Apply them to your target database:

```bash
# Using the Supabase CLI (recommended)
npx supabase link --project-ref YOUR-PROJECT-REF
npx supabase db push
```

Or paste the SQL from `supabase/migrations/*.sql` into the SQL editor of your
Supabase project in order.

## 5. Optional: AI field brief

Set `LOVABLE_API_KEY` to enable the AI-generated place brief. Leave empty to
disable that panel; the map and claims dashboard work without it.

## 6. Deploy

Any Node/Edge host that supports TanStack Start works (Cloudflare Workers,
Vercel, Netlify, Fly). Set the same env vars in your host's dashboard.
