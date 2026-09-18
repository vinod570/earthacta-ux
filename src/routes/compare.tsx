import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { getPlaceClaims, type ClaimRow } from "@/lib/claims.functions";
import { listAllClaims } from "@/lib/claims.functions";

const searchSchema = z.object({
  ids: z.string().optional().default(""),
});

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare places — EarthActa" },
      { name: "description", content: "Compare environmental claims across multiple districts or states side by side." },
      { property: "og:title", content: "EarthActa Compare" },
      { property: "og:description", content: "Side-by-side environmental data across districts and states, with provenance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: searchSchema,
  component: ComparePage,
});

const CATEGORIES = ["water", "land", "forest", "minerals", "energy"] as const;

function ComparePage() {
  const { ids } = Route.useSearch();
  const navigate = useNavigate({ from: "/compare" });
  const selected = useMemo(() => ids.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4), [ids]);

  const { data: allClaims = [] } = useQuery({
    queryKey: ["claims", "all"],
    queryFn: () => listAllClaims(),
  });

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["claims", "compare", selected.join(",")],
    queryFn: () => getPlaceClaims({ data: { placeIds: selected } }),
    enabled: selected.length > 0,
  });

  const places = useMemo(() => {
    const map = new Map<string, { id: string; name: string; level: string }>();
    for (const c of allClaims) if (!map.has(c.place_id)) map.set(c.place_id, { id: c.place_id, name: c.place_name, level: c.place_level });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allClaims]);

  function setIds(next: string[]) {
    navigate({ search: { ids: next.slice(0, 4).join(",") } });
  }
  function addPlace(id: string) {
    if (!id || selected.includes(id) || selected.length >= 4) return;
    setIds([...selected, id]);
  }
  function removePlace(id: string) {
    setIds(selected.filter((s) => s !== id));
  }

  const byPlace = useMemo(() => {
    const m = new Map<string, ClaimRow[]>();
    for (const r of rows) {
      const list = m.get(r.place_id) ?? [];
      list.push(r);
      m.set(r.place_id, list);
    }
    return m;
  }, [rows]);

  const headline = (placeId: string, cat: string) =>
    (byPlace.get(placeId) ?? []).find((r) => r.category === cat && r.is_headline)
      ?? (byPlace.get(placeId) ?? []).find((r) => r.category === cat);

  return (
    <main className="dashboard compare">
      <header className="dashboard__header">
        <p className="dashboard__eyebrow">Side-by-side</p>
        <h1>Compare places</h1>
        <p className="dashboard__sub">Pick up to four places to compare across all five categories. Provenance stays visible on every claim.</p>
      </header>

      <section className="compare__picker" aria-label="Selection">
        <label className="filter filter--grow">
          <span>Add a place</span>
          <select
            value=""
            onChange={(e) => { addPlace(e.target.value); e.currentTarget.value = ""; }}
            disabled={selected.length >= 4}
          >
            <option value="">{selected.length >= 4 ? "Maximum of 4" : "Choose…"}</option>
            {places.filter((p) => !selected.includes(p.id)).map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.level}</option>
            ))}
          </select>
        </label>
        <div className="compare__chips">
          {selected.map((id) => {
            const p = places.find((x) => x.id === id);
            return (
              <button key={id} className="chip" onClick={() => removePlace(id)}>
                {p?.name ?? id} <span aria-hidden>×</span>
              </button>
            );
          })}
          {!selected.length && <p className="dashboard__status">No places selected. Add up to four above.</p>}
        </div>
      </section>

      {selected.length > 0 && (
        <section className="compare__grid" aria-label="Comparison">
          <div className="compare__row compare__row--head">
            <span />
            {selected.map((id) => {
              const p = places.find((x) => x.id === id);
              return <span key={id} className="compare__col-head"><strong>{p?.name ?? id}</strong><br /><small>{p?.level}</small></span>;
            })}
          </div>
          {CATEGORIES.map((cat) => (
            <div key={cat} className="compare__row">
              <span className="compare__row-label">{cat}</span>
              {selected.map((id) => {
                const claim = headline(id, cat);
                if (!claim) return <span key={id} className="compare__cell compare__cell--empty">no data</span>;
                return (
                  <span key={id} className="compare__cell">
                    <span className="compare__value">{claim.value}</span>
                    <span className="compare__label">{claim.label}</span>
                    <span className={`status-badge status-${claim.status}`}><i />{claim.status}</span>
                    <small className="compare__cite">{claim.cite}</small>
                  </span>
                );
              })}
            </div>
          ))}
        </section>
      )}

      {isLoading && <p className="dashboard__status">Loading…</p>}

      <p className="dashboard__status">
        <Link to="/">← Back to explorer</Link>
      </p>
    </main>
  );
}
