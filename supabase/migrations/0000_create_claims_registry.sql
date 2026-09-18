
-- Claims registry: one row per environmental data claim, keyed to a place_id
-- that matches the map's boundary node ids (IN, US, IN-OD, US-CA, IN-OD-CTC, ...).
create table public.claims (
  id uuid primary key default gen_random_uuid(),
  place_id text not null,
  place_name text not null,
  place_level text not null check (place_level in ('country','region','district')),
  category text not null check (category in ('water','land','forest','minerals','energy')),
  label text not null,
  value text not null,
  status text not null check (status in ('verified','pending','flagged','missing')),
  cite text not null,
  is_headline boolean not null default false,
  created_at timestamptz not null default now()
);

create index claims_place_category_idx on public.claims (place_id, category);
create index claims_status_idx on public.claims (status);

grant select on public.claims to anon, authenticated;
grant all on public.claims to service_role;

alter table public.claims enable row level security;

create policy "claims are publicly readable"
  on public.claims for select
  to anon, authenticated
  using (true);

-- ============ Seed: hand-authored NODES claims ============

insert into public.claims (place_id, place_name, place_level, category, label, value, status, cite, is_headline) values
-- India country
('IN','India','country','forest','Total forest cover','24.6%','verified','India State of Forest Report · 2023', true),
('IN','India','country','forest','Protected forest area','172,000 km²','verified','Forest Survey of India · 2023', false),
('IN','India','country','forest','Annual deforestation rate','0.05%','pending','estimate varies by state reporting cadence', false),
-- Odisha
('IN-OD','Odisha','region','water','Major rivers','11','verified','Odisha Water Resources Dept · 2025', true),
('IN-OD','Odisha','region','water','Groundwater extraction','4,230 MCM/yr','pending','CGWB · 2023 (2+ yrs old)', false),
('IN-OD','Odisha','region','water','Surface storage capacity','18,900 MCM','verified','Odisha Water Resources Dept · 2025', false),
('IN-OD','Odisha','region','land','Forest cover','33.5%','verified','India State of Forest Report · 2023', true),
('IN-OD','Odisha','region','land','Agricultural land','38.0%','pending','Directorate of Agriculture · 2022', false),
('IN-OD','Odisha','region','land','Coastline length','480 km','verified','Odisha CZMA · 2024', false),
('IN-OD','Odisha','region','forest','Dense forest area','27,700 km²','verified','Odisha Forest Dept · 2023', true),
('IN-OD','Odisha','region','forest','Reserved forest share','57%','verified','Odisha Forest Dept · 2023', false),
('IN-OD','Odisha','region','forest','Forest fire incidents (2025-26)','1,840','flagged','provisional count; final tally pending', false),
('IN-OD','Odisha','region','minerals','Coal reserves','84,865 Mt','verified','Indian Bureau of Mines · 2024', true),
('IN-OD','Odisha','region','minerals','Bauxite reserves','no estimate','missing','no recent assessment', false),
('IN-OD','Odisha','region','energy','Renewable share','21.4%','flagged','GRIDCO portal total mismatches plant-level sum', true),
('IN-OD','Odisha','region','energy','Installed capacity','10,658 MW','verified','GRIDCO / CEA · 2026', false),
-- Cuttack
('IN-OD-CTC','Cuttack district','district','water','Mahanadi inflow (Naraj barrage)','1,240 m³/s','verified','Odisha Water Resources Dept gauge · Sep 2026', true),
('IN-OD-CTC','Cuttack district','district','water','Mahanadi outflow (delta head)','1,180 m³/s','verified','Same gauge network · Sep 2026', false),
('IN-OD-CTC','Cuttack district','district','water','Local groundwater extraction','210 MCM/yr','pending','District Groundwater Cell · 2023', false),
('IN-OD-CTC','Cuttack district','district','land','Net cultivated area','64%','verified','Cuttack District Statistical Handbook · 2024', true),
('IN-OD-CTC','Cuttack district','district','land','Flood-prone area (delta)','18%','flagged','revised after 2024 monsoon; older maps understate this', false),
('IN-OD-CTC','Cuttack district','district','forest','Forest cover (district)','6.2%','verified','Odisha Forest Dept district data · 2023', true),
('IN-OD-CTC','Cuttack district','district','forest','Mangrove patch area (delta)','14 km²','pending','last surveyed 2021', false),
('IN-OD-CTC','Cuttack district','district','energy','Local grid substations','6','verified','GRIDCO district asset list · 2026', true),
('IN-OD-CTC','Cuttack district','district','energy','Peak local demand','180 MW','pending','estimate, not directly metered per district', false),
-- Keonjhar
('IN-OD-KJR','Keonjhar district','district','water','Baitarani inflow (upper catchment)','310 m³/s','pending','Odisha Water Resources Dept gauge · 2024', true),
('IN-OD-KJR','Keonjhar district','district','water','Baitarani outflow (district boundary)','460 m³/s','flagged','higher than inflow — tributary contribution unreconciled', false),
('IN-OD-KJR','Keonjhar district','district','water','Mine-affected water quality zones','14','flagged','Odisha Pollution Control Board · 2025', false),
('IN-OD-KJR','Keonjhar district','district','land','Land under active mining lease','9.8%','verified','Directorate of Mines, Odisha · 2025', true),
('IN-OD-KJR','Keonjhar district','district','land','Net cultivated area','31%','pending','Keonjhar District Statistical Handbook · 2022', false),
('IN-OD-KJR','Keonjhar district','district','forest','Forest cover (district)','46.1%','verified','Odisha Forest Dept district data · 2023', true),
('IN-OD-KJR','Keonjhar district','district','forest','Forest overlapping mining leases','6.4%','flagged','cross-referenced from mining + forest datasets', false),
('IN-OD-KJR','Keonjhar district','district','minerals','Iron ore reserves','2,290 Mt','verified','Indian Bureau of Mines · 2024', true),
('IN-OD-KJR','Keonjhar district','district','minerals','Chromite reserves','186 Mt','verified','Indian Bureau of Mines · 2024', false),
('IN-OD-KJR','Keonjhar district','district','minerals','Active mining leases','87','pending','Directorate of Mines, Odisha · 2025', false),
('IN-OD-KJR','Keonjhar district','district','energy','Local grid substations','11','verified','GRIDCO district asset list · 2026', true),
('IN-OD-KJR','Keonjhar district','district','energy','Captive power (mine-linked)','340 MW','pending','aggregated from individual mine filings', false),
-- Khordha
('IN-OD-KDA','Khordha district','district','water','Kuakhai inflow (Bhubaneswar reach)','85 m³/s','verified','Odisha Water Resources Dept gauge · Sep 2026', true),
('IN-OD-KDA','Khordha district','district','water','Kuakhai outflow (district boundary)','79 m³/s','verified','Same gauge network · Sep 2026', false),
('IN-OD-KDA','Khordha district','district','water','Municipal water demand (Bhubaneswar)','180 MLD','pending','Bhubaneswar Municipal Corporation estimate · 2024', false),
('IN-OD-KDA','Khordha district','district','land','Urbanized land share','41%','verified','Odisha Town Planning Dept · 2024', true),
('IN-OD-KDA','Khordha district','district','land','Net cultivated area','22%','verified','Khordha District Statistical Handbook · 2024', false),
('IN-OD-KDA','Khordha district','district','forest','Forest cover (district)','18.4%','pending','Odisha Forest Dept district data · 2021', true),
('IN-OD-KDA','Khordha district','district','forest','Urban green cover (Bhubaneswar)','12%','missing','no recent municipal survey identified', false),
('IN-OD-KDA','Khordha district','district','energy','Local grid substations','14','verified','GRIDCO district asset list · 2026', true),
('IN-OD-KDA','Khordha district','district','energy','Peak local demand (state capital)','410 MW','verified','GRIDCO / CEA · 2026', false),
-- US country
('US','United States','country','forest','Total forest cover','33.9%','verified','USDA Forest Service · 2024', true),
('US','United States','country','forest','National forest system area','780,000 km²','verified','USDA Forest Service · 2024', false),
('US','United States','country','forest','Wildfire-burned area (2025)','28,400 km²','flagged','NIFC · provisional through Dec 2025', false),
-- California
('US-CA','California','region','water','Major rivers','14','verified','CA Dept of Water Resources · 2025', true),
('US-CA','California','region','water','Groundwater extraction','16,500 MCM/yr','verified','SGMA reporting · 2025', false),
('US-CA','California','region','water','Surface storage capacity','51,000 MCM','verified','CA DWR · 2025', false),
('US-CA','California','region','land','Forest cover','33.0%','verified','USDA Forest Service · 2024', true),
('US-CA','California','region','land','Agricultural land','25.0%','verified','USDA NASS · 2024', false),
('US-CA','California','region','land','Coastline length','1,350 km','verified','NOAA · 2023', false),
('US-CA','California','region','forest','Forested area','133,000 km²','verified','CAL FIRE · 2024', true),
('US-CA','California','region','forest','Old-growth protected area','48,000 acres','verified','CAL FIRE · 2023', false),
('US-CA','California','region','forest','2025 wildfire-burned area','6,100 km²','flagged','CAL FIRE incident data · provisional', false),
('US-CA','California','region','minerals','Global boron share','24%','verified','USGS · 2025', true),
('US-CA','California','region','minerals','Gold reserves','no estimate','missing','no source identified', false),
('US-CA','California','region','energy','Renewable share','54.0%','verified','CA Energy Commission · 2026', true),
('US-CA','California','region','energy','Installed capacity','87,000 MW','verified','CA Energy Commission · 2026', false),
-- Sacramento
('US-CA-SAC','Sacramento County','district','water','American River inflow (Fair Oaks gauge)','92 m³/s','verified','USGS gauge 11446500 · Sep 2026', true),
('US-CA-SAC','Sacramento County','district','water','American River outflow (Sacramento R. confluence)','88 m³/s','verified','USGS gauge network · Sep 2026', false),
('US-CA-SAC','Sacramento County','district','water','Local groundwater extraction','340 MCM/yr','verified','Sacramento Central Groundwater Authority · 2025', false),
('US-CA-SAC','Sacramento County','district','land','Urbanized land share','46%','verified','Sacramento County GIS · 2024', true),
('US-CA-SAC','Sacramento County','district','land','Flood-plain managed area','12%','pending','levee recertification in progress · 2025', false),
('US-CA-SAC','Sacramento County','district','forest','Urban tree canopy cover','19%','verified','Sacramento Tree Foundation survey · 2023', true),
('US-CA-SAC','Sacramento County','district','forest','Riparian forest along American River','23 km','pending','last mapped 2020', false),
('US-CA-SAC','Sacramento County','district','energy','Local grid substations','9','verified','SMUD asset map · 2026', true),
('US-CA-SAC','Sacramento County','district','energy','Peak local demand','1,150 MW','verified','SMUD system peak · Aug 2026', false),
-- San Bernardino
('US-CA-SB','San Bernardino County','district','water','Mojave River flow (Victorville gauge)','0 m³/s (dry channel)','flagged','USGS gauge 10261500 · Sep 2026 — storm flow only', true),
('US-CA-SB','San Bernardino County','district','water','Groundwater basin storage change','-38,000 acre-ft/yr','verified','Mojave Water Agency · 2025', false),
('US-CA-SB','San Bernardino County','district','water','Imported water share (SWP)','62%','pending','Mojave Water Agency estimate · 2024', false),
('US-CA-SB','San Bernardino County','district','land','Desert/undeveloped land share','81%','verified','San Bernardino County Land Use Dept · 2024', true),
('US-CA-SB','San Bernardino County','district','land','Urbanized land share','9%','verified','San Bernardino County Land Use Dept · 2024', false),
('US-CA-SB','San Bernardino County','district','forest','Forest cover (district)','4.1%','verified','CAL FIRE · 2024', true),
('US-CA-SB','San Bernardino County','district','forest','Desert scrub/Joshua tree habitat','58%','pending','BLM habitat survey · 2022', false),
('US-CA-SB','San Bernardino County','district','minerals','Borate reserves (Boron mine)','~50% of world supply','verified','U.S. Borax / Rio Tinto disclosures · 2025', true),
('US-CA-SB','San Bernardino County','district','minerals','Active open-pit mining area','7.1 km²','verified','San Bernardino County Mining Dept · 2024', false),
('US-CA-SB','San Bernardino County','district','minerals','Rare earth exploration claims','12 active','pending','BLM claims database · 2025', false),
('US-CA-SB','San Bernardino County','district','energy','Utility-scale solar capacity','1,850 MW','verified','CA Energy Commission · 2026', true),
('US-CA-SB','San Bernardino County','district','energy','Local grid substations','7','pending','partial asset list — county spans multiple utility territories', false),
-- Los Angeles
('US-CA-LA','Los Angeles County','district','water','LA River flow (Sepulveda gauge)','4.2 m³/s','verified','USGS gauge 11092450 · Sep 2026', true),
('US-CA-LA','Los Angeles County','district','water','LA River outflow (Long Beach estuary)','5.8 m³/s','flagged','higher than upstream — storm-drain inflow unmetered', false),
('US-CA-LA','Los Angeles County','district','water','Imported water share (MWD)','58%','verified','MWD annual report · 2025', false),
('US-CA-LA','Los Angeles County','district','land','Urbanized land share','73%','verified','LA County Dept of Regional Planning · 2024', true),
('US-CA-LA','Los Angeles County','district','land','Net cultivated area','1.2%','verified','USDA NASS · 2024', false),
('US-CA-LA','Los Angeles County','district','forest','Urban tree canopy cover','21%','pending','LA County Regional Park & Open Space District · 2022', true),
('US-CA-LA','Los Angeles County','district','forest','Angeles NF area (district portion)','1,750 km²','verified','USDA Forest Service · 2024', false),
('US-CA-LA','Los Angeles County','district','energy','Peak local demand','6,200 MW','verified','LADWP / CAISO system peak · Aug 2026', true),
('US-CA-LA','Los Angeles County','district','energy','Local grid substations','38','pending','aggregated across LADWP + SCE territories', false);

