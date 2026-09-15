/* ==========================================================
   EarthActa Explorer — region/category data
   Hierarchy: country -> region/state -> district (3 levels).
   Selecting ANY node changes data for ALL FOUR categories at
   once (region selection is independent of category — see
   renderPanel() in explorer.html).

   This file is intentionally separate from rendering logic
   (explorer.html) so new regions/districts can be added here
   without touching any DOM/render code.
   ========================================================== */
const NODES = {

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
  }
};
