import { feature } from "topojson-client";
import worldTopology from "@/data/world.json";
import usStatesTopology from "@/data/us-states.json";
import usCountiesTopology from "@/data/us-counties.json";
import indiaStatesJson from "@/data/india-states-official.json";
import odishaDistrictsJson from "@/data/odisha-districts.json";
import californiaCountiesJson from "@/data/california-counties.json";
import indiaDistrictsJson from "@/data/india-districts.json";
import indiaOutlineJson from "@/data/india-outline.json";
import { NODES, type GeoNode } from "@/data/explorer-data";

export type Feature = GeoJSON.Feature<GeoJSON.Geometry, Record<string, unknown>>;
export type FeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Geometry, Record<string, unknown>>;
type Topology = Parameters<typeof feature>[0];

function asCollection(features: Feature[]): FeatureCollection {
  return { type: "FeatureCollection", features };
}

// d3-geo treats polygons on the sphere: exterior rings must wind clockwise.
// The published GeoJSON files follow RFC 7946 (counter-clockwise), which d3
// reads as "everything except this shape", so rings are rewound on load.
function ringArea(ring: number[][]) {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    sum += ring[i]![0]! * ring[i + 1]![1]! - ring[i + 1]![0]! * ring[i]![1]!;
  }
  return sum / 2;
}

function rewindRings(rings: number[][][]) {
  return rings.map((ring, index) => {
    const area = ringArea(ring);
    const wrong = index === 0 ? area > 0 : area < 0;
    return wrong ? [...ring].reverse() : ring;
  });
}

function rewind<T extends Feature>(features: T[]): T[] {
  for (const shape of features) {
    const geometry = shape.geometry;
    if (geometry.type === "Polygon") {
      geometry.coordinates = rewindRings(geometry.coordinates as number[][][]);
    } else if (geometry.type === "MultiPolygon") {
      geometry.coordinates = (geometry.coordinates as number[][][][]).map(rewindRings);
    }
  }
  return features;
}

function topologyFeatures(topology: unknown, object: string): Feature[] {
  const topo = topology as { objects: Record<string, object> };
  return (feature(topo as unknown as Topology, topo.objects[object] as never) as unknown as FeatureCollection).features;
}

// ---- United States -------------------------------------------------------

const fipsToPostal: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT",
  "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL",
  "18": "IN", "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD",
  "25": "MA", "26": "MI", "27": "MN", "28": "MS", "29": "MO", "30": "MT", "31": "NE",
  "32": "NV", "33": "NH", "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
  "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
  "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA", "54": "WV",
  "55": "WI", "56": "WY", "60": "AS", "66": "GU", "69": "MP", "72": "PR", "78": "VI",
};

// Known districts/counties already carry curated NODES ids; keep them stable.
const legacyCountyIds: Record<string, string> = {
  "CA:Sacramento": "US-CA-SAC",
  "CA:San Bernardino": "US-CA-SB",
  "CA:Los Angeles": "US-CA-LA",
};

export const usStates: Feature[] = topologyFeatures(usStatesTopology, "states");
export const usStateFeatures: FeatureCollection = asCollection(usStates);
const usCountiesAll = topologyFeatures(usCountiesTopology, "counties");

const countiesByState = new Map<string, Feature[]>();
for (const shape of usCountiesAll) {
  const fips = String(shape.id ?? "");
  const postal = fipsToPostal[fips.slice(0, 2)];
  if (!postal) continue;
  const name = String(shape.properties?.["name"] ?? "");
  const nodeId = legacyCountyIds[`${postal}:${name}`] ?? `US-${postal}-${fips}`;
  shape.properties = { ...shape.properties, nodeId, displayName: `${name} County`, shortLabel: name };
  const list = countiesByState.get(postal) ?? [];
  list.push(shape);
  countiesByState.set(postal, list);
}

// ---- India ---------------------------------------------------------------

const canonicalIndiaNames: Record<string, string> = {
  Orissa: "Odisha",
  Uttaranchal: "Uttarakhand",
};

