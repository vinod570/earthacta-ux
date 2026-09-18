import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Trees, Gem, Zap, Map, ChevronRight, Info, Sparkles, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { EarthMap } from "@/components/EarthMap";
import { Button } from "@/components/ui/button";
import { NODES, type Category, type Status, type GeoNode } from "@/data/explorer-data";
import { getNode, childrenOf } from "@/data/geo-registry";
import { generateGeoInsight } from "@/lib/geo-insight.functions";
// Images live in public/assets/ and are served from the site root.
const logoAsset = { url: "/assets/earthacta-logo.svg" };
const waterAsset = { url: "/assets/earthacta-water.jpg" };
const landAsset = { url: "/assets/earthacta-land.png" };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EarthActa Explorer — Environmental Data Provenance" },
      { name: "description", content: "Explore environmental data across real geographic boundaries, with visible source and verification status." },
      { property: "og:title", content: "EarthActa Explorer" },
      { property: "og:description", content: "Environmental intelligence mapped with transparent provenance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Explorer,
});

const categories: Array<{ id: Category; label: string; icon: typeof Droplets }> = [
  { id: "water", label: "Water", icon: Droplets },
  { id: "land", label: "Land", icon: Map },
  { id: "forest", label: "Forest", icon: Trees },
  { id: "minerals", label: "Minerals", icon: Gem },
  { id: "energy", label: "Energy", icon: Zap },
];

const labels: Record<Category, { eyebrow: string; list: string }> = {
  water: { eyebrow: "Water intelligence", list: "Major rivers" },
  land: { eyebrow: "Land intelligence", list: "Land resources" },
  forest: { eyebrow: "Forest intelligence", list: "Major forests" },
  minerals: { eyebrow: "Mineral intelligence", list: "Major minerals" },
  energy: { eyebrow: "Energy intelligence", list: "Key energy sources" },
};

const statusOrder: Status[] = ["verified", "pending", "flagged", "missing"];
const statusRank: Record<Status, number> = { verified: 0, pending: 1, flagged: 2, missing: 3 };

function aggregateStatus(id: string, category: Category): Status {
  const data = NODES[id]?.[category];
  if (!data || data.kind === "none" || !data.headline) return "missing";
  return [data.headline, ...(data.stats ?? [])].reduce<Status>(
    (worst, item) => statusRank[item.status] > statusRank[worst] ? item.status : worst,
    "verified",
  );
}

function StatusBadge({ status }: { status: Status }) {
  return <span className={`status-badge status-${status}`}><i />{status}</span>;
}

const EARTH_NODE: GeoNode = {
  name: "Earth", level: "world", coords: { x: 0, y: 0 },
  water: { kind: "none" }, land: { kind: "none" }, forest: { kind: "none" },
  minerals: { kind: "none" }, energy: { kind: "none" },
};

