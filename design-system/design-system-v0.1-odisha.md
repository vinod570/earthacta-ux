# EarthActa Design System v0.1 — Odisha Pilot

## Design plan

**Grounding.** The subject is state and institutional resource records — CEA
registers, GRIDCO portals, groundwater board reports. The audience is
investors, operators, and reviewers who need to trust a number before
acting on it. The job of the UI is not to look exciting; it's to make a
reader able to say, at a glance, "I can rely on this" or "I cannot, and
here's why." The visual register should feel closer to a field survey
instrument or an audited ledger than a consumer dashboard — precise,
slightly technical, unhurried.

**Color — 5 named values**
- `--ink` `#1C2321` — near-black, warm rather than blue-black; primary text
- `--paper` `#F1EEE4` — unbleached survey-paper background, not stark white
- `--verified` `#3D5A45` — deep moss green; evidence-backed, gate-passed
- `--caution` `#B08A3E` — ochre/brass; potential, unverified, pending
- `--flag` `#9C4A3C` — muted brick red; discrepancy, missing, failed gate

No bright accent color, no gradient. The restraint itself signals
"instrument," not "product marketing."

**Type — 2 families**
- **Display / headings:** a humanist serif with some editorial weight
  (e.g. Source Serif 4, or Lora) — used for section titles and narrative,
  never for data.
- **Data / labels / numbers:** a monospace or semi-monospace
  (e.g. IBM Plex Mono, or JetBrains Mono) reserved *only* for numeric
  values, units, dates, and source citations — so a reader's eye learns
  instantly: monospace = a claim with a citation behind it.

This is the one deliberate, subject-specific choice: monospace is not
decoration here, it's a trust signal borrowed from data-logging /
survey-instrument conventions, used consistently rather than sprinkled.

**Layout concept**

```
+----------------------------------------------------+
| Section title (serif)      Evidence cutoff: date    |
+----------------------------------------------------+
| [ Resource Base ]   [ Evidence Funnel ]  [ Chain ]  |
|  stacked cards        vertical funnel     horiz.    |
|  left-aligned         center-aligned      flow      |
+----------------------------------------------------+
| Verification Gates (full width, sequential)         |
+----------------------------------------------------+
| Discrepancy / Missing-data banner (only if present)  |
+----------------------------------------------------+
| Source footer: every card cites institution + date  |
+----------------------------------------------------+
```

Left-aligned text throughout (this is a reading tool, not a poster).
Numbers right-aligned within their rows so magnitudes are scannable
top-to-bottom. No card carries a drop shadow; use a 1px hairline border
in `--ink` at 12% opacity instead — shadows read as "app," hairlines read
as "document."

**Principles**
1. Every number on screen has a visible source and an "as of" date next
   to it, in monospace, no exceptions.
2. Uncertainty is a first-class visual state, not an afterthought —
   "unverified" and "verified" get equal visual weight, never grayed out
   as if less important.
3. Nothing gets summed across evidence stages. Only the funnel's terminal
   ("firm") stage may appear in a headline number.
4. A discrepancy is shown, not resolved. The UI's job is to surface the
   conflict, not to quietly pick a winner between two sources.

---

## Component inventory

### 1. Evidence-state chip
States: `verified` · `unverified` · `stale` · `missing`
- Shape: pill, 1px border in the state color, state color text, transparent
  fill (not a solid badge — keeps the paper background visible, avoids the
  "SaaS badge soup" look).
- Always paired with a monospace source string on hover/expand:
  `SOURCE NAME · DD MMM YYYY`.

### 2. Verification gate sequence
A horizontal row of small square nodes (not circles — squares read as
"checklist," circles read as "progress bar," and this is a checklist).
States: `pass` (filled moss green) · `pending` (ochre outline, unfilled)
· `fail` (brick red, filled with a slash).
All gates must show `pass` before any value may be labeled "firm" —
enforce this in code, not just visually.

### 3. Evidence funnel
Vertical stack of horizontal bars, width proportional to value, each
stage labeled with stage name (serif) + value (monospace). The bottom-
most/terminal stage gets a distinct treatment (moss-green fill, a small
checkmark) — this is the *only* stage safe to headline.

### 4. Discrepancy banner
Full-width, brick-red left border (4px), `--paper` background (not a
filled red block — a filled block feels like a hard error; this is a
flagged inconsistency, not a system failure). Shows both conflicting
values side by side with their individual sources, plus the delta.

### 5. Delivery chain
Horizontal row of nodes connected by a thin line, each node a small
labeled square. Resilience/redundancy attributes (e.g. dual feeds, UPS)
shown as small stacked tags beneath the terminal node only.

### 6. Source footer
Every card/section ends in a 1px-bordered strip listing every source
cited within it, in monospace, smallest type size on the page. This is
never omitted, even when it makes a card taller than its neighbors.

---

## Next artifact
A rendered HTML mock of these six components using the Odisha sample
data (`odisha_sample_data.json`) is the natural next step, once this
token system is reviewed.
