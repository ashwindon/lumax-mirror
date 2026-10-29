import type { Scope } from "@/domain/access";
import { customers, orderById } from "@/domain/catalog/orders";
import { personById } from "@/domain/catalog/people";
import { plantByCode } from "@/domain/catalog/plants";
import type { Snapshot } from "@/domain/types";
import { day, lowerFirst } from "@/lib/format";
import { visibleOrders } from "@/live/selectors";
import { boardSupplies, coverLabel, importSupply, longHaulTrucks, weeks } from "@/live/supply";
import type { Answer, Block, Tone } from "./answer";
import { causesFacts, networkFacts, ordersFacts, stopsFacts, type OrderFact, type StopFact } from "./facts";

// Ready-made briefings and workflows. They are worked out from the live facts in
// the browser, so they answer instantly and need no model; Claude takes over for
// anything typed into the ask bar.

export type Preset = {
  id: string;
  kind: "briefing" | "workflow";
  title: string;
  /** What the card says it does. */
  blurb: string;
  /** How the question reads in the thread. */
  question: string;
  /** The trail a workflow walks through before its answer. */
  steps: (snap: Snapshot, scope: Scope) => string[];
  build: (snap: Snapshot, scope: Scope) => Answer;
};

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const first = (personId: string) => personById[personId]?.name.split(" ")[0] ?? "the owner";
const orderName = (o: OrderFact) => `${o.orderId} ${o.title}`;
const atRisk = (orders: OrderFact[]) => orders.filter((o) => o.health !== "on-track");
const toneOf = (orders: OrderFact[], stops: StopFact[]): Tone =>
  orders.some((o) => o.health === "behind") ? "bad" : orders.some((o) => o.health === "at-risk") || stops.some((s) => !s.acknowledged) ? "watch" : "good";

/** Up to four people worth a call, most urgent first, each with one reason. */
function whoToCall(orders: OrderFact[], stops: StopFact[]) {
  const picks = new Map<string, string>();
  const add = (personId: string, reason: string) => {
    if (picks.size < 4 && !picks.has(personId) && personById[personId]) picks.set(personId, reason);
  };
  for (const s of [...stops].filter((s) => !s.acknowledged).sort((a, b) => b.openMinutes - a.openMinutes)) {
    add(s.ownerId, `Has not picked up ${s.title.toLowerCase()} on ${s.machine} (${s.openMinutes} min)`);
  }
  for (const o of orders.filter((o) => o.health === "behind")) {
    add(o.leadId, `Leads ${o.orderId}, at ${o.pacePct}% pace with ${o.thisWeek.machineHoursLost} h lost this week`);
  }
  for (const s of [...stops].sort((a, b) => b.openMinutes - a.openMinutes)) {
    if (s.orderId && s.openMinutes >= 30) add(s.ownerId, `${s.title} on ${s.machine} is holding up ${s.orderId} (${s.openMinutes} min)`);
  }
  for (const o of orders.filter((o) => o.health === "at-risk")) add(o.leadId, `Leads ${o.orderId}, at ${o.pacePct}% pace`);
  return [...picks].map(([personId, reason]) => ({ personId, reason: reason.slice(0, 90) }));
}

const fullPlants = (snap: Snapshot, scope: Scope) =>
  networkFacts(snap, scope)
    .plants.filter((p) => p.access === "full" && p.week)
    .map((p) => p.code);