function Explorer() {
  const [activeId, setActiveId] = useState("IN");
  const [showWorld, setShowWorld] = useState(true);
  const [category, setCategory] = useState<Category>("water");
  const [insight, setInsight] = useState<{ key: string; brief: string } | null>(null);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const requestInsight = useServerFn(generateGeoInsight);
  const resolvedNode = NODES[activeId] ?? getNode(activeId);
  const node = showWorld ? EARTH_NODE : resolvedNode;
  const effectiveId = showWorld ? "EARTH" : activeId;
  const children = useMemo(
    () => showWorld ? [{ id: "IN", name: "India" }, { id: "US", name: "United States" }] : childrenOf(activeId),
    [activeId, showWorld],
  );
  const ancestors = useMemo(() => {
    if (showWorld) return [] as Array<[string, string]>;
    const result: Array<[string, string]> = [];
    let cursor: string | undefined = activeId;
    while (cursor) {
      const cursorNode: (typeof NODES)[string] | undefined = NODES[cursor] ?? getNode(cursor);
      if (!cursorNode) break;
      result.unshift([cursor, cursorNode.name]);
      cursor = cursorNode.parent;
    }
    return result;
  }, [activeId, showWorld]);
  const background = category === "water" ? `url(${waterAsset.url})` : category === "land" ? `url(${landAsset.url})` : undefined;
  const insightKey = `${effectiveId}:${category}`;
  const currentInsight = insight?.key === insightKey ? insight.brief : null;
  if (!node) return null;
  const categoryData = node[category];

  function goToEarth() {
    setShowWorld(true);
  }

  function selectGeography(id: string) {
    setActiveId(id);
    setShowWorld(false);
  }

  async function handleGenerateInsight() {
    setIsGenerating(true);
    setInsightError(null);
    try {
      const response = await requestInsight({ data: { placeId: effectiveId, category } });
      setInsight({ key: insightKey, brief: response.brief });
    } catch (error) {
      setInsightError(error instanceof Error ? error.message : "The AI brief could not be generated.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className={`explorer explorer-${category}`} style={background ? { "--category-image": background } as React.CSSProperties : undefined}>
      <div className="map-wash" />
      <header className="brand-bar">
        <img src={logoAsset.url} alt="EarthActa" />
        <div className="brand-divider" />
        <span>Explorer</span>
      </header>

      <nav className="category-rail" aria-label="Environmental categories">
        {categories.map(({ id, label, icon: Icon }) => (
          <Button key={id} variant="ghost" className={category === id ? "rail-button rail-button-active" : "rail-button"} onClick={() => setCategory(id)} aria-pressed={category === id}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Button>
        ))}
      </nav>

      <section className="map-stage" aria-label="Interactive geographic explorer">
        <EarthMap activeId={activeId} activeCategory={category} showWorld={showWorld} nodes={NODES} onSelect={selectGeography} />
      </section>

      <aside className="place-summary">
        <div className="summary-topline"><span>{node.level}</span>{!showWorld && <StatusBadge status={aggregateStatus(activeId, category)} />}</div>
        <h2>{node.name}</h2>
        <p>{categoryData.kind === "none" ? "No verified record has been added for this category." : categoryData.headline?.label}</p>
        {categoryData.headline && <strong>{categoryData.headline.value}</strong>}
        <div className="ai-insight" aria-live="polite">
          <div className="ai-insight-heading"><Sparkles aria-hidden="true" /><span>AI field brief</span></div>
          {currentInsight ? <p>{currentInsight}</p> : insightError ? <p className="ai-insight-error">{insightError}</p> : <p>Generate a concise reading from the sourced records shown below.</p>}
          <Button variant="outline" size="sm" onClick={handleGenerateInsight} disabled={isGenerating}>
            {isGenerating ? <RefreshCw className="ai-spinner" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
            {isGenerating ? "Generating" : currentInsight ? "Refresh brief" : "Generate brief"}
          </Button>
        </div>
      </aside>

      <section className="information-band">
        <div className="band-title">
          <span className="section-label">{labels[category].eyebrow}</span>
          <h1>{node.name}</h1>
        </div>
        <div className="band-heading">
          <nav className="breadcrumbs" aria-label="Location breadcrumb">
            <Button variant="ghost" onClick={goToEarth} className="crumb-home">Earth</Button>
            {ancestors.map(([id, name]) => <span key={id}><ChevronRight /><Button variant="ghost" onClick={() => selectGeography(id)}>{name}</Button></span>)}
          </nav>
          <div className="legend" aria-label="Data status legend">
            {statusOrder.map(status => <StatusBadge status={status} key={status} />)}
          </div>
        </div>

        <div className="band-columns">
          <article className="primary-fact">
            <p className="section-label">Key fact</p>
            {categoryData.headline ? <>
              <h3>{categoryData.headline.label}</h3>
              <div className="fact-value">{categoryData.headline.value}</div>
              <div className="provenance"><StatusBadge status={categoryData.headline.status} /><span>{categoryData.headline.cite}</span></div>
            </> : <div className="empty-state"><Info /><h3>No data yet</h3><p>There is no sourced {category} record for {node.name}.</p></div>}
          </article>

          <article>
            <p className="section-label">{labels[category].list}</p>
            <div className="stat-list">
              {(categoryData.stats ?? []).map(item => <div className="stat-row" key={item.label}>
                <div><h3>{item.label}</h3><p>{item.cite}</p></div>
                <div className="stat-value"><strong>{item.value}</strong><StatusBadge status={item.status} /></div>
              </div>)}
              {!categoryData.stats?.length && categoryData.headline && <p className="quiet-copy">No additional sourced records available.</p>}
            </div>
          </article>

          <article>
            <p className="section-label">{children.length ? (showWorld ? "Countries" : node.level === "country" ? "States & regions" : activeId.startsWith("US") ? "Counties" : "Districts") : "Location context"}</p>
            {children.length ? <div className="location-list">{children.map(({ id, name }) => <Button key={id} variant="ghost" onClick={() => selectGeography(id)}>
              <span className={`location-dot status-${aggregateStatus(id, category)}`} /><span>{name}</span><ChevronRight />
              </Button>)}</div> : <div className="context-block"><p>{node.name} is the most detailed geography available in this prototype.</p><Button variant="outline" onClick={() => node.parent && selectGeography(node.parent)} disabled={!node.parent}>View parent geography</Button></div>}
          </article>
        </div>
      </section>
    </main>
  );
}
