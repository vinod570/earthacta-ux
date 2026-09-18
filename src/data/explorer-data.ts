export type Status = "verified" | "pending" | "flagged" | "missing";
export type Category = "water" | "land" | "forest" | "minerals" | "energy";
export type Fact = { label: string; value: string; status: Status; cite: string };
export type CategoryData = { kind: string; headline?: Fact; stats?: Fact[] };
export type GeoNode = { name: string; level: "world" | "country" | "region" | "district"; parent?: string; coords: { x: number; y: number }; water: CategoryData; land: CategoryData; forest: CategoryData; minerals: CategoryData; energy: CategoryData };

export const NODES: Record<string, GeoNode> = {

  "IN": {
    name: "India", level: "country", coords:{x:64, y:42},
    water: { kind:"india_water" },
    land:  { kind:"india_land" },
    forest: { kind:"matrix", headline:{label:"Total forest cover", value:"24.6%", status:"verified", cite:"India State of Forest Report · 2023"},
              stats:[ {label:"Protected forest area", value:"172,000 km²", status:"verified", cite:"Forest Survey of India · 2023"},
                      {label:"Annual deforestation rate", value:"0.05%", status:"pending", cite:"estimate varies by state reporting cadence"} ] },
    minerals: { kind:"none" },
    energy:   { kind:"none" }
  },
  "IN-OD": {
    name: "Odisha", level: "region", parent:"IN", coords:{x:68, y:52},
    water:    { kind:"matrix", headline:{label:"Major rivers", value:"11", status:"verified", cite:"Odisha Water Resources Dept · 2025"},
                stats:[ {label:"Groundwater extraction", value:"4,230 MCM/yr", status:"pending", cite:"CGWB · 2023 (2+ yrs old)"},
                        {label:"Surface storage capacity", value:"18,900 MCM", status:"verified", cite:"Odisha Water Resources Dept · 2025"} ] },
    land:     { kind:"matrix", headline:{label:"Forest cover", value:"33.5%", status:"verified", cite:"India State of Forest Report · 2023"},
                stats:[ {label:"Agricultural land", value:"38.0%", status:"pending", cite:"Directorate of Agriculture · 2022"},
                        {label:"Coastline length", value:"480 km", status:"verified", cite:"Odisha CZMA · 2024"} ] },
    forest:   { kind:"matrix", headline:{label:"Dense forest area", value:"27,700 km²", status:"verified", cite:"Odisha Forest Dept · 2023"},
                stats:[ {label:"Reserved forest share", value:"57%", status:"verified", cite:"Odisha Forest Dept · 2023"},
                        {label:"Forest fire incidents (2025-26 season)", value:"1,840", status:"flagged", cite:"provisional count; final tally pending"} ] },
    minerals: { kind:"matrix", headline:{label:"Coal reserves", value:"84,865 Mt", status:"verified", cite:"Indian Bureau of Mines · 2024"},
                stats:[ {label:"Bauxite reserves", value:"no estimate", status:"missing", cite:"no recent assessment"} ] },
    energy:   { kind:"matrix", headline:{label:"Renewable share", value:"21.4%", status:"flagged", cite:"GRIDCO portal total mismatches plant-level sum"},
                stats:[ {label:"Installed capacity", value:"10,658 MW", status:"verified", cite:"GRIDCO / CEA · 2026"} ] }
  },
  "IN-OD-CTC": {
    name: "Cuttack district", level: "district", parent:"IN-OD", coords:{x:69.5, y:53.5},
    water:    { kind:"matrix", headline:{label:"Mahanadi inflow (Naraj barrage)", value:"1,240 m³/s", status:"verified", cite:"Odisha Water Resources Dept gauge · Sep 2026"},
                stats:[ {label:"Mahanadi outflow (downstream delta head)", value:"1,180 m³/s", status:"verified", cite:"Same gauge network · Sep 2026"},
                        {label:"Local groundwater extraction", value:"210 MCM/yr", status:"pending", cite:"District Groundwater Cell · 2023"} ] },
    land:     { kind:"matrix", headline:{label:"Net cultivated area", value:"64%", status:"verified", cite:"Cuttack District Statistical Handbook · 2024"},
                stats:[ {label:"Flood-prone area (delta zone)", value:"18%", status:"flagged", cite:"revised after 2024 monsoon; older maps understate this"} ] },
    forest:   { kind:"matrix", headline:{label:"Forest cover (district)", value:"6.2%", status:"verified", cite:"Odisha Forest Dept district data · 2023"},
                stats:[ {label:"Mangrove patch area (delta)", value:"14 km²", status:"pending", cite:"last surveyed 2021"} ] },
    minerals: { kind:"none" },
    energy:   { kind:"matrix", headline:{label:"Local grid substations", value:"6", status:"verified", cite:"GRIDCO district asset list · 2026"},
                stats:[ {label:"Peak local demand", value:"180 MW", status:"pending", cite:"estimate, not directly metered per district"} ] }
  },
  "IN-OD-KJR": {
    name: "Keonjhar district", level: "district", parent:"IN-OD", coords:{x:67, y:50},
    water:    { kind:"matrix", headline:{label:"Baitarani inflow (upper catchment)", value:"310 m³/s", status:"pending", cite:"Odisha Water Resources Dept gauge · 2024 (last full-season reading)"},
                stats:[ {label:"Baitarani outflow (district boundary)", value:"460 m³/s", status:"flagged", cite:"higher than inflow — likely tributary contribution not yet reconciled"},
                        {label:"Mine-affected water quality zones", value:"14", status:"flagged", cite:"Odisha Pollution Control Board · 2025" } ] },
    land:     { kind:"matrix", headline:{label:"Land under active mining lease", value:"9.8%", status:"verified", cite:"Directorate of Mines, Odisha · 2025"},
                stats:[ {label:"Net cultivated area", value:"31%", status:"pending", cite:"Keonjhar District Statistical Handbook · 2022"} ] },
    forest:   { kind:"matrix", headline:{label:"Forest cover (district)", value:"46.1%", status:"verified", cite:"Odisha Forest Dept district data · 2023"},
                stats:[ {label:"Forest area overlapping mining leases", value:"6.4%", status:"flagged", cite:"cross-referenced from mining + forest datasets, not a single official figure"} ] },
    minerals: { kind:"matrix", headline:{label:"Iron ore reserves", value:"2,290 Mt", status:"verified", cite:"Indian Bureau of Mines — Keonjhar district profile · 2024"},
                stats:[ {label:"Chromite reserves", value:"186 Mt", status:"verified", cite:"Indian Bureau of Mines · 2024"},
                        {label:"Active mining leases", value:"87", status:"pending", cite:"Directorate of Mines, Odisha · 2025" } ] },
    energy:   { kind:"matrix", headline:{label:"Local grid substations", value:"11", status:"verified", cite:"GRIDCO district asset list · 2026"},
                stats:[ {label:"Captive power (mine-linked)", value:"340 MW", status:"pending", cite:"aggregated from individual mine filings, not centrally metered"} ] }
  },
  "IN-OD-KDA": {
    name: "Khordha district", level: "district", parent:"IN-OD", coords:{x:68.5, y:54.5},
    water:    { kind:"matrix", headline:{label:"Kuakhai inflow (Bhubaneswar reach)", value:"85 m³/s", status:"verified", cite:"Odisha Water Resources Dept gauge · Sep 2026"},
                stats:[ {label:"Kuakhai outflow (district boundary)", value:"79 m³/s", status:"verified", cite:"Same gauge network · Sep 2026"},
                        {label:"Municipal water demand (Bhubaneswar)", value:"180 MLD", status:"pending", cite:"Bhubaneswar Municipal Corporation estimate · 2024"} ] },
    land:     { kind:"matrix", headline:{label:"Urbanized land share", value:"41%", status:"verified", cite:"Odisha Town Planning Dept · 2024"},
                stats:[ {label:"Net cultivated area", value:"22%", status:"verified", cite:"Khordha District Statistical Handbook · 2024"} ] },
    forest:   { kind:"matrix", headline:{label:"Forest cover (district)", value:"18.4%", status:"pending", cite:"Odisha Forest Dept district data · 2021 (not yet updated in latest state survey)"},
                stats:[ {label:"Urban green cover (Bhubaneswar)", value:"12%", status:"missing", cite:"no recent municipal survey identified"} ] },
    minerals: { kind:"none" },
    energy:   { kind:"matrix", headline:{label:"Local grid substations", value:"14", status:"verified", cite:"GRIDCO district asset list · 2026"},
                stats:[ {label:"Peak local demand (state capital region)", value:"410 MW", status:"verified", cite:"GRIDCO / CEA · 2026"} ] }
  },

  "US": {
    name: "United States", level: "country", coords:{x:20, y:35},
    water: { kind:"none" },
    land:  { kind:"none" },
    forest: { kind:"matrix", headline:{label:"Total forest cover", value:"33.9%", status:"verified", cite:"USDA Forest Service · 2024"},
              stats:[ {label:"National forest system area", value:"780,000 km²", status:"verified", cite:"USDA Forest Service · 2024"},
                      {label:"Wildfire-burned area (2025)", value:"28,400 km²", status:"flagged", cite:"NIFC · provisional, updated through Dec 2025"} ] },
    minerals: { kind:"none" },
    energy:   { kind:"none" }
  },
  "US-CA": {
    name: "California", level: "region", parent:"US", coords:{x:14, y:44},
    water:    { kind:"matrix", headline:{label:"Major rivers", value:"14", status:"verified", cite:"CA Dept of Water Resources · 2025"},
                stats:[ {label:"Groundwater extraction", value:"16,500 MCM/yr", status:"verified", cite:"SGMA reporting · 2025"},
                        {label:"Surface storage capacity", value:"51,000 MCM", status:"verified", cite:"CA DWR · 2025"} ] },
    land:     { kind:"matrix", headline:{label:"Forest cover", value:"33.0%", status:"verified", cite:"USDA Forest Service · 2024"},
                stats:[ {label:"Agricultural land", value:"25.0%", status:"verified", cite:"USDA NASS · 2024"},
                        {label:"Coastline length", value:"1,350 km", status:"verified", cite:"NOAA · 2023"} ] },
    forest:   { kind:"matrix", headline:{label:"Forested area", value:"133,000 km²", status:"verified", cite:"CAL FIRE · 2024"},
                stats:[ {label:"Old-growth protected area", value:"48,000 acres", status:"verified", cite:"CAL FIRE · 2023"},
                        {label:"2025 wildfire-burned area", value:"6,100 km²", status:"flagged", cite:"CAL FIRE incident data · provisional"} ] },
    minerals: { kind:"matrix", headline:{label:"Global boron share", value:"24%", status:"verified", cite:"USGS · 2025"},
                stats:[ {label:"Gold reserves", value:"no estimate", status:"missing", cite:"no source identified"} ] },
    energy:   { kind:"matrix", headline:{label:"Renewable share", value:"54.0%", status:"verified", cite:"CA Energy Commission · 2026"},
                stats:[ {label:"Installed capacity", value:"87,000 MW", status:"verified", cite:"CA Energy Commission · 2026"} ] }
  },
  "US-CA-SAC": {
    name: "Sacramento County", level: "district", parent:"US-CA", coords:{x:15, y:43},
    water:    { kind:"matrix", headline:{label:"American River inflow (Fair Oaks gauge)", value:"92 m³/s", status:"verified", cite:"USGS gauge 11446500 · Sep 2026"},
                stats:[ {label:"American River outflow (confluence w/ Sacramento R.)", value:"88 m³/s", status:"verified", cite:"USGS gauge network · Sep 2026"},
                        {label:"Local groundwater extraction", value:"340 MCM/yr", status:"verified", cite:"Sacramento Central Groundwater Authority · 2025"} ] },
    land:     { kind:"matrix", headline:{label:"Urbanized land share", value:"46%", status:"verified", cite:"Sacramento County GIS · 2024"},
                stats:[ {label:"Flood-plain managed area", value:"12%", status:"pending", cite:"levee recertification in progress · 2025"} ] },
    forest:   { kind:"matrix", headline:{label:"Urban tree canopy cover", value:"19%", status:"verified", cite:"Sacramento Tree Foundation survey · 2023"},
                stats:[ {label:"Riparian forest along American River", value:"23 km", status:"pending", cite:"last mapped 2020"} ] },
    minerals: { kind:"none" },
    energy:   { kind:"matrix", headline:{label:"Local grid substations", value:"9", status:"verified", cite:"SMUD asset map · 2026"},
                stats:[ {label:"Peak local demand", value:"1,150 MW", status:"verified", cite:"SMUD system peak · Aug 2026"} ] }
  },
  "US-CA-SB": {
    name: "San Bernardino County", level: "district", parent:"US-CA", coords:{x:13, y:47},
    water:    { kind:"matrix", headline:{label:"Mojave River flow (Victorville gauge)", value:"0 m³/s (dry channel)", status:"flagged", cite:"USGS gauge 10261500 · Sep 2026 — surface flow only during storm events"},
                stats:[ {label:"Groundwater basin storage change", value:"-38,000 acre-ft/yr", status:"verified", cite:"Mojave Water Agency · 2025"},
                        {label:"Imported water share (State Water Project)", value:"62%", status:"pending", cite:"Mojave Water Agency estimate · 2024"} ] },
    land:     { kind:"matrix", headline:{label:"Desert/undeveloped land share", value:"81%", status:"verified", cite:"San Bernardino County Land Use Dept · 2024"},
                stats:[ {label:"Urbanized land share", value:"9%", status:"verified", cite:"San Bernardino County Land Use Dept · 2024"} ] },
    forest:   { kind:"matrix", headline:{label:"Forest cover (district)", value:"4.1%", status:"verified", cite:"CAL FIRE · 2024"},
                stats:[ {label:"Desert scrub/Joshua tree habitat", value:"58%", status:"pending", cite:"BLM habitat survey · 2022"} ] },
    minerals: { kind:"matrix", headline:{label:"Borate reserves (Boron mine)", value:"~50% of world supply", status:"verified", cite:"U.S. Borax / Rio Tinto public disclosures · 2025"},
                stats:[ {label:"Active open-pit mining area", value:"7.1 km²", status:"verified", cite:"San Bernardino County Mining Dept · 2024"},
                        {label:"Rare earth exploration claims", value:"12 active", status:"pending", cite:"BLM claims database · 2025"} ] },
    energy:   { kind:"matrix", headline:{label:"Utility-scale solar capacity", value:"1,850 MW", status:"verified", cite:"CA Energy Commission · 2026"},
                stats:[ {label:"Local grid substations", value:"7", status:"pending", cite:"partial asset list — county spans multiple utility territories"} ] }
  },
  "US-CA-LA": {
    name: "Los Angeles County", level: "district", parent:"US-CA", coords:{x:12.5, y:48.5},
    water:    { kind:"matrix", headline:{label:"LA River flow (Sepulveda gauge)", value:"4.2 m³/s", status:"verified", cite:"USGS gauge 11092450 · Sep 2026"},
                stats:[ {label:"LA River outflow (Long Beach estuary)", value:"5.8 m³/s", status:"flagged", cite:"higher than upstream gauge — storm-drain inflow along the channelized reach not separately metered"},
                        {label:"Imported water share (Metropolitan Water District)", value:"58%", status:"verified", cite:"MWD annual report · 2025"} ] },
    land:     { kind:"matrix", headline:{label:"Urbanized land share", value:"73%", status:"verified", cite:"LA County Dept of Regional Planning · 2024"},
                stats:[ {label:"Net cultivated area", value:"1.2%", status:"verified", cite:"USDA NASS · 2024"} ] },
    forest:   { kind:"matrix", headline:{label:"Urban tree canopy cover", value:"21%", status:"pending", cite:"LA County Regional Park & Open Space District · 2022"},
                stats:[ {label:"Angeles National Forest area (district portion)", value:"1,750 km²", status:"verified", cite:"USDA Forest Service · 2024"} ] },
    minerals: { kind:"none" },
    energy:   { kind:"matrix", headline:{label:"Peak local demand", value:"6,200 MW", status:"verified", cite:"LADWP / CAISO system peak · Aug 2026"},
                stats:[ {label:"Local grid substations", value:"38", status:"pending", cite:"aggregated across LADWP + SCE territories, not a single asset list"} ] }
  }
};