const morning: Preset = {
  id: "morning",
  kind: "briefing",
  title: "Morning brief",
  blurb: "Where the week stands, what slipped overnight, and who to talk to.",
  question: "Give me the morning brief.",
  steps: (snap, scope) => [`Reading ${plural(scope.plants.size, "plant")}`, "Checking every schedule against this week's plan", "Looking for stops nobody has picked up"],
  build(snap, scope) {
    const net = networkFacts(snap, scope);
    const orders = ordersFacts(snap, scope);
    const stops = stopsFacts(snap, scope);
    const risky = atRisk(orders);
    const behind = orders.filter((o) => o.health === "behind");
    const running = net.plants.filter((p) => p.access === "full").reduce((n, p) => n + p.machines.running, 0);
    const total = net.plants.filter((p) => p.access === "full").reduce((n, p) => n + p.machines.total, 0);
    const headline = behind.length
      ? `${orderName(behind[0])} is behind, and the week is at ${net.week.pacePct}% of plan overall.`
      : risky.length
        ? `${plural(risky.length, "schedule")} at risk; the week is at ${net.week.pacePct}% of plan.`
        : `Every schedule is on pace; the week is at ${net.week.pacePct}% of plan.`;
    const blocks: Block[] = [
      {
        type: "stats",
        items: [
          { label: "Week pace", value: `${net.week.pacePct}%`, sub: `of an even week, day ${net.weekDay} of 7`, tone: net.week.health === "on-track" ? "good" : net.week.health === "at-risk" ? "watch" : "bad" },
          { label: "Forecast by Monday", value: `${net.week.forecastPct}%`, sub: "of the commitment at today's rate" },
          { label: "Machines running", value: `${running}/${total}`, sub: `in ${plural(scope.plants.size, "plant")}` },
          { label: "Open stops", value: `${net.openStops}`, sub: net.unacknowledgedStops ? `${net.unacknowledgedStops} not picked up` : "All being handled", tone: net.unacknowledgedStops ? "watch" : undefined },
        ],
      },
      { type: "orders", title: risky.length ? "Schedules that need attention" : "Schedules this week", orderIds: (risky.length ? risky : orders).slice(0, 3).map((o) => o.orderId) },
    ];
    const codes = fullPlants(snap, scope);
    if (codes.length > 1) blocks.push({ type: "compare_plants", title: "Plants against this week's plan", measure: "week_pace", codes });
    const callList = whoToCall(orders, stops);
    if (callList.length) blocks.push({ type: "people", title: "Worth a call", items: callList.slice(0, 3) });
    return {
      headline,
      tone: toneOf(orders, stops),
      summary: `${net.unitsFinishedToday.toLocaleString("en-IN")} lamps and boards through their last step so far today, across ${plural(orders.length, "schedule")}.`,
      blocks,
      followUps: [behind[0] ? `Why is ${behind[0].orderId} behind?` : "What could still go wrong this week?", "Where are we losing hours?", "Who do I need to call right now?"],
    };
  },
};

const risk: Preset = {
  id: "risk",
  kind: "briefing",
  title: "What's at risk this week",
  blurb: "Schedules slipping against the plan, why, and who owns them.",
  question: "What's at risk this week?",
  steps: () => ["Checking every schedule against this week's plan", "Tracing what is holding the slow ones up"],
  build(snap, scope) {
    const orders = ordersFacts(snap, scope);
    const stops = stopsFacts(snap, scope);
    const risky = atRisk(orders);
    if (!risky.length) {
      return {
        headline: `All ${plural(orders.length, "schedule")} are on pace for this week's commitment.`,
        tone: "good",
        summary: stops.length ? `${plural(stops.length, "stop")} open, none on a slipping schedule yet.` : "Nothing is stopped right now.",
        blocks: [{ type: "orders", orderIds: orders.slice(0, 4).map((o) => o.orderId) }, { type: "burndown", title: "The week so far" }],
        followUps: ["Where are we losing hours?", "Which plant is furthest ahead?"],
      };
    }
    const worst = risky[0];
    const leads = [...new Map(risky.map((o) => [o.leadId, `Leads ${o.orderId}, at ${o.pacePct}% pace`])).entries()];
    const owners = worst.openStops.map((s) => [s.ownerId, `Owns ${s.title.toLowerCase()} on ${s.machine}, holding up ${s.orderId}`] as const);
    const people = [...new Map([...owners, ...leads]).entries()].slice(0, 4).map(([personId, reason]) => ({ personId, reason }));
    return {
      headline: `${plural(risky.length, "schedule")} slipping; ${orderName(worst)} is furthest off at ${worst.pacePct}% pace.`,
      tone: risky.some((o) => o.health === "behind") ? "bad" : "watch",
      summary: `At today's rate ${worst.orderId} finishes ${worst.thisWeek.forecastPct}% of its commitment by Monday, with ${worst.thisWeek.machineHoursLost} machine-hours lost so far${worst.openStops.length ? ` and ${plural(worst.openStops.length, "stop")} open on its route` : ""}.`,
      blocks: [
        { type: "orders", orderIds: risky.slice(0, 4).map((o) => o.orderId) },
        { type: "burndown", title: `${worst.orderId} this week`, orderId: worst.orderId },
        { type: "causes", title: `What cost ${worst.orderId} hours`, orderId: worst.orderId },
        { type: "people", title: "Who owns it", items: people },
      ],
      followUps: [`What would get ${worst.orderId} back on pace?`, `Is ${worst.customer} going to notice?`, "Where are we losing hours?"],
    };
  },
};

