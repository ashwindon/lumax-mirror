import type { AlertKind, MachineKind } from "./types";

// What stops each kind of machine, and how often. The mix follows Lumax's own TPM
// records (JIPM profiles for Bawal and Dharuhera): OEE of 85 to 86%, breakdowns
// counted per week or per day, scrap of 1.65 to 2.8%. So breakdowns stay rare, and
// most lost time is mould and feeder changes, minor stops, quality holds and waits
// for parts or people. Rates run hotter than a real plant so a short demo shows some.

export type FaultCause = { kind: AlertKind; title: string; code: string; cause: string };

type Stops = { meanHours: number; minutes: [number, number]; causes: FaultCause[] };

export type FaultProfile = {
  /** Breakdowns: mean running hours between them, and repair time. */
  breakdown: Stops;
  /** Short stops a line leader clears: jams, sensor faults, nozzle cleans. */
  minor?: Stops;
  /** Holds on the unit being worked: only while the machine works a tracked order. */
  quality?: Stops;
  /**
   * A change of job: a mould change on a press, a feeder set-up on an SMT line. Presses
   * run a job for a campaign before changing, the way moulding shops plan.
   */
  setup?: { chance: number; minutes: [number, number]; waitChance: number; title: string; cause: string; campaignMin?: number };
  /** Chance per job change that the parts for it are not at the machine. */
  material?: { chance: number; minutes: [number, number]; title: string; cause: string };
  /** Chance per shift start that the line is short of operators. */
  manpower?: { chance: number; minutes: [number, number] };
  /** The rare long stop that takes a machine out for a shift or more. */
  major?: FaultCause;
};

const c = (kind: AlertKind, title: string, code: string, cause: string): FaultCause => ({ kind, title, code, cause });
const breakdown = (title: string, code: string, cause: string) => c("breakdown", title, code, cause);
const minor = (title: string, code: string, cause: string) => c("minor", title, code, cause);
const quality = (title: string, code: string, cause: string) => c("quality", title, code, cause);

export const genericMajorFault: FaultCause = breakdown(
  "Main drive failure",
  "MAJ-01",
  "Main drive motor failed; maintenance is fitting a replacement from stores.",
);

const pressBreakdowns = [
  breakdown("Hydraulic oil temperature high", "HY-21", "Oil cooler flow low; the press stopped above 55 °C. Maintenance is back-flushing the cooler."),
  breakdown("Barrel heater band failure", "HT-03", "Zone 3 heater band open circuit; barrel cannot hold melt temperature."),
  breakdown("Mould cooling water leak", "MC-08", "Leak at a cooling circuit fitting on the moving half; mould water shut off for repair."),
];
const pressMinor = [
  minor("Part stuck in the mould", "RB-07", "Take-out robot missed the part at ejection; operator clearing the cavity."),
  minor("Sprue not ejected", "EJ-02", "Sprue picker fault; cycle stopped until it is cleared."),
];
const mouldChange = (minutes: [number, number], campaignMin: number) => ({
  chance: 0.95,
  minutes,
  waitChance: 0.3,
  title: "Mould change overrunning",
  cause: "The next job needs the mould swapped and first-off parts approved; the mould crane was busy at the next press.",
  campaignMin,
});
const moulding = (extra: FaultCause[]): Stops => ({ meanHours: 26, minutes: [15, 40], causes: extra });

const lineMinor = [
  minor("Part jam at the screw station", "MS-01", "Housing not seated in the fixture; screwdriver stopped on torque fault."),
  minor("Fixture sensor not made", "MS-04", "Part-present sensor not reading; line leader resetting the station."),
  minor("Vision check reject streak", "MS-07", "Clip-presence camera rejected three lamps in a row; line stopped for a check."),
  minor("Hot-melt nozzle clog", "MS-09", "Bead-laying robot nozzle partly blocked; bead thin on the last lamp, nozzle being cleaned."),
];

