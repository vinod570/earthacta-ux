import { useEffect, useRef, useState } from "react";
import { geoAlbersUsa, geoCentroid, geoEqualEarth, geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { worldFeatures, usStateFeatures, indiaStateFeatures, childCollection, getNode, type FeatureCollection } from "@/data/geo-registry";
import type { Category, GeoNode, Status } from "@/data/explorer-data";

const statusRank: Record<Status, number> = { verified: 0, pending: 1, flagged: 2, missing: 3 };
const MIN_SCALE = 1;
const MAX_SCALE = 8;

function nodeStatus(node: GeoNode | undefined, category: Category): Status {
  if (!node) return "missing";
  const data = node[category];
  if (data.kind === "none" || !data.headline) return "missing";
  return [data.headline, ...(data.stats ?? [])].reduce<Status>(
    (worst, fact) => (statusRank[fact.status] > statusRank[worst] ? fact.status : worst),
    "verified",
  );
}

function statusClass(status: Status) {
  return `map-status-${status}`;
}

function featureName(shape: GeoJSON.Feature<GeoJSON.Geometry, Record<string, unknown>>) {
  return String(shape.properties?.["displayName"] ?? shape.properties?.["name"] ?? shape.properties?.["NAME_1"] ?? "");
}

function featureLabel(shape: GeoJSON.Feature<GeoJSON.Geometry, Record<string, unknown>>) {
  return String(shape.properties?.["shortLabel"] ?? featureName(shape));
}

export function EarthMap({ activeId, activeCategory, showWorld, nodes, onSelect }: {
  activeId: string;
  activeCategory: Category;
  showWorld: boolean;
  nodes: Record<string, GeoNode>;
  onSelect: (id: string) => void;
}) {
  // World view spins around its axis instead of panning off into empty space.
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    setRotation(0);
  }, [activeId, showWorld]);

  const node = nodes[activeId] ?? getNode(activeId);
  const collection = viewCollection(activeId, showWorld);
  const projection = showWorld ? geoEqualEarth() : activeId.startsWith("US") ? geoAlbersUsa() : geoMercator();
  if (!node || !collection) return null;

  // Fill the whole map frame edge to edge, in every view.
  projection.fitExtent([[0, 20], [1000, 500]], collection as GeoPermissibleObjects);
  if (showWorld && rotation !== 0) {
    // Keep the fitted scale/translate so spinning never rescales the map.
    const scale = projection.scale();
    const translate = projection.translate();
    projection.rotate([rotation, 0, 0]).scale(scale).translate(translate);
  }
  const path = geoPath(projection);

  // Anchor labels on the geographic centre so they ride with the shape instead of
  // jumping when a rotated shape is split at the edge of the map.
  const labelPoint = (shape: GeoJSON.Feature<GeoJSON.Geometry, Record<string, unknown>>) => {
    const projected = projection(geoCentroid(shape as GeoPermissibleObjects as never));
    if (projected && Number.isFinite(projected[0]) && Number.isFinite(projected[1])) return projected;
    const fallback = path.centroid(shape as GeoPermissibleObjects);
    return [fallback[0], fallback[1]] as [number, number];
  };

  return (
    <MapSurface
      activeId={activeId}
      activeCategory={activeCategory}
      nodes={nodes}
      onSelect={onSelect}
      collection={collection}
      path={path}
      labelPoint={labelPoint}
      viewLabel={node.name}
      showWorld={showWorld}
      rotation={rotation}
      onRotate={setRotation}
    />
  );
}

function viewCollection(activeId: string, showWorld: boolean): FeatureCollection | undefined {
  if (showWorld) return worldFeatures;
  if (activeId === "US") return usStateFeatures;
  if (activeId === "IN") return indiaStateFeatures;
  const own = childCollection(activeId);
  if (own) return own;
  const parent = getNode(activeId)?.parent;
  return parent ? childCollection(parent) : undefined;
}

type MapSurfaceProps = {
  activeId: string;
  activeCategory: Category;
  nodes: Record<string, GeoNode>;
  onSelect: (id: string) => void;
  collection: FeatureCollection;
  path: ReturnType<typeof geoPath>;
  labelPoint: (shape: GeoJSON.Feature<GeoJSON.Geometry, Record<string, unknown>>) => [number, number] | null;
  viewLabel: string;
  showWorld: boolean;
  rotation: number;
  onRotate: (deg: number) => void;
};

// Keep at least this much of the map inside the frame so it can never be
// dragged out of sight leaving a blank canvas.
function clampView(v: { x: number; y: number; k: number }) {
  const maxX = 1000 * 0.35;
  const maxY = 560 * 0.35;
  return {
    k: v.k,
    x: Math.min(maxX, Math.max(-(1000 * v.k - 1000) - maxX, v.x)),
    y: Math.min(maxY, Math.max(-(560 * v.k - 560) - maxY, v.y)),
  };
}