const hours: Preset = {
  id: "hours",
  kind: "briefing",
  title: "Where we're losing hours",
  blurb: "Stops ranked by machine-hours lost this week, and where they hit.",
  question: "Where are we losing hours?",
  steps: () => ["Adding up every stop this week", "Grouping them by cause and plant"],
  build(snap, scope) {
    const causes = causesFacts(snap, scope);
    const top = causes.causes[0];
    if (!top) {
      return { headline: "No stops recorded yet this week.", tone: "good", blocks: [{ type: "burndown" }], followUps: ["Give me the morning brief."] };
    }
    const share = causes.totalHoursLost ? Math.round((top.hoursLost / causes.totalHoursLost) * 100) : 0;
    const managers = top.plants.map((code) => plantByCode[code].managerId).filter((id) => personById[id]);
    const blocks: Block[] = [
      {
        type: "stats",
        items: [
          { label: "Hours lost this week", value: `${Math.round(causes.totalHoursLost)} h`, sub: `${plural(causes.causes.reduce((n, c) => n + c.stops, 0), "stop")}` },
          { label: "Biggest cause", value: `${share}%`, sub: top.cause.slice(0, 48), tone: share >= 40 ? "watch" : undefined },
        ],
      },
      { type: "causes", title: "By cause" },
    ];
    if (fullPlants(snap, scope).length > 1) blocks.push({ type: "compare_plants", title: "By plant", measure: "hours_lost_week" });
    blocks.push({
      type: "people",
      title: top.plants.length > 1 ? "Plants it hit" : "Runs the plant it hit",
      items: managers.slice(0, 3).map((id) => ({ personId: id, reason: `Runs ${personById[id].plants?.join(", ")}, where ${top.cause.toLowerCase()} cost ${top.hoursLost} h` })),
    });
    return {
      headline: `${top.cause} has cost ${top.hoursLost} h this week, more than any other cause.`,
      tone: share >= 40 ? "watch" : "good",
      summary: `That is ${share}% of the ${Math.round(causes.totalHoursLost)} machine-hours lost to stops so far, across ${plural(top.stops, "stop")} at ${top.plants.join(", ")}.`,
      blocks,
      followUps: [`Why does ${top.cause.toLowerCase()} keep happening?`, "Which schedules did it hurt?", "Who picks up stops slowest?"],
    };
  },
};

const call: Preset = {
  id: "call",
  kind: "briefing",
  title: "Who do I need to call",
  blurb: "Stops nobody has picked up, and the leads of schedules that are slipping.",
  question: "Who do I need to call right now?",
  steps: () => ["Finding stops nobody has picked up", "Matching stops to the schedules they hold up", "Finding who owns each one"],
  build(snap, scope) {
    const orders = ordersFacts(snap, scope);
    const stops = stopsFacts(snap, scope);
    const people = whoToCall(orders, stops);
    if (!people.length) {
      return {
        headline: "Nobody needs a call right now; every stop has an owner on it.",
        tone: "good",
        summary: stops.length ? `${plural(stops.length, "stop")} open, all acknowledged.` : "Nothing is stopped.",
        blocks: stops.length ? [{ type: "stops", alertIds: stops.slice(0, 4).map((s) => s.alertId) }] : [],
        followUps: ["Give me the morning brief.", "Where are we losing hours?"],
      };
    }
    const unacked = stops.filter((s) => !s.acknowledged);
    const relevant = [...unacked, ...stops.filter((s) => s.acknowledged && s.orderId && s.openMinutes >= 30)].slice(0, 4);
    const lead = personById[people[0].personId];
    return {
      headline: `Start with ${lead.name}: ${lowerFirst(people[0].reason)}.`,
      tone: unacked.length ? "bad" : "watch",
      blocks: [
        { type: "people", items: people },
        ...(relevant.length ? [{ type: "stops" as const, title: "The stops behind it", alertIds: relevant.map((s) => s.alertId) }] : []),
      ],
      followUps: ["How fast do stops usually get picked up?", "Run an escalation sweep."],
    };
  },
};

