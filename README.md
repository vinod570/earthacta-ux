# EarthActa — UX Working Repo

Personal working repository for the frontend/UX portion of EarthActa
(Vinod's engagement). This is a **working/exploratory repo**, distinct
from `earthacta-design` (Shyam's governed repo for accepted design
proposals, decisions, and reference models). Artifacts here get
promoted there once reviewed and ready — see `docs/narrative.md` for
the reasoning behind that separation.

## Structure

```
design-system/   Token systems, component specs, visual language docs
prototypes/      Working HTML/CSS/JS mocks — real, runnable, not static images
data/            Synthetic sample datasets used to design/prototype against
docs/            Narrative log, task tracking, planning docs
assets/          Exported images, icons, or other static assets (e.g. from Madhu)
```

## Conventions

- **Naming:** lowercase, hyphenated, versioned where relevant
  (e.g. `design-system-v0.1-odisha.md`). Increment the version suffix
  rather than overwriting — keeps history of how the direction evolved.
- **Prototypes are real code**, meant to be opened directly in a
  browser — not just images. If a prototype supersedes an older one,
  keep the old file and note the change in `docs/narrative.md` rather
  than deleting silently.
- **`data/` is synthetic only.** Never commit real/live data here even
  once available — this repo is for design exploration, not the actual
  data pipeline.
- **`docs/narrative.md`** is a running log — append new sections rather
  than rewriting history, so context isn't lost as the project evolves.
- **`docs/next-steps.csv` and `docs/ux-completion-plan.csv`** are living
  trackers — update status in place; these aren't append-only logs.

## Current contents

- `design-system/design-system-v0.1-odisha.md` — token system, color/type
  rules, and six-component spec, grounded in the Odisha hydropower
  reference infographic
- `prototypes/godavari-provenance-prototype.html` — working prototype
  applying inline source+date+badge provenance to the Godavari wireframe
  screen shared by the team
- `data/odisha-sample-data.json` — synthetic dataset (hydro + groundwater)
  structured around evidence stages, verification gates, and discrepancies
- `docs/narrative.md` — full context log of decisions and reasoning to date
- `docs/next-steps.csv` — live task tracker (owner, status, blockers)
- `docs/ux-completion-plan.csv` — phased plan with duration estimates for
  completing the UX portion of the Odisha pilot