export const faultProfiles: Record<MachineKind, FaultProfile> = {
  "imm-xl": {
    breakdown: { meanHours: 260, minutes: [20, 60], causes: pressBreakdowns },
    minor: { meanHours: 6, minutes: [3, 10], causes: pressMinor },
    quality: moulding([
      quality("Flash on housing parting line", "QM-11", "Flash along the parting line on the last shots; parts held and the mould face being cleaned."),
      quality("Weld lines on outer lens", "QM-14", "Visible weld line near the gate on the outer lens; held until melt temperature is corrected."),
    ]),
    setup: mouldChange([18, 40], 360),
    major: breakdown(
      "Mould damage: sent to the tool room",
      "MD-01",
      "A slide on the mould cracked; the mould went to the tool room. Replacement inserts are imported, so the tool room is repairing it in place.",
    ),
  },
  imm: {
    breakdown: { meanHours: 300, minutes: [15, 45], causes: pressBreakdowns },
    minor: { meanHours: 7, minutes: [3, 8], causes: pressMinor },
    quality: moulding([
      quality("Bubbles in light guide", "QM-19", "Air traps showing in the light guide; shots held while the venting is checked."),
      quality("Sink marks on reflector", "QM-07", "Sink marks on the thick section; parts held for the quality engineer."),
    ]),
    setup: mouldChange([12, 28], 300),
  },
  "imm-2k": {
    breakdown: { meanHours: 260, minutes: [20, 60], causes: pressBreakdowns },
    minor: { meanHours: 6, minutes: [3, 10], causes: pressMinor },
    quality: moulding([
      quality("Colour boundary defect on 2K lens", "QM-22", "Red and clear layers bleeding at the boundary; held until the second-shot timing is reset."),
    ]),
    setup: mouldChange([30, 55], 360),
  },
  "bmc-press": {
    breakdown: { meanHours: 300, minutes: [20, 50], causes: [breakdown("Platen heater fault", "BM-04", "Lower platen heater zone not reaching cure temperature.")] },
    minor: { meanHours: 8, minutes: [3, 8], causes: [minor("Charge weight alarm", "BM-02", "BMC charge outside weight tolerance; operator re-weighing.")] },
    quality: moulding([quality("Blister on BMC reflector", "QM-31", "Blisters on the reflector face; parts held, material drying time being checked.")]),
    setup: mouldChange([20, 40], 360),
  },
  "anneal-oven": {
    breakdown: { meanHours: 400, minutes: [20, 50], causes: [breakdown("Circulation fan trip", "AN-03", "Oven circulation fan tripped; batch held below annealing temperature.")] },
  },
  "hardcoat-line": {
    breakdown: {
      meanHours: 220,
      minutes: [20, 50],
      causes: [
        breakdown("Cure oven below temperature", "HC-12", "Zone 2 below 126 °C; lenses held until it recovers."),
        breakdown("Flow-coat pump pressure drop", "HC-04", "Coating pump pressure low; flow curtain uneven."),
      ],
    },
    minor: { meanHours: 8, minutes: [4, 12], causes: [minor("Conveyor hanger jam", "HC-21", "Lens hanger caught at the flash-off transfer; line stopped to free it.")] },
    quality: {
      meanHours: 16,
      minutes: [20, 45],
      causes: [
        quality("Runs on hard coat", "QH-03", "Coating runs at the lens edge; lenses held for strip and re-coat."),
        quality("Dirt inclusions in hard coat", "QH-07", "Particles in the coat; booth air filters being checked, lenses held."),
      ],
    },
  },
  metallizer: {
    breakdown: {
      meanHours: 200,
      minutes: [25, 60],
      causes: [
        breakdown("Vacuum not reaching base pressure", "VM-11", "Chamber stuck above base pressure; door seal being checked."),
        breakdown("Diffusion pump heater fault", "VM-04", "Diffusion pump heater not drawing current; pump-down slow."),
      ],
    },
    quality: {
      meanHours: 14,
      minutes: [20, 50],
      causes: [
        quality("Pinholes after metallizing", "QV-05", "Pinholes in the aluminium layer on this batch; held for basecoat check."),
        quality("Adhesion tape test failed", "QV-08", "Coating lifted at the tape test; batch held for strip and re-coat."),
      ],
    },
    setup: {
      chance: 0.5,
      minutes: [10, 20],
      waitChance: 0.2,
      title: "Waiting for the fixture rack",
      cause: "The next part needs its own jig rack, still being loaded.",
      campaignMin: 180,
    },
    major: breakdown("Vacuum pump failure", "VM-90", "Roots blower seized; the chamber cannot pump down. A spare pump is being fitted."),
  },
  "paint-booth": {
    breakdown: { meanHours: 300, minutes: [15, 40], causes: [breakdown("Booth airflow below limit", "PT-21", "Exhaust filters clogged; downdraft under spec.")] },
    quality: { meanHours: 14, minutes: [15, 35], causes: [quality("Sludge in topcoat", "QP-11", "Sludge spots on masks; parts held for rework.")] },
  },
  "assembly-line": {
    breakdown: {
      meanHours: 320,
      minutes: [15, 40],
      causes: [
        breakdown("Screwdriver controller fault", "AL-12", "Nutrunner controller lost its program; maintenance reloading it."),
        breakdown("Conveyor drive trip", "AL-03", "Pallet conveyor drive tripped on overload."),
      ],
    },
    minor: { meanHours: 3, minutes: [2, 8], causes: lineMinor },
    quality: {
      meanHours: 22,
      minutes: [15, 35],
      causes: [quality("Wrong connector fitted", "QA-06", "Poka-yoke caught a mismatched connector variant; lamps held for a check.")],
    },
    material: {
      chance: 0.07,
      minutes: [30, 80],
      title: "Gaskets short at the line",
      cause: "The gasket lot has not arrived; the supplier's advance shipment note on LSETU shows the truck held at the gate.",
    },
    manpower: { chance: 0.06, minutes: [20, 50] },
  },
  "hot-plate-welder": {
    breakdown: { meanHours: 400, minutes: [15, 40], causes: [breakdown("Hot plate temperature out of band", "HP-02", "Platen 2 below weld temperature; heater cartridge being changed.")] },
    minor: { meanHours: 5, minutes: [3, 8], causes: [minor("Stringing on the hot plate", "HP-07", "Material strings on the platen; cleaning cycle run.")] },
    quality: { meanHours: 20, minutes: [15, 35], causes: [quality("Weld flash on lens edge", "QW-02", "Flash visible on the lens edge; lamps held for visual check.")] },
  },
  "vibration-welder": {
    breakdown: { meanHours: 400, minutes: [15, 40], causes: [breakdown("Vibration head amplitude fault", "VW-05", "Head amplitude dropped below set point.")] },
    minor: { meanHours: 6, minutes: [3, 8], causes: [minor("Part not seated in the nest", "VW-11", "Lamp not seated; welder stopped before the cycle.")] },
    quality: { meanHours: 16, minutes: [15, 35], causes: [quality("Weak weld at pull test", "QW-08", "Audit lamp failed the pull test; batch held for retest.")] },
  },
  "seal-robot": {
    breakdown: { meanHours: 350, minutes: [15, 40], causes: [breakdown("Robot axis fault", "SR-02", "Axis 3 drive fault on the bead-laying robot.")] },
    minor: { meanHours: 3, minutes: [2, 6], causes: [lineMinor[3]] },
  },
  "leak-tester": {
    breakdown: { meanHours: 600, minutes: [10, 30], causes: [breakdown("Test circuit calibration failed", "LT-05", "Reference leak check failed; tester being recalibrated.")] },
    quality: {
      meanHours: 12,
      minutes: [15, 40],
      causes: [quality("Leak test failure streak", "QL-01", "Pressure drop above 10 mbar on three lamps in a row; lamps back for re-seal and retest.")],
    },
  },
  "photometry-tunnel": {
    breakdown: { meanHours: 600, minutes: [15, 40], causes: [breakdown("Photometry camera fault", "PH-08", "Luminance camera not responding; station restarting.")] },
    quality: {
      meanHours: 14,
      minutes: [15, 40],
      causes: [
        quality("Aim out of tolerance", "QP-02", "Cut-off line 0.3° high on four lamps; aimers re-teaching the adjusters, lamps back for re-aim."),
        quality("Photometric value below spec", "QP-05", "Low reading at one test point; lamp held for the quality engineer."),
      ],
    },
  },
  "function-tester": {
    breakdown: { meanHours: 600, minutes: [10, 30], causes: [breakdown("Test fixture contact fault", "FT-04", "Pogo pins worn; fixture being swapped.")] },
    quality: {
      meanHours: 14,
      minutes: [15, 40],
      causes: [quality("LED open circuit at function test", "QF-03", "One LED segment dark at power-on; lamp back for a board swap.")],
    },
  },
  "smt-line": {
    breakdown: {
      meanHours: 260,
      minutes: [20, 60],
      causes: [
        breakdown("Reflow oven conveyor stall", "SM-31", "Edge conveyor stalled in the reflow oven; boards being cleared."),
        breakdown("Placement head vacuum fault", "SM-12", "Nozzle vacuum low on head 1; head being serviced."),
      ],
    },
    minor: {
      meanHours: 2.5,
      minutes: [2, 8],
      causes: [
        minor("Feeder error on placement head", "SM-04", "Tape feeder mis-indexed; operator re-seating it."),
        minor("Board stuck at reflow entry", "SM-09", "Panel caught at the oven entry; line paused to free it."),
        minor("Stencil wipe cycle", "SM-02", "Print quality dropped on SPI; stencil wiped and line restarted."),
      ],
    },
    quality: { meanHours: 20, minutes: [15, 35], causes: [quality("AOI defect streak: tombstoned LEDs", "QS-04", "AOI flagged tombstoned LEDs on four panels; held for review.")] },
    setup: {
      chance: 0.5,
      minutes: [15, 35],
      waitChance: 0.25,
      title: "Waiting for feeder kitting",
      cause: "The next board needs its feeder trolley kitted, and stores are still loading reels.",
      campaignMin: 360,
    },
    material: {
      chance: 0.06,
      minutes: [40, 120],
      title: "Driver IC reel short",
      cause: "The next reel of imported driver ICs is not kitted yet; its lot is still clearing at the inland container depot.",
    },
    major: breakdown("Reflow oven blower failure", "SM-90", "Zone 5 blower motor failed; the oven cannot hold profile. Line down until the motor is replaced."),
  },
  "board-tester": {
    breakdown: { meanHours: 500, minutes: [15, 40], causes: [breakdown("ICT fixture pin failure", "IC-03", "Bed-of-nails fixture pins worn; fixture swapped.")] },
    minor: { meanHours: 5, minutes: [2, 6], causes: [minor("Fixture vacuum not sealing", "IC-08", "Panel not pulled down on the fixture; operator re-seating it.")] },
    quality: { meanHours: 18, minutes: [15, 40], causes: [quality("In-circuit test fail streak", "QI-02", "Three panels failed ICT on the same net; held for analysis.")] },
  },
  "panel-line": {
    breakdown: { meanHours: 400, minutes: [15, 40], causes: [breakdown("Crimping tool fault", "PL-04", "Crimp height out of spec; tool being changed.")] },
    minor: { meanHours: 4, minutes: [2, 6], causes: [minor("Panel test retry", "PL-09", "End-of-line panel test retrying a step.")] },
  },
  agv: {
    breakdown: { meanHours: 120, minutes: [5, 15], causes: [breakdown("Lost navigation marker", "AGV-14", "Floor marker unreadable near the assembly hall exit.")] },
  },
};