const sweep: Preset = {
  id: "sweep",
  kind: "workflow",
  title: "Escalation sweep",
  blurb: "Finds every stop over 30 minutes or not picked up, works out what it holds up, and drafts the note.",
  question: "Run an escalation sweep.",
  steps: (snap, scope) => [
    `Scanning open stops across ${plural(scope.plants.size, "plant")}`,
    "Keeping the ones over 30 minutes or not picked up",
    "Matching each to the schedule and due date it holds up",
    "Finding the owner and their plant manager",
    "Drafting the escalation note",
  ],
  build(snap, scope) {
    const stops = stopsFacts(snap, scope);
    const orders = ordersFacts(snap, scope);
    const hits = stops.filter((s) => !s.acknowledged || s.openMinutes >= 30).sort((a, b) => b.openMinutes - a.openMinutes);
    if (!hits.length) {
      return {
        headline: "Nothing to escalate: no stop is over 30 minutes and every one has been picked up.",
        tone: "good",
        blocks: stops.length ? [{ type: "stops", alertIds: stops.slice(0, 4).map((s) => s.alertId) }] : [],
        followUps: ["Give me the morning brief."],
      };
    }
    const orderOf = new Map(orders.map((o) => [o.orderId, o]));
    const owners = [...new Map(hits.map((s) => [s.ownerId, s])).values()];
    const lines = hits.slice(0, 6).map((s) => {
      const o = s.orderId ? orderOf.get(s.orderId) : undefined;
      return `- ${s.plant} ${s.machine}: ${s.title} (${s.code}), open ${s.openMinutes} min, ${s.acknowledged ? `${first(s.ownerId)} on it` : `not yet picked up by ${first(s.ownerId)}`}.${o ? ` Holds up ${o.orderId} for ${o.customer}, due ${o.due}, now at ${o.pacePct}% pace.` : ""}`;
    });
    const topPlant = hits[0].plant;
    const manager = plantByCode[topPlant].managerId;
    return {
      headline: `${plural(hits.length, "stop")} to escalate; the longest is ${hits[0].title.toLowerCase()} on ${hits[0].machine}, open ${hits[0].openMinutes} min.`,
      tone: hits.some((s) => !s.acknowledged) ? "bad" : "watch",
      blocks: [
        {
          type: "stats",
          items: [
            { label: "To escalate", value: `${hits.length}`, sub: `of ${plural(stops.length, "open stop")}` },
            { label: "Not picked up", value: `${hits.filter((s) => !s.acknowledged).length}`, tone: hits.some((s) => !s.acknowledged) ? "bad" : undefined },
            { label: "Schedules held up", value: `${new Set(hits.map((s) => s.orderId).filter(Boolean)).size}` },
          ],
        },
        { type: "stops", alertIds: hits.slice(0, 5).map((s) => s.alertId) },
        { type: "people", title: "Owners", items: owners.slice(0, 4).map((s) => ({ personId: s.ownerId, reason: `${s.title} on ${s.machine}, ${s.openMinutes} min` })) },
        {
          type: "draft",
          title: "Escalation note",
          toPersonId: manager,
          body: `Hi ${first(manager)},\n\nThese stops need someone on them now:\n${lines.join("\n")}\n\nCan you confirm an owner and an expected restart time for each within 30 minutes?\n\n${scope.user.name}`,
        },
      ],
      followUps: ["Who picks up stops slowest this week?", "What's at risk this week?"],
    };
  },
};

