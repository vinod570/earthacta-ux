# EarthActa Explorer — Vercel + your own Supabase

Everything below is copy-paste. Total time: about 20 minutes.
You need: the unzipped folder, a GitHub account, your Supabase account, your Vercel account.

---

## Step 1 — Put the code in a GitHub repo

Unzip the download, then in a terminal inside the folder:

```bash
git init
git add .
git commit -m "EarthActa Explorer"
git branch -M main
```

Create an **empty** repository on github.com (no README, no .gitignore), copy its
URL, then:

```bash
git remote add origin https://github.com/YOUR-NAME/earthacta-explorer.git
git push -u origin main
```

Your `.env` file is never pushed — `.gitignore` already excludes it.

---

## Step 2 — Create the database tables in Supabase

1. Open your project on supabase.com.
2. Left sidebar → **SQL Editor** → **New query**.
3. Open the file `supabase/migrations/0000_create_claims_registry.sql` from the
   download, copy **all** of it, paste it into the editor.
4. Click **Run**.

You should see "Success". Check it worked: **Table Editor** → `claims` → you
should see roughly 500 rows.

This one script creates the table, its security rules, and all the seed claims.

---

## Step 3 — Collect your Supabase keys

Supabase → **Project Settings** → **API**. Copy two things:

| What you need | Where it is |
| --- | --- |
| Project URL — `https://abcdefg.supabase.co` | "Project URL" |
| Publishable / anon key | "Project API keys" → `anon` `public` |

Do **not** copy the `service_role` key. This app never needs it.

The "project ref" is just the `abcdefg` part of the URL.

---

## Step 4 — Run it on your own machine first (recommended)

```bash
npm install
cp .env.example .env
```

Open `.env` in any editor and fill in the same two values in all four places
(`SUPABASE_*` for the server, `VITE_SUPABASE_*` for the browser):

```
SUPABASE_URL="https://abcdefg.supabase.co"
SUPABASE_PUBLISHABLE_KEY="eyJhbGci..."
SUPABASE_PROJECT_ID="abcdefg"
VITE_SUPABASE_URL="https://abcdefg.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGci..."
VITE_SUPABASE_PROJECT_ID="abcdefg"
```

Then:

```bash
npm run dev
```

Open http://localhost:8080 — you should get the map on `/`, the dashboard on
`/claims`, and the side-by-side view on `/compare`. If Claims is empty, Step 2
did not run; re-do it.

---

## Step 5 — Deploy on Vercel

1. vercel.com → **Add New… → Project** → **Import** your GitHub repo.
2. Framework preset: leave whatever it detects (**Vite** or **Other**) —
   the build command `npm run build` and the repo's own config handle the rest.
3. Expand **Environment Variables** and add these six, one per row, same values
   as your `.env`:

   ```
   SUPABASE_URL
   SUPABASE_PUBLISHABLE_KEY
   SUPABASE_PROJECT_ID
   VITE_SUPABASE_URL
   VITE_SUPABASE_PUBLISHABLE_KEY
   VITE_SUPABASE_PROJECT_ID
   ```

   Optional seventh: `LOVABLE_API_KEY` if you want the AI field brief.
4. Click **Deploy**.

When it finishes, open the URL Vercel gives you and check `/`, `/claims` and
`/compare`.

Every `git push` to `main` now redeploys automatically.

---

## Step 6 — Custom domain (optional)

Vercel → your project → **Settings → Domains → Add**, enter your domain, and
add the DNS record Vercel shows at your registrar.

---

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Pages load but Claims/Compare are empty | The SQL from Step 2 was not run against this Supabase project. |
| "Missing Supabase environment variable(s)" | A variable name is misspelled in Vercel, or you only added the `SUPABASE_*` set and not the `VITE_` twins. |
| Changed an env var, site unchanged | Vercel → **Deployments** → latest → **Redeploy**. Env vars only apply to new builds. |
| AI field brief says not configured | Expected without `LOVABLE_API_KEY`. Everything else still works. |
| Build fails on Vercel but works locally | Make sure `package-lock.json` (or `bun.lock`) was committed, and Node 20+ is selected in Vercel → Settings → General. |

---

## What each folder is

| Path | What it does |
| --- | --- |
| `src/routes/` | The pages. `index.tsx` = map explorer, `claims.tsx` = dashboard, `compare.tsx` = side-by-side, `__root.tsx` = shared shell + top nav |
| `src/components/EarthMap.tsx` | The map itself — drawing, colours, pan/zoom, labels |
| `src/data/` | Boundary map files and the place definitions |
| `src/lib/*.functions.ts` | Server-side code that reads the database and calls AI |
| `src/integrations/supabase/` | Generated database plumbing — do not edit |
| `src/styles.css` | Every colour, font and layout rule |
| `supabase/migrations/` | The SQL that builds your database |
| `.env` | Your keys. The only file you configure. Never committed. |

Never edit `src/routeTree.gen.ts` or anything in `node_modules` — both are generated.