const indiaStateCodes: Record<string, string> = {
  "Andaman and Nicobar": "AN", "Andhra Pradesh": "AP", "Arunachal Pradesh": "AR",
  Assam: "AS", Bihar: "BR", Chandigarh: "CH", Chhattisgarh: "CT", Delhi: "DL",
  Goa: "GA", Gujarat: "GJ", Haryana: "HR", "Himachal Pradesh": "HP",
  "Jammu and Kashmir": "JK", Jharkhand: "JH", Karnataka: "KA", Kerala: "KL",
  Lakshadweep: "LD", "Madhya Pradesh": "MP", Maharashtra: "MH", Manipur: "MN",
  Meghalaya: "ML", Mizoram: "MZ", Nagaland: "NL", Odisha: "OD", Puducherry: "PY",
  Punjab: "PB", Rajasthan: "RJ", Sikkim: "SK", "Tamil Nadu": "TN", Tripura: "TR",
  "Uttar Pradesh": "UP", Uttarakhand: "UK", "West Bengal": "WB",
  Telangana: "TG", Ladakh: "LA",
  "Dadra and Nagar Haveli and Daman and Diu": "DH",
};

const legacyDistrictIds: Record<string, string> = {
  Cuttack: "IN-OD-CTC",
  Kendujhar: "IN-OD-KJR",
  Khordha: "IN-OD-KDA",
};