const supply: Preset = {
  id: "supply",
  kind: "briefing",
  title: "LED boards and imports",
  blurb: "Boards at each lamp plant and on the road from Bawal, and imported LED parts at sea.",
  question: "Are the lines covered for LED boards and imported parts?",
  steps: () => ["Checking the boards at each lamp plant", "Following the trucks from Bawal Electronics", "Counting imported parts at sea and at Bawal"],
  build(snap, scope) {
    const boards = boardSupplies(snap, scope).sort((a, b) => a.coverHours - b.coverHours);
    const trucks = longHaulTrucks(snap, scope);
    const held = trucks.filter((t) => t.delay);
    const imports = scope.user.role === "executive" || scope.plants.has("BWE") ? importSupply(snap) : null;
    const worst = boards[0];
    const short = boards.filter((b) => b.health !== "on-track");
    const where = (b: (typeof boards)[number]) => plantByCode[b.plant].name;
    const headline = !worst
      ? imports
        ? `Imported LED parts cover ${weeks(imports.coverWeeks)} of what Bawal's SMT lines use.`
        : "None of your schedules fit LED boards from Bawal."
      : worst.health === "behind"
        ? `${where(worst)} has run out of ${lowerFirst(worst.name)}; ${worst.userId} waits for the next truck from Bawal.`
        : worst.health === "at-risk"
          ? `${where(worst)} has ${coverLabel(worst.coverHours)} of boards left, less than the time to its next truck.`
          : `Every lamp line has boards until its next truck${imports ? `, and imported parts cover ${weeks(imports.coverWeeks)}` : ""}.`;
    const ids = [...new Set(short.flatMap((b) => [b.userId, b.supplierId]))];
    const people = [
      ...short.map((b) => ({ personId: plantByCode[b.plant].managerId, reason: `Runs ${where(b)}, ${b.onHand > 0 ? `${coverLabel(b.coverHours)} of boards on hand` : "out of boards"}` })),
      ...(short.length ? [{ personId: orderById[short[0].supplierId].leadEngineerId, reason: "Plans board builds and trucks at Bawal Electronics" }] : []),
      ...short.map((b) => ({ personId: orderById[b.userId].leadEngineerId, reason: `Leads ${b.userId} ${orderById[b.userId].title}` })),
    ].filter((p, k, all) => personById[p.personId] && all.findIndex((q) => q.personId === p.personId) === k);
    const blocks: Block[] = [
      {
        type: "stats",
        items: [
          ...(worst
            ? [{ label: "Lowest board cover", value: worst.onHand > 0 ? coverLabel(worst.coverHours) : "None", sub: where(worst), tone: worst.health === "on-track" ? ("good" as const) : worst.health === "at-risk" ? ("watch" as const) : ("bad" as const) }]
            : []),
          { label: "Trucks on the road", value: `${trucks.length}`, sub: held.length ? `${held.length} held on the way` : "None held", tone: held.length ? ("watch" as const) : undefined },
          ...(imports
            ? [
                { label: "Imported parts", value: `${imports.coverWeeks.toFixed(1)} wk`, sub: "at Bawal and at sea", tone: imports.health === "on-track" ? ("good" as const) : ("watch" as const) },
                { label: "Next lot at Bawal", value: imports.lots[0] ? day(imports.lots[0].arriveAt) : "None", sub: imports.lots[0]?.id },
              ]
            : []),
        ].slice(0, 4),
      },
      ...(ids.length ? [{ type: "orders" as const, title: "Schedules it touches", orderIds: ids.slice(0, 6) }] : []),
      ...(people.length ? [{ type: "people" as const, title: "Who to call", items: people.slice(0, 4) }] : []),
      {
        type: "note",
        title: "Why it matters",
        text: "Every LED lamp Lumax builds fits boards from Bawal Electronics, and most of the parts on them are imported through JNPT. A shift lost at Bawal reaches Sanand two days later and Bengaluru four or five days later.",
      },
    ];
    return {
      headline,
      tone: short.some((b) => b.health === "behind") ? "bad" : short.length || held.length ? "watch" : "good",
      summary: held.length
        ? held.map((t) => `The truck to ${plantByCode[t.to].name} is ${t.delay!.hours} h late: ${lowerFirst(t.delay!.reason)}.`).join(" ").slice(0, 320)
        : undefined,
      blocks,
      followUps: ["What is holding up the ADB boards at Bawal?", "When does the next truck reach Sanand II?", "What's at risk this week?"],
    };
  },
};