-- ============ Seed: placeholder headline claims for every US state and Indian state ============
-- One "coverage pending" headline per (state, category) so every state on the map
-- shows a status other than "no data" once the DB is wired.

with states(id, name) as (values
  -- US 50
  ('US-AL','Alabama'),('US-AK','Alaska'),('US-AZ','Arizona'),('US-AR','Arkansas'),
  ('US-CO','Colorado'),('US-CT','Connecticut'),('US-DE','Delaware'),('US-FL','Florida'),
  ('US-GA','Georgia'),('US-HI','Hawaii'),('US-ID','Idaho'),('US-IL','Illinois'),
  ('US-IN','Indiana'),('US-IA','Iowa'),('US-KS','Kansas'),('US-KY','Kentucky'),
  ('US-LA','Louisiana'),('US-ME','Maine'),('US-MD','Maryland'),('US-MA','Massachusetts'),
  ('US-MI','Michigan'),('US-MN','Minnesota'),('US-MS','Mississippi'),('US-MO','Missouri'),
  ('US-MT','Montana'),('US-NE','Nebraska'),('US-NV','Nevada'),('US-NH','New Hampshire'),
  ('US-NJ','New Jersey'),('US-NM','New Mexico'),('US-NY','New York'),('US-NC','North Carolina'),
  ('US-ND','North Dakota'),('US-OH','Ohio'),('US-OK','Oklahoma'),('US-OR','Oregon'),
  ('US-PA','Pennsylvania'),('US-RI','Rhode Island'),('US-SC','South Carolina'),('US-SD','South Dakota'),
  ('US-TN','Tennessee'),('US-TX','Texas'),('US-UT','Utah'),('US-VT','Vermont'),
  ('US-VA','Virginia'),('US-WA','Washington'),('US-WV','West Virginia'),('US-WI','Wisconsin'),
  ('US-WY','Wyoming'),
  -- India 35 (excluding IN-OD which has real data above)
  ('IN-AP','Andhra Pradesh'),('IN-AR','Arunachal Pradesh'),('IN-AS','Assam'),('IN-BR','Bihar'),
  ('IN-CT','Chhattisgarh'),('IN-GA','Goa'),('IN-GJ','Gujarat'),('IN-HR','Haryana'),
  ('IN-HP','Himachal Pradesh'),('IN-JK','Jammu and Kashmir'),('IN-JH','Jharkhand'),('IN-KA','Karnataka'),
  ('IN-KL','Kerala'),('IN-LA','Ladakh'),('IN-MP','Madhya Pradesh'),('IN-MH','Maharashtra'),
  ('IN-MN','Manipur'),('IN-ML','Meghalaya'),('IN-MZ','Mizoram'),('IN-NL','Nagaland'),
  ('IN-PB','Punjab'),('IN-RJ','Rajasthan'),('IN-SK','Sikkim'),('IN-TN','Tamil Nadu'),
  ('IN-TG','Telangana'),('IN-TR','Tripura'),('IN-UP','Uttar Pradesh'),('IN-UT','Uttarakhand'),
  ('IN-WB','West Bengal'),('IN-AN','Andaman and Nicobar Islands'),('IN-CH','Chandigarh'),
  ('IN-DH','Dadra and Nagar Haveli and Daman and Diu'),('IN-DL','Delhi'),
  ('IN-LD','Lakshadweep'),('IN-PY','Puducherry')
),
cats(category) as (values ('water'),('land'),('forest'),('minerals'),('energy'))
insert into public.claims (place_id, place_name, place_level, category, label, value, status, cite, is_headline)
select s.id, s.name, 'region', c.category,
       'State summary','Coverage pending','pending',
       'Awaiting first verified upload from state authority', true
from states s cross join cats c;