function MapSurface({
  activeId,
  activeCategory,
  nodes,
  onSelect,
  collection,
  path,
  labelPoint,
  viewLabel,
  showWorld,
  rotation,
  onRotate,
}: MapSurfaceProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const drag = useRef<{ px: number; py: number; vx: number; vy: number; r0: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });

  // Recentre the view whenever the map refocuses on a new geography.
  useEffect(() => {
    setView({ x: 0, y: 0, k: 1 });
  }, [activeId]);

  // Wheel zoom anchored at the cursor; non-passive so the page doesn't scroll.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = svg.getBoundingClientRect();
      const sx = ((event.clientX - rect.left) / rect.width) * 1000;
      const sy = ((event.clientY - rect.top) / rect.height) * 560;
      setView((v) => {
        const k = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.k * Math.exp(-event.deltaY * 0.0015)));
        const ratio = k / v.k;
        return clampView({ k, x: sx - (sx - v.x) * ratio, y: sy - (sy - v.y) * ratio });
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  function toSvgCoords(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 1000,
      y: ((clientY - rect.top) / rect.height) * 560,
    };
  }

  function onPointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault(); // stop the drag from selecting page text
    drag.current = { px: event.clientX, py: event.clientY, vx: view.x, vy: view.y, r0: rotation, moved: false };
    suppressClick.current = false;
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      if (Math.abs(e.clientX - d.px) + Math.abs(e.clientY - d.py) > 3) d.moved = true;
      const start = toSvgCoords(d.px, d.py);
      const now = toSvgCoords(e.clientX, e.clientY);
      const dx = now.x - start.x;
      const dy = now.y - start.y;
      if (showWorld) {
        // Sideways drag spins the globe: pull right and Asia comes into view.
        let deg = (d.r0 + (dx * 360) / (920 * view.k)) % 360;
        if (deg > 180) deg -= 360;
        if (deg < -180) deg += 360;
        onRotate(deg);
        setView((v) => clampView({ ...v, x: d.vx, y: d.vy + dy }));
        return;
      }
      setView((v) => clampView({ ...v, x: d.vx + dx, y: d.vy + dy }));
    };
    const onEnd = () => {
      suppressClick.current = Boolean(drag.current?.moved);
      drag.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  }

  function handleSelect(id: string) {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    onSelect(id);
  }

  // Only label shapes with enough room for their text, so dense views stay legible.
  const labelled = collection.features
    .filter((shape) => Boolean(shape.properties?.["nodeId"]))
    .filter((shape) => shape.properties?.["nodeId"] !== activeId)
    .map((shape) => {
      const point = labelPoint(shape) ?? [NaN, NaN];
      return { shape, x: point[0], y: point[1], area: path.area(shape as GeoPermissibleObjects) };
    })
    .filter((entry) => Number.isFinite(entry.x) && Number.isFinite(entry.y))
    .filter((entry) => entry.x > 4 && entry.x < 996 && entry.y > 4 && entry.y < 556)
    .sort((a, b) => b.area - a.area);

  const fontSize = 12 / view.k;
  const visibleLabels: typeof labelled = [];
  for (const entry of labelled) {
    const halfWidth = (featureLabel(entry.shape).length * fontSize * 0.3) + 2 / view.k;
    const halfHeight = fontSize * 0.85;
    if (entry.area * view.k * view.k < 320) continue;
    const clash = visibleLabels.some(
      (kept) =>
        Math.abs(kept.x - entry.x) < halfWidth + (featureLabel(kept.shape).length * fontSize * 0.3) &&
        Math.abs(kept.y - entry.y) < halfHeight * 2,
    );
    if (!clash) visibleLabels.push(entry);
  }

  return (
    <svg
      ref={svgRef}
      className="h-full w-full map-svg"
      viewBox="0 0 1000 560"
      role="img"
      aria-label={`Geographic boundaries centered on ${viewLabel}. Drag to pan, scroll to zoom.`}
      onPointerDown={onPointerDown}
    >
      <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
        <g>
          {collection.features.map((shape, index) => {
            const nodeId = shape.properties?.["nodeId"] as string | undefined;
            const interactive = Boolean(nodeId);
            const geoNode = nodeId ? getNode(nodeId) : undefined;
            const selected = nodeId === activeId;
            return (
              <path
                key={`${featureName(shape)}-${index}`}
                d={path(shape as GeoPermissibleObjects) ?? undefined}
                className={`map-shape ${interactive && geoNode ? statusClass(nodeStatus(nodes[nodeId!] ?? geoNode, activeCategory)) : "map-shape-muted"} ${selected ? "map-shape-selected" : ""}`}
                onClick={interactive && nodeId ? () => handleSelect(nodeId) : undefined}
                onKeyDown={interactive && nodeId ? (event) => { if (event.key === "Enter" || event.key === " ") handleSelect(nodeId); } : undefined}
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : undefined}
                aria-label={interactive && nodeId ? `Explore ${geoNode?.name ?? featureName(shape)}` : undefined}
              />
            );
          })}
        </g>
        <g className="map-labels" aria-hidden="true">
          {visibleLabels.map(({ shape, x, y }, index) => (
            <text
              key={`${featureName(shape)}-${index}`}
              x={x}
              y={y}
              style={{ fontSize: `${fontSize}px`, strokeWidth: `${4 / view.k}px` }}
            >
              {featureLabel(shape)}
            </text>
          ))}
        </g>
      </g>
    </svg>
  );
}
