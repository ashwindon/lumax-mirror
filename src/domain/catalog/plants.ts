import type { Plant, PlantCode } from "../types";

// Lumax Industries' eleven plants: addresses, founding years and what each makes are
// from its annual reports, IATF and ISO certificates and JIPM profiles (see
// reports/). Headcounts are published only for Bawal and Dharuhera (JIPM).
//
// Sites are in km from each cluster's map origin. Most come from town or estate
// geocodes, accurate to 2 to 5 km, so the maps are schematic. The two plants that
// share an estate (Bawal lighting and electronics; the two Sanand vendor parks) are
// pulled a few km apart so both can be clicked.
export const plants: Plant[] = [
  {
    code: "DHR",
    region: "ncr",
    name: "Dharuhera",
    address: "Plot 6, Industrial Area, Dharuhera, Rewari, Haryana",
    established: 1998,
    headcount: 1390,
    specialties: ["Headlamps, tail lamps, DRLs and HMSL", "4W and 2W lamps", "Synchronous ESD headlamp line", "Automated material handling"],
    customers: "Suzuki Motor Gujarat, Honda Motorcycle & Scooter India, Maruti Suzuki",
    site: { x: 9.3, y: 6.1 },
    sheds: [
      { w: 9, d: 4.4 },
      { w: 7, d: 3.6 },
    ],
    managerId: "rakesh-yadav",
  },
  {
    code: "BWL",
    region: "ncr",
    name: "Bawal lighting",
    address: "Plot 195–195A, Sector 4, Phase II, Growth Centre Bawal, Rewari, Haryana",
    established: 2012,
    headcount: 858,
    specialties: ["Premium 4W LED headlamps", "Rear combination lamps", "Fog lamps"],
    customers: "Maruti Suzuki, Honda Cars India",
    site: { x: -9.8, y: -6.7 },
    sheds: [
      { w: 8, d: 4 },
      { w: 6, d: 3.2 },
    ],
    managerId: "sunil-dahiya",
  },
  {
    code: "BWE",
    region: "ncr",
    name: "Bawal Electronics",
    address: "Plot 12, Sector 5, Phase II, Industrial Estate, Growth Centre Bawal, Rewari, Haryana",
    established: 2022,
    specialties: ["LED boards (SMT) for every lamp plant", "HVAC control panels", "MES-connected"],
    customers: "Lumax lamp plants (internal)",
    site: { x: -5.4, y: -5.9 },
    sheds: [{ w: 6, d: 3 }],
    managerId: "anjali-sharma",
  },
  {
    code: "PNT",
    region: "uttarakhand",
    name: "Pantnagar",
    address: "Plot 51, Sector 11, IIE, Pantnagar, Udham Singh Nagar, Uttarakhand",
    established: 2008,
    specialties: ["Lighting for commercial vehicles", "ISO 50001 energy management"],
    customers: "Set up for Tata Motors; current mix not published",
    mixToConfirm: true,
    site: { x: 66.9, y: -52.2 },
    sheds: [{ w: 6, d: 3.4 }],
    managerId: "manish-rawat",
  },
  {
    code: "HDW",
    region: "uttarakhand",
    name: "Haridwar",
    address: "Plot 5, Industrial Park-II, Salempur Mehdood, Haridwar, Uttarakhand",
    established: 2010,
    specialties: ["Two-wheeler lamps", "GreenPro-certified products"],
    customers: "Hero MotoCorp",
    mixToConfirm: true,
    site: { x: -66.9, y: 52.2 },
    sheds: [{ w: 5.5, d: 3 }],
    managerId: "deepak-negi",
  },
  {
    code: "CK2",
    region: "pune",
    name: "Chakan II",
    address: "608–609 Chakan–Talegaon Road, Mahalunge Ingle, Chakan, Pune",
    established: 2005,
    specialties: ["Design and manufacture of lighting", "Pune R&D centre", "ACMA Manufacturing Excellence Award 2025"],
    customers: "Pune OEMs; plant-by-plant mix not published",
    mixToConfirm: true,
    site: { x: 0.95, y: 6.1 },
    sheds: [{ w: 6.5, d: 3.4 }],
    managerId: "sachin-kulkarni",
  },
  {
    code: "CK3",
    region: "pune",
    name: "Chakan III",
    address: "Plot A-79, Block C, Horizon Industrial Park, Sawardari, Chakan, Pune",
    established: 2023,
    specialties: ["Highly automated LED lamp plant", "Phase 2 for Skoda-VW from Q4 FY26", "RE100"],
    customers: "Mahindra, Tata Motors, Skoda Auto Volkswagen India, Maruti Suzuki",
    site: { x: -1.9, y: 6.8 },
    sheds: [
      { w: 9, d: 4.2 },
      { w: 7, d: 3.4 },
    ],
    managerId: "amol-pawar",
  },
  {
    code: "CCW",
    region: "pune",
    name: "Chinchwad",
    address: "D2-43/2, MIDC Industrial Area, Chinchwad, Pune",
    specialties: ["Design and manufacture of lighting"],
    customers: "Not published",
    mixToConfirm: true,
    site: { x: 0.3, y: -7.5 },
    sheds: [{ w: 5, d: 3 }],
    managerId: "nitin-jadhav",
  },
  {
    code: "SND",
    region: "gujarat",
    name: "Sanand",
    address: "Plot D-1, Vendors Park, Sanand, Ahmedabad, Gujarat",
    established: 2017,
    specialties: ["Swift headlamps and rear lamps", "Brownfield expansion under way"],
    customers: "Maruti Suzuki (Gujarat)",
    site: { x: -1.6, y: 0.4 },
    sheds: [{ w: 6, d: 3.2 }],
    managerId: "hardik-patel",
  },
  {
    code: "SN2",
    region: "gujarat",
    name: "Sanand II",
    address: "Plot E-1, Tata Nano Vendor Park, North Kotpura, Sanand, Gujarat",
    established: 2025,
    specialties: ["e Vitara full lighting system", "ADB matrix LED headlamps", "Ramping up"],
    customers: "Maruti Suzuki's Sanand operations and other Gujarat OEMs",
    site: { x: 2.6, y: -1.6 },
    sheds: [{ w: 8, d: 4 }],
    managerId: "bhavesh-shah",
  },
  {
    code: "BLR",
    region: "karnataka",
    name: "Bengaluru",
    address: "Plot 69–70A, Phase II, Sector 2, Bidadi Industrial Area, Ramanagara, Karnataka",
    established: 2012,
    specialties: ["Single source for Honda Activa and Shine headlamps", "Toyota 4W lamps", "Tool room", "RE100"],
    customers: "Honda Motorcycle & Scooter India, Toyota Kirloskar",
    site: { x: 0.65, y: 0.1 },
    sheds: [{ w: 7.5, d: 3.8 }],
    managerId: "ravi-gowda",
  },
];

export const plantByCode = Object.fromEntries(plants.map((p) => [p.code, p])) as Record<PlantCode, Plant>;

export function plantDistanceKm(a: PlantCode, b: PlantCode) {
  const pa = plantByCode[a].site;
  const pb = plantByCode[b].site;
  return Math.hypot(pa.x - pb.x, pa.y - pb.y);
}

export const sameRegion = (a: PlantCode, b: PlantCode) => plantByCode[a].region === plantByCode[b].region;

/** Minutes for a truck between two plants in the same cluster. Between clusters, see freight.ts. */
export const truckMinutes = (a: PlantCode, b: PlantCode) => {
  const km = plantDistanceKm(a, b);
  return Math.round(20 + km * (km < 30 ? 2.5 : 1.5));
};
