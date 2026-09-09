# EarthActa — UX Workstream Narrative

*A running log of context, decisions, and reasoning — for anyone joining this workstream fresh.*

## Where this started

EarthActa is a nonprofit initiative to build a governed, evidence-backed record of natural resource data — starting with Odisha, India, and hydropower/groundwater as the initial domains. The founding idea: most natural-resource claims (environmental impact, water usage, power availability) circulate without evidence behind them. EarthActa aims to collect, cite, and structure that evidence so people can make informed decisions rather than relying on unverified claims.

The engagement began as a fixed-term paid role (3 months, ₹1.5L), explicitly framed as an early-stage "playground" — no rigid deliverables beyond picking one jurisdiction and building deep, comprehensive coverage of it. Vinod took ownership of frontend/UX despite a stronger backend background, since the project partner (a data architect) is handling backend independently.

## Team

- **Vinod** — owns frontend/UX direction
- **Madhu** — designer on the team; strong visual/design instincts, less strong on engineering
- **Ankit Raj** — fresher, frontend-leaning, brought in for mentoring; assessed as light on UX specifically
- **Shyam (project partner)** — data architect, driving backend and overall vision

## Key design principle established early

Using an Odisha hydropower infographic (partner-shared reference) as a style anchor, four principles were set for how EarthActa should present data:

1. Only the *terminal* stage of an evidence funnel may appear as a headline number — intermediate/potential figures are not summed into "available" claims.
2. Discrepancies are surfaced, not silently resolved.
3. A clear visual distinction exists between narrative text and cited data values.
4. The aesthetic should be restrained and "decision-grade" — not decorative.

A synthetic dataset and a full design-system spec (colors, type, six reusable components: evidence chips, verification gates, evidence funnel, discrepancy banner, delivery chain, source footer) were built against this reference to explore what a decision-grade UI could look like.

## Where the actual wireframes diverged

The partner and Madhu independently produced wireframes — a satellite-map explorer (Water/Land/Minerals/Forest/Energy category sidebar, click-a-river-for-detail-panel interaction) styled as a public-facing, accessible tool ("anyone from 5th grade should understand it," per the partner). This is a different register from the original evidence-funnel/verification-gate concept — more consumer explainer than institutional audit tool.

Rather than assume which direction wins, the open question raised to the partner: **is the map view the public explainer layer, with the evidence-funnel pattern living underneath as a separate detailed view — or should provenance be woven directly into this same view?**

**Recommendation made (pending partner confirmation):** provenance should live *inline*, next to each stat, by default — not behind a click or confined to a footer. Concretely: a small source + date tag under each number, plus a verified/pending/flagged/missing badge, with full citation detail available on hover. Density can flex by context (a lighter badge in the public view, a fuller evidence-funnel treatment in a deeper drill-down), but the badge itself should never be hidden behind an "advanced" toggle.

## A useful coincidence: design tokens

Madhu independently produced a full design-token system (colors, typography, radii, shadows, base components) for the dark-themed wireframe UI. Its existing data-visualization semantic colors — positive / warning / negative / neutral — map cleanly onto the verified / pending / flagged / missing states needed for provenance badges, meaning no new palette is needed; just reuse with assigned meaning. One gap flagged (not urgent): no distinct type treatment yet for data values/citations vs. narrative text, which the original design principles call for.

## Reference points considered and set aside

A live 3D-globe OSINT/tracking dashboard (OSIRIS) was shared as a UI reference for the multi-layer map interaction. Assessment: worth borrowing the *interaction pattern* (globe, toggleable layers) but not the underlying purpose or visual language — that tool is built for live, unverified tracking data, the opposite of EarthActa's cited, decision-grade intent.

## Current state (see task tracker for live status)

- Waiting on partner: technical/taxonomy reference doc, candidate jurisdiction/data source list, and confirmation on where provenance lives in the UI
- In progress: Madhu mocking source+date+badge treatment on 1-2 stats in the Godavari panel
- Pending from Vinod: sample river dataset (length/discharge/coverage, with source/date/status) to hand to Madhu