function districtSlug(name: string) {
  return name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const indiaStates: Feature[] = rewind((indiaStatesJson as unknown as FeatureCollection).features);
export const indiaStateFeatures: FeatureCollection = asCollection(indiaStates);

// District sets keyed by state id. Odisha uses its curated, finer-simplified file.
const districtsByState = new Map<string, Feature[]>();
for (const shape of rewind(odishaDistrictsJson.features as unknown as Feature[])) {
  const name = String(shape.properties?.["district"] ?? "");
  const nodeId = legacyDistrictIds[name] ?? `IN-OD-${districtSlug(name)}`;
  shape.properties = { ...shape.properties, nodeId, displayName: `${name} district`, shortLabel: name };
  const list = districtsByState.get("IN-OD") ?? [];
  list.push(shape);
  districtsByState.set("IN-OD", list);
}

const indiaDistrictSources = indiaDistrictsJson as { states: Record<string, Feature[]> };
const districtSourceToState: Record<string, string> = {
  "andaman-and-nicobar-islands": "IN-AN", "andhra-pradesh": "IN-AP", "arunachal-pradesh": "IN-AR",
  assam: "IN-AS", bihar: "IN-BR", chandigarh: "IN-CH", chhattisgarh: "IN-CT", delhi: "IN-DL",
  goa: "IN-GA", gujarat: "IN-GJ", haryana: "IN-HR", "himachal-pradesh": "IN-HP",
  "jammu-and-kashmir": "IN-JK", jharkhand: "IN-JH", karnataka: "IN-KA", kerala: "IN-KL",
  ladakh: "IN-LA", lakshadweep: "IN-LD", "madhya-pradesh": "IN-MP", maharashtra: "IN-MH",
  manipur: "IN-MN", meghalaya: "IN-ML", mizoram: "IN-MZ", nagaland: "IN-NL",
  puducherry: "IN-PY", punjab: "IN-PB", rajasthan: "IN-RJ", sikkim: "IN-SK",
  "tamil-nadu": "IN-TN", telangana: "IN-TG", tripura: "IN-TR", "uttar-pradesh": "IN-UP",
  uttarakhand: "IN-UK", "west-bengal": "IN-WB",
  "dnh-and-dd": "IN-DH",
};
for (const [slug, stateId] of Object.entries(districtSourceToState)) {
  const features = indiaDistrictSources.states[slug];
  if (!features) continue;
  rewind(features);
  for (const shape of features) {
    const name = String(shape.properties?.["district"] ?? "");
    shape.properties = { ...shape.properties, nodeId: `IN-${stateId.slice(3)}-${districtSlug(name)}`, displayName: `${name} district`, shortLabel: name };
  }
  districtsByState.set(stateId, features);
}

const californiaFeatures = rewind((californiaCountiesJson as unknown as FeatureCollection).features);
for (const shape of californiaFeatures) {
  const name = String(shape.properties?.["name"] ?? "");
  shape.properties = { ...shape.properties, nodeId: legacyCountyIds[`CA:${name}`] ?? `US-CA-${districtSlug(name)}`, displayName: `${name} County`, shortLabel: name };
}
const usCaCounties: Feature[] = californiaFeatures;

// ---- World ---------------------------------------------------------------

export const worldFeatures = asCollection(topologyFeatures(worldTopology, "countries"));
const worldIds: Record<string, string> = {
  India: "IN",
  "United States of America": "US",
};
for (const shape of worldFeatures.features) {
  const name = String(shape.properties?.["name"] ?? "");
  const nodeId = worldIds[name];
  if (nodeId) shape.properties = { ...shape.properties, nodeId, shortLabel: name === "United States of America" ? "United States" : name };
}

// India on the world map uses the official Indian outline (full Jammu & Kashmir
// and Ladakh), drawn last so it sits above the neighbouring country shapes.
{
  const officialIndia = rewind((indiaOutlineJson as unknown as FeatureCollection).features)[0];
  if (officialIndia) {
    officialIndia.properties = { name: "India", nodeId: "IN", shortLabel: "India" };
    worldFeatures.features = [
      ...worldFeatures.features.filter((shape) => shape.properties?.["nodeId"] !== "IN"),
      officialIndia,
    ];
  }
}

// ---- State & district boundaries for the US states ------------------------

for (const shape of usStates) {
  const fips = String(shape.id ?? "");
  const postal = fipsToPostal[fips];
  if (!postal) continue;
  shape.properties = { ...shape.properties, nodeId: `US-${postal}`, shortLabel: postal };
}
for (const shape of indiaStates) {
  const raw = String(shape.properties?.["name"] ?? shape.properties?.["NAME_1"] ?? "");
  const canonical = canonicalIndiaNames[raw] ?? raw;
  const code = indiaStateCodes[canonical];
  shape.properties = { ...shape.properties, nodeId: code ? `IN-${code}` : undefined, displayName: canonical };
}

// ---- Registry: every geography gets a name, level and parent --------------

type GeoEntry = { name: string; level: GeoNode["level"]; parent?: string };
const registry = new Map<string, GeoEntry>();

for (const shape of usStates) {
  const fips = String(shape.id ?? "");
  const postal = fipsToPostal[fips];
  if (postal) registry.set(`US-${postal}`, { name: String(shape.properties?.["name"] ?? postal), level: "region", parent: "US" });
}
for (const shape of indiaStates) {
  const id = shape.properties?.["nodeId"] as string | undefined;
  if (id) registry.set(id, { name: String(shape.properties?.["displayName"] ?? ""), level: "region", parent: "IN" });
}
for (const [postal, list] of countiesByState) {
  for (const shape of list) {
    const id = shape.properties?.["nodeId"] as string;
    registry.set(id, { name: `${String(shape.properties?.["name"])} County`, level: "district", parent: `US-${postal}` });
  }
}
for (const [stateId, list] of districtsByState) {
  for (const shape of list) {
    const id = shape.properties?.["nodeId"] as string;
    if (!NODES[id]) registry.set(id, { name: String(shape.properties?.["displayName"]), level: "district", parent: stateId });
  }
}

const emptyCategory = { kind: "none" };

function syntheticNode(id: string, entry: GeoEntry): GeoNode {
  return {
    name: entry.name, level: entry.level, coords: { x: 0, y: 0 },
    ...(entry.parent ? { parent: entry.parent } : {}),
    water: emptyCategory, land: emptyCategory, forest: emptyCategory,
    minerals: emptyCategory, energy: emptyCategory,
  };
}

export function getNode(id: string): GeoNode | undefined {
  return NODES[id] ?? (registry.has(id) ? syntheticNode(id, registry.get(id)!) : undefined);
}

export function childrenOf(id: string): Array<{ id: string; name: string }> {
  const result: Array<{ id: string; name: string }> = [];
  for (const [childId, entry] of registry) {
    if (entry.parent !== id) continue;
    const curated = NODES[childId];
    result.push({ id: childId, name: curated?.name ?? entry.name });
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export function childCollection(id: string): FeatureCollection | undefined {
  // County collections are keyed by postal code ("TX"); ids arrive as "US-TX".
  const countyKey = id.startsWith("US-") ? id.slice(3) : id;
  const features = countiesByState.get(countyKey) ?? districtsByState.get(id) ?? (id === "US-CA" ? usCaCounties : undefined);
  return features ? asCollection(features) : undefined;
}
