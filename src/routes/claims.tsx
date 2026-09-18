import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listAllClaims, type ClaimRow } from "@/lib/claims.functions";

export const Route = createFileRoute("/claims")({
  head: () => ({
    meta: [
      { title: "Claims dashboard — EarthActa" },
      { name: "description", content: "Every environmental claim in the EarthActa registry, with source and verification status." },
      { property: "og:title", content: "EarthActa Claims Dashboard" },
      { property: "og:description", content: "Filter environmental claims by status, category, and place — with visible provenance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClaimsDashboard,
});

const CATEGORIES = ["all", "water", "land", "forest", "minerals", "energy"] as const;
const STATUSES = ["all", "verified", "pending", "flagged", "missing"] as const;

function ClaimsDashboard() {
  const { data: claims = [], isLoading, error } = useQuery({
    queryKey: ["claims", "all"],
    queryFn: () => listAllClaims(),
  });
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("all");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return claims.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (status !== "all" && c.status !== status) return false;
      if (q && !`${c.place_name} ${c.label} ${c.value} ${c.cite}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [claims, category, status, query]);

  const tiles = useMemo(() => {
    const counts = { verified: 0, pending: 0, flagged: 0, missing: 0 } as Record<ClaimRow["status"], number>;
    for (const c of claims) counts[c.status]++;
    return counts;
  }, [claims]);

  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <p className="dashboard__eyebrow">Registry</p>
        <h1>Claims dashboard</h1>
        <p className="dashboard__sub">Every environmental claim in the EarthActa registry, with its source and verification status.</p>
      </header>

      <section className="dashboard__tiles" aria-label="Status totals">
        {(["verified", "pending", "flagged", "missing"] as const).map((s) => (
          <div key={s} className={`tile tile--${s}`}>
            <span className="tile__count">{tiles[s]}</span>
            <span className="tile__label"><i className={`status-dot status-${s}`} />{s}</span>
          </div>
        ))}
      </section>

      <section className="dashboard__filters" aria-label="Filters">
        <label className="filter">
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="filter">
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="filter filter--grow">
          <span>Search</span>
          <input type="search" placeholder="Place, label, value, source…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </section>

      {isLoading && <p className="dashboard__status">Loading claims…</p>}
      {error && <p className="dashboard__status dashboard__status--error">Couldn't load claims: {(error as Error).message}</p>}

      {!isLoading && !error && (
        <div className="dashboard__table" role="table" aria-label="Claims">
          <div className="claim-row claim-row--head" role="row">
            <span role="columnheader">Place</span>
            <span role="columnheader">Category</span>
            <span role="columnheader">Claim</span>
            <span role="columnheader">Value</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Source</span>
          </div>
          {filtered.map((c) => (
            <div key={c.id} className="claim-row" role="row">
              <span role="cell"><strong>{c.place_name}</strong><br /><small>{c.place_id}</small></span>
              <span role="cell">{c.category}</span>
              <span role="cell">{c.label}{c.is_headline && <em className="claim-row__headline"> · headline</em>}</span>
              <span role="cell">{c.value}</span>
              <span role="cell"><span className={`status-badge status-${c.status}`}><i />{c.status}</span></span>
              <span role="cell"><small>{c.cite}</small></span>
            </div>
          ))}
          {!filtered.length && <p className="dashboard__status">No claims match the current filters.</p>}
        </div>
      )}
    </main>
  );
}