function customerCall(customerId: string, name: string): Preset {
  return {
    id: `customer:${customerId}`,
    kind: "workflow",
    title: `Prep a call with ${name}`,
    blurb: "Pulls their schedules, checks the week, and writes talking points you can use.",
    question: `Prepare me for a call with ${name}.`,
    steps: () => [`Finding ${name}'s schedules`, "Checking this week's pace on each", "Checking for stops on their routes", "Forecasting the week", "Writing talking points"],
    build(snap, scope) {
      const orders = ordersFacts(snap, scope).filter((o) => o.customer === name);
      const risky = atRisk(orders);
      const points = orders.map((o) => {
        const status =
          o.health === "on-track"
            ? `On plan this week (${o.thisWeek.unitsOut.toLocaleString("en-IN")} of ${o.thisWeek.unitsCommitted.toLocaleString("en-IN")} out)`
            : `Running behind this week's plan (${o.pacePct}% pace${o.openStops.length ? `, ${o.openStops[0].title.toLowerCase()} at ${o.openStops[0].plant}` : ""}); recovery owner is ${o.lead}`;
        return `- ${o.orderId} ${o.title}: ${o.unitsDoneOverall.toLocaleString("en-IN")} of ${o.quantity.toLocaleString("en-IN")} on this schedule delivered, due ${o.due}. ${status}.`;
      });
      return {
        headline: !risky.length
          ? `Everything for ${name} is on plan this week.`
          : risky.length === orders.length
            ? `${name}'s ${orders.length === 1 ? "schedule is" : "schedules are"} slipping this week; be ready to talk about ${risky[0].orderId}.`
            : `${risky.length} of their ${orders.length} schedules ${risky.length === 1 ? "is" : "are"} slipping this week; be ready to talk about ${risky[0].orderId}.`,
        tone: risky.some((o) => o.health === "behind") ? "bad" : risky.length ? "watch" : "good",
        blocks: [
          { type: "orders", orderIds: orders.map((o) => o.orderId) },
          { type: "people", title: "Bring in", items: [...new Set(orders.map((o) => o.leadId))].map((id) => ({ personId: id, reason: `Leads ${orders.filter((o) => o.leadId === id).map((o) => o.orderId).join(", ")}` })) },
          {
            type: "draft",
            title: "Talking points",
            to: name,
            body: `Where things stand:\n${points.join("\n")}\n\n${risky.length ? `What we are doing: ${risky.map((o) => `${o.lead} owns recovery on ${o.orderId}`).join("; ")}. We will confirm the recovery plan by end of day.` : "No changes to delivery dates expected."}`,
          },
        ],
        followUps: risky.length ? [`What would get ${risky[0].orderId} back on pace?`, `Will ${risky[0].orderId} make its due date?`] : ["What could still go wrong for them this week?"],
      };
    },
  };
}

/** The presets this user can run: the briefings, the sweep, and a call prep per OEM they can see. */
export function presetsFor(scope: Scope): Preset[] {
  const orders = visibleOrders(scope);
  const visible = new Set(orders.map((o) => o.customerId));
  const boards = orders.some((o) => o.consumes) ? [supply] : [];
  return [
    morning,
    risk,
    hours,
    call,
    ...boards,
    sweep,
    ...customers.filter((c) => visible.has(c.id) && c.group !== "Internal").map((c) => customerCall(c.id, c.name)),
  ];
}