/**
 * A problem that keeps coming back all week, so the demo always has schedules in
 * trouble and not just a happy path. Applies to the listed machines, and only while
 * they work on `orderId` when one is given. With real data these are simply the
 * repeat offenders the history already shows.
 */
export type ChronicTrouble = {
  machines: string[];
  orderId?: string;
  /** Mean running hours between occurrences. */
  mtbfHours: number;
  repairMin: [number, number];
  /** Minutes before the owner acknowledges it. */
  ackMin: [number, number];
  fault: FaultCause;
};

export const chronicTroubles: ChronicTrouble[] = [
  // ADB boards for e Vitara: voiding under the driver IC keeps sending panels to X-ray review,
  // so fewer boards make the overnight truck to Sanand.
  {
    machines: ["bwe-test-1"],
    orderId: "IO-71021",
    mtbfHours: 3,
    repairMin: [40, 100],
    ackMin: [6, 18],
    fault: quality(
      "Solder voiding on ADB driver boards",
      "QS-17",
      "X-ray shows voids above 5% under the driver IC thermal pad; panels held until the process engineer re-profiles the reflow oven.",
    ),
  },
  // e Vitara at Sanand II: matrix segments failing at the ADB function test, back to the line for a module swap.
  {
    machines: ["sn2-func-1"],
    orderId: "SA-61021",
    mtbfHours: 3.5,
    repairMin: [30, 70],
    ackMin: [8, 20],
    fault: quality(
      "ADB segment fault at matrix function test",
      "QF-21",
      "Two matrix segments do not switch at the ADB function test; headlamps go back to the line for a module swap.",
    ),
  },
  // Victoris projector reflectors (BMC, moulded at Bawal) outgassing in Dharuhera's metallizers.
  {
    machines: ["dhr-met-2"],
    orderId: "SA-61066",
    mtbfHours: 3,
    repairMin: [45, 100],
    ackMin: [5, 15],
    fault: quality(
      "Iridescence on metallized reflectors",
      "QV-12",
      "BMC reflectors from Bawal are outgassing in the chamber and leaving a rainbow film; the batch is held for re-coat while moulding checks drying time.",
    ),
  },
];
