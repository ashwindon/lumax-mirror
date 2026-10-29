import type { Capability, Machine, MachineKind, PlantCode, RouteOp } from "../types";

// A representative slice of each plant's fleet, not every machine. Station types follow
// what Lumax reports (2K/3K and BMC moulding, metallizing, hot-plate and vibration
// welding, hot-melt sealing, leak, aim and function test, imported SMT lines at Bawal);
// counts and tonnages are assumptions, and machine brands are not public.
const m = (
  plant: PlantCode,
  slug: string,
  name: string,
  kind: MachineKind,
  capabilities: Capability[],
  ownerId: string,
  extra: Pick<Machine, "otherWork" | "dedicatedTo"> = {},
): Machine => ({ id: `${plant.toLowerCase()}-${slug}`, plant, name, kind, capabilities, ownerId, ...extra });

export const machines: Machine[] = [
  // DHR Dharuhera: the mixed 4W and 2W mother plant
  m("DHR", "imm-1", "IMM 350 t, 1", "imm", ["mould"], "vijay-saini"),
  m("DHR", "imm-2", "IMM 350 t, 2", "imm", ["mould"], "vijay-saini"),
  m("DHR", "imm-3", "IMM 650 t, 3", "imm", ["mould"], "vijay-saini"),
  m("DHR", "imm2k-1", "2K rotary IMM, 1", "imm-2k", [], "vijay-saini", { otherWork: { label: "Tail lamp lenses, other programmes", minutes: [60, 180] } }),
  m("DHR", "hc-1", "Hard-coat line 1", "hardcoat-line", ["hard-coat"], "kavita-rao"),
  m("DHR", "met-1", "Vacuum metallizer 1", "metallizer", ["metallize"], "kavita-rao", { dedicatedTo: ["SA-61081"] }),
  // The only metallizer whose process is approved for the Victoris BMC reflectors.
  m("DHR", "met-2", "Vacuum metallizer 2", "metallizer", ["metallize"], "kavita-rao", { dedicatedTo: ["SA-61066"] }),
  m("DHR", "paint-1", "Paint booth 1", "paint-booth", [], "kavita-rao", { otherWork: { label: "Bezel masks, other programmes", minutes: [40, 120] } }),
  m("DHR", "asm-1", "2W headlamp line 1", "assembly-line", ["assemble"], "sandeep-kadian"),
  m("DHR", "asm-2", "2W tail lamp line 2", "assembly-line", [], "sandeep-kadian", { otherWork: { label: "HMSI tail lamps", minutes: [60, 150] } }),
  m("DHR", "leak-1", "Leak tester 1", "leak-tester", ["leak-test"], "sandeep-kadian"),
  m("DHR", "photo-1", "Aim and photometry 1", "photometry-tunnel", ["photometry"], "sandeep-kadian"),
  m("DHR", "agv-1", "AGV 4, line feeding", "agv", [], "sandeep-kadian"),

  // BWL Bawal lighting: premium 4W LED lamps
  m("BWL", "immxl-1", "IMM-XL 1,300 t, 1", "imm-xl", ["mould-xl"], "mohit-yadav"),
  m("BWL", "immxl-2", "IMM-XL 1,500 t, 2", "imm-xl", ["mould-xl"], "mohit-yadav"),
  m("BWL", "imm-1", "IMM 450 t, 1", "imm", [], "mohit-yadav", { otherWork: { label: "Fog lamp bezels, other programmes", minutes: [60, 180] } }),
  m("BWL", "bmc-1", "BMC reflector press 1", "bmc-press", ["mould-bmc"], "mohit-yadav"),
  m("BWL", "hc-1", "Hard-coat line 1", "hardcoat-line", ["hard-coat"], "priyanka-sharma"),
  m("BWL", "met-1", "Vacuum metallizer 1", "metallizer", [], "priyanka-sharma", { otherWork: { label: "Fog lamp reflectors, other programmes", minutes: [40, 90] } }),
  m("BWL", "asm-1", "LED headlamp line 1", "assembly-line", ["assemble"], "ajay-rathi"),
  m("BWL", "hp-1", "Hot-plate welder 1", "hot-plate-welder", ["hot-plate-weld"], "ajay-rathi"),
  m("BWL", "leak-1", "Leak tester 1", "leak-tester", ["leak-test"], "ajay-rathi"),
  m("BWL", "photo-1", "Aim and photometry 1", "photometry-tunnel", ["photometry"], "ajay-rathi"),
  m("BWL", "func-1", "Function tester 1", "function-tester", ["function-test"], "ajay-rathi"),

  // BWE Bawal Electronics: LED boards for every lamp plant, and HVAC control panels
  m("BWE", "smt-1", "SMT line 1", "smt-line", ["smt"], "harish-kumar", { otherWork: { label: "LED boards, other programmes", minutes: [40, 120] } }),
  m("BWE", "smt-2", "SMT line 2", "smt-line", ["smt"], "harish-kumar", { otherWork: { label: "LED boards, other programmes", minutes: [40, 120] } }),
  m("BWE", "smt-3", "SMT line 3", "smt-line", ["smt"], "harish-kumar", { otherWork: { label: "HVAC control boards", minutes: [40, 120] } }),
  m("BWE", "smt-4", "SMT line 4", "smt-line", ["smt"], "harish-kumar", { otherWork: { label: "LED boards, other programmes", minutes: [40, 120] } }),
  m("BWE", "test-1", "AOI, 3D X-ray and ICT cell 1", "board-tester", ["board-test", "xray-test"], "sneha-verma"),
  m("BWE", "test-2", "AOI and ICT cell 2", "board-tester", ["board-test"], "sneha-verma"),
  m("BWE", "hvac-1", "HVAC control panel line", "panel-line", [], "sneha-verma", { otherWork: { label: "HVAC control panels", minutes: [60, 150] } }),

  // PNT Pantnagar
  m("PNT", "immxl-1", "IMM-XL 1,300 t, 1", "imm-xl", ["mould-xl"], "rajendra-bisht"),
  m("PNT", "imm-1", "IMM 450 t, 1", "imm", ["mould"], "rajendra-bisht"),
  m("PNT", "hc-1", "Hard-coat line 1", "hardcoat-line", ["hard-coat"], "rajendra-bisht"),
  m("PNT", "met-1", "Vacuum metallizer 1", "metallizer", ["metallize"], "rajendra-bisht"),
  m("PNT", "asm-1", "Headlamp line 1", "assembly-line", ["assemble"], "rajendra-bisht"),
  m("PNT", "hp-1", "Hot-plate welder 1", "hot-plate-welder", ["hot-plate-weld"], "rajendra-bisht"),
  m("PNT", "leak-1", "Leak tester 1", "leak-tester", ["leak-test"], "rajendra-bisht"),
  m("PNT", "photo-1", "Aim and photometry 1", "photometry-tunnel", ["photometry"], "rajendra-bisht"),

  // HDW Haridwar: two-wheeler lamps
  m("HDW", "imm-1", "IMM 350 t, 1", "imm", ["mould"], "pankaj-rana"),
  m("HDW", "imm-2", "IMM 350 t, 2", "imm", ["mould"], "pankaj-rana"),
  m("HDW", "hc-1", "Hard-coat line 1", "hardcoat-line", ["hard-coat"], "pankaj-rana"),
  m("HDW", "met-1", "Vacuum metallizer 1", "metallizer", ["metallize"], "pankaj-rana"),
  m("HDW", "asm-1", "2W headlamp line 1", "assembly-line", ["assemble"], "pankaj-rana"),
  m("HDW", "leak-1", "Leak tester 1", "leak-tester", ["leak-test"], "pankaj-rana"),
  m("HDW", "photo-1", "Aim and photometry 1", "photometry-tunnel", ["photometry"], "pankaj-rana"),

  // CK2 Chakan II: Mahindra fog and cornering lamps, and lenses for Chakan III
  m("CK2", "immxl-1", "IMM-XL 1,300 t, 1", "imm-xl", ["mould-xl"], "swapnil-more"),
  m("CK2", "imm-1", "IMM 450 t, 1", "imm", ["mould"], "swapnil-more"),
  m("CK2", "imm-2", "IMM 450 t, 2", "imm", ["mould"], "swapnil-more"),
  m("CK2", "hc-1", "Hard-coat line 1", "hardcoat-line", ["hard-coat"], "swapnil-more"),
  m("CK2", "met-1", "Vacuum metallizer 1", "metallizer", ["metallize"], "swapnil-more"),
  m("CK2", "asm-1", "Fog and cornering lamp line 1", "assembly-line", ["assemble"], "swapnil-more"),
  m("CK2", "uw-1", "Ultrasonic welder 1", "vibration-welder", ["vibration-weld"], "swapnil-more"),
  m("CK2", "leak-1", "Leak and function tester 1", "leak-tester", ["leak-test"], "swapnil-more"),

  // CK3 Chakan III: Phase 1 LED headlamps, Phase 2 automated rear lamps for Skoda-VW
  m("CK3", "immxl-1", "IMM-XL 1,300 t, 1", "imm-xl", ["mould-xl"], "tushar-gaikwad"),
  m("CK3", "immxl-2", "IMM-XL 1,300 t, 2", "imm-xl", ["mould-xl"], "tushar-gaikwad"),
  m("CK3", "imm2k-1", "2K rotary IMM, 1", "imm-2k", ["mould-2k"], "tushar-gaikwad"),
  m("CK3", "imm-1", "IMM 650 t, 1", "imm", ["mould"], "tushar-gaikwad"),
  m("CK3", "met-1", "Vacuum metallizer 1", "metallizer", ["metallize"], "pallavi-shinde"),
  m("CK3", "met-2", "Vacuum metallizer 2", "metallizer", ["metallize"], "pallavi-shinde"),
  m("CK3", "asm-1", "LED headlamp line 1 (Phase 1)", "assembly-line", ["assemble"], "omkar-patil", { dedicatedTo: ["SA-61034"] }),
  m("CK3", "asm-2", "Rear lamp line 1 (Phase 2)", "assembly-line", ["assemble"], "omkar-patil", { dedicatedTo: ["SA-61040"] }),
  m("CK3", "hp-1", "Hot-plate welder 1", "hot-plate-welder", ["hot-plate-weld"], "omkar-patil"),
  m("CK3", "vib-1", "Vibration welder 1", "vibration-welder", ["vibration-weld"], "omkar-patil"),
  m("CK3", "leak-1", "Leak tester 1", "leak-tester", ["leak-test"], "omkar-patil"),
  m("CK3", "leak-2", "Leak tester 2", "leak-tester", ["leak-test"], "omkar-patil"),
  m("CK3", "photo-1", "Automated aim and photometry 1", "photometry-tunnel", ["photometry"], "omkar-patil"),
  m("CK3", "func-1", "Function tester 1", "function-tester", ["function-test"], "omkar-patil"),

  // CCW Chinchwad
  m("CCW", "immxl-1", "IMM-XL 1,300 t, 1", "imm-xl", ["mould-xl"], "ganesh-kale"),
  m("CCW", "imm-1", "IMM 450 t, 1", "imm", ["mould"], "ganesh-kale"),
  m("CCW", "hc-1", "Hard-coat line 1", "hardcoat-line", ["hard-coat"], "ganesh-kale"),
  m("CCW", "met-1", "Vacuum metallizer 1", "metallizer", ["metallize"], "ganesh-kale"),
  m("CCW", "asm-1", "Headlamp line 1", "assembly-line", ["assemble"], "ganesh-kale"),
  m("CCW", "hp-1", "Hot-plate welder 1", "hot-plate-welder", ["hot-plate-weld"], "ganesh-kale"),
  m("CCW", "leak-1", "Leak tester 1", "leak-tester", ["leak-test"], "ganesh-kale"),
  m("CCW", "photo-1", "Aim and photometry 1", "photometry-tunnel", ["photometry"], "ganesh-kale"),

  // SND Sanand (D-1): Swift lamps
  m("SND", "immxl-1", "IMM-XL 1,300 t, 1", "imm-xl", ["mould-xl"], "nirav-joshi"),
  m("SND", "imm2k-1", "2K rotary IMM, 1", "imm-2k", ["mould-2k"], "nirav-joshi"),
  m("SND", "met-1", "Vacuum metallizer 1", "metallizer", ["metallize"], "nirav-joshi"),
  m("SND", "asm-1", "Rear lamp line 1", "assembly-line", ["assemble"], "nirav-joshi"),
  m("SND", "vib-1", "Vibration welder 1", "vibration-welder", ["vibration-weld"], "nirav-joshi"),
  m("SND", "leak-1", "Leak tester 1", "leak-tester", ["leak-test"], "nirav-joshi"),
  m("SND", "func-1", "Function tester 1", "function-tester", ["function-test"], "nirav-joshi"),

  // SN2 Sanand II (E-1): e Vitara lighting with ADB headlamps
  m("SN2", "immxl-1", "IMM-XL 1,500 t, 1", "imm-xl", ["mould-xl"], "jignesh-mehta"),
  m("SN2", "immxl-2", "IMM-XL 1,500 t, 2", "imm-xl", ["mould-xl"], "jignesh-mehta"),
  m("SN2", "imm-1", "IMM 650 t, 1", "imm", ["mould"], "jignesh-mehta"),
  m("SN2", "hc-1", "Hard-coat line 1", "hardcoat-line", ["hard-coat"], "rina-trivedi"),
  m("SN2", "met-1", "Vacuum metallizer 1", "metallizer", ["metallize"], "rina-trivedi"),
  m("SN2", "met-2", "Vacuum metallizer 2", "metallizer", ["metallize"], "rina-trivedi"),
  m("SN2", "asm-1", "ADB headlamp line 1", "assembly-line", ["assemble"], "chirag-solanki"),
  m("SN2", "asm-2", "ADB headlamp line 2", "assembly-line", ["assemble"], "chirag-solanki"),
  m("SN2", "hp-1", "Hot-plate welder 1", "hot-plate-welder", ["hot-plate-weld"], "chirag-solanki"),
  m("SN2", "hp-2", "Hot-plate welder 2", "hot-plate-welder", ["hot-plate-weld"], "chirag-solanki"),
  m("SN2", "leak-1", "Leak tester 1", "leak-tester", ["leak-test"], "chirag-solanki"),
  m("SN2", "func-1", "ADB matrix function tester", "function-tester", ["function-test"], "chirag-solanki"),
  m("SN2", "photo-1", "ADB aim and photometry tunnel", "photometry-tunnel", ["photometry"], "chirag-solanki"),

  // BLR Bengaluru (Bidadi): Honda Activa headlamps, and Toyota lamps
  m("BLR", "imm-1", "IMM 350 t, 1", "imm", ["mould"], "santosh-hegde"),
  m("BLR", "imm-2", "IMM 350 t, 2", "imm", ["mould"], "santosh-hegde"),
  m("BLR", "imm-3", "IMM 350 t, 3", "imm", ["mould"], "santosh-hegde"),
  m("BLR", "immxl-1", "IMM-XL 1,300 t, 1", "imm-xl", [], "santosh-hegde", { otherWork: { label: "Toyota lamp housings", minutes: [90, 240] } }),
  m("BLR", "hc-1", "Hard-coat line 1", "hardcoat-line", ["hard-coat"], "lakshmi-narayan"),
  m("BLR", "met-1", "Vacuum metallizer 1", "metallizer", ["metallize"], "lakshmi-narayan"),
  m("BLR", "met-2", "Vacuum metallizer 2", "metallizer", ["metallize"], "lakshmi-narayan"),
  m("BLR", "asm-1", "2W headlamp line 1", "assembly-line", ["assemble"], "arun-shetty"),
  m("BLR", "asm-2", "2W headlamp line 2", "assembly-line", ["assemble"], "arun-shetty"),
  m("BLR", "asm-3", "4W lamp line 1", "assembly-line", [], "arun-shetty", { otherWork: { label: "Toyota Urban Cruiser lamp sets", minutes: [60, 150] } }),
  m("BLR", "leak-1", "Leak tester 1", "leak-tester", ["leak-test"], "arun-shetty"),
  m("BLR", "photo-1", "Aim and photometry 1", "photometry-tunnel", ["photometry"], "arun-shetty"),
];

/** Whether a machine can take a step of an order's route. */
export const runsStep = (m: Machine, orderId: string, op: RouteOp) =>
  op.plant === m.plant && m.capabilities.includes(op.capability) && (!m.dedicatedTo || m.dedicatedTo.includes(orderId));

export const machineById = Object.fromEntries(machines.map((x) => [x.id, x])) as Record<string, Machine>;

export const machinesByPlant = machines.reduce(
  (acc, x) => {
    (acc[x.plant] ??= []).push(x);
    return acc;
  },
  {} as Record<PlantCode, Machine[]>,
);
