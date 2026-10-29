import type { Scope } from "@/domain/access";
import { customers, orderById } from "@/domain/catalog/orders";
import { personById } from "@/domain/catalog/people";
import { plantByCode } from "@/domain/catalog/plants";
import { crossingStep } from "@/domain/freight";
import type { Snapshot } from "@/domain/types";
import { visibleOrders } from "@/live/selectors";
import type { Answer, Block, Tone } from "./answer";
import { causesFacts, freightFacts, networkFacts, ordersFacts, stopsFacts, type OrderFact, type StopFact } from "./facts";

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
const orderName = (o: OrderFact) => `${o.orderId} ${o.title.toLowerCase()}`;
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
  steps: (snap, scope) => [`Reading ${plural(scope.plants.size, "plant")}`, "Checking every order against this week's plan", "Looking for stops nobody has picked up"],
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
        ? `${plural(risky.length, "order")} at risk; the week is at ${net.week.pacePct}% of plan.`
        : `Every order is on pace; the week is at ${net.week.pacePct}% of plan.`;
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
      { type: "orders", title: risky.length ? "Orders that need attention" : "Orders this week", orderIds: (risky.length ? risky : orders).slice(0, 3).map((o) => o.orderId) },
    ];
    const codes = fullPlants(snap, scope);
    if (codes.length > 1) blocks.push({ type: "compare_plants", title: "Plants against this week's plan", measure: "week_pace", codes });
    const callList = whoToCall(orders, stops);
    if (callList.length) blocks.push({ type: "people", title: "Worth a call", items: callList.slice(0, 3) });
    return {
      headline,
      tone: toneOf(orders, stops),
      summary: `${plural(net.unitsFinishedToday, "unit")} out of the door so far today across ${plural(orders.length, "order")}.`,
      blocks,
      followUps: [behind[0] ? `Why is ${behind[0].orderId} behind?` : "What could still go wrong this week?", "Where are we losing hours?", "Who do I need to call right now?"],
    };
  },
};

const risk: Preset = {
  id: "risk",
  kind: "briefing",
  title: "What's at risk this week",
  blurb: "Orders slipping against the plan, why, and who owns them.",
  question: "What's at risk this week?",
  steps: () => ["Checking every order against this week's plan", "Tracing what is holding the slow ones up"],
  build(snap, scope) {
    const orders = ordersFacts(snap, scope);
    const stops = stopsFacts(snap, scope);
    const risky = atRisk(orders);
    if (!risky.length) {
      return {
        headline: `All ${plural(orders.length, "order")} are on pace for this week's commitment.`,
        tone: "good",
        summary: stops.length ? `${plural(stops.length, "stop")} open, none on a slipping order yet.` : "Nothing is stopped right now.",
        blocks: [{ type: "orders", orderIds: orders.slice(0, 4).map((o) => o.orderId) }, { type: "burndown", title: "The week so far" }],
        followUps: ["Where are we losing hours?", "Which plant is furthest ahead?"],
      };
    }
    const worst = risky[0];
    const leads = [...new Map(risky.map((o) => [o.leadId, `Leads ${o.orderId}, at ${o.pacePct}% pace`])).entries()];
    const owners = worst.openStops.map((s) => [s.ownerId, `Owns ${s.title.toLowerCase()} on ${s.machine}, holding up ${s.orderId}`] as const);
    const people = [...new Map([...owners, ...leads]).entries()].slice(0, 4).map(([personId, reason]) => ({ personId, reason }));
    return {
      headline: `${plural(risky.length, "order")} slipping; ${orderName(worst)} is furthest off at ${worst.pacePct}% pace.`,
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
      followUps: [`Why does ${top.cause.toLowerCase()} keep happening?`, "Which orders did it hurt?", "Who picks up stops slowest?"],
    };
  },
};

const call: Preset = {
  id: "call",
  kind: "briefing",
  title: "Who do I need to call",
  blurb: "Stops nobody has picked up, and the leads of orders that are slipping.",
  question: "Who do I need to call right now?",
  steps: () => ["Finding stops nobody has picked up", "Matching stops to the orders they hold up", "Finding who owns each one"],
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
      headline: `Start with ${lead.name}: ${people[0].reason.charAt(0).toLowerCase()}${people[0].reason.slice(1)}.`,
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
    "Matching each to the order and due date it holds up",
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
            { label: "Orders held up", value: `${new Set(hits.map((s) => s.orderId).filter(Boolean)).size}` },
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

const usSupply: Preset = {
  id: "us-supply",
  kind: "briefing",
  title: "US supply line",
  blurb: "Stock at sea and in Conroe against the 2 to 3 months it needs.",
  question: "Is the US stock holding up?",
  steps: () => ["Counting what is on each ship to Houston", "Checking Conroe's stock against what it uses", "Checking what Pune ships this week"],
  build(snap, scope) {
    const f = freightFacts(snap, scope);
    const sorted = [...f.orders].sort((a, b) => a.coverWeeks - b.coverWeeks);
    const low = sorted[0];
    const short = f.orders.filter((o) => o.puneThisWeek?.short);
    const onTheWay = f.orders.reduce((n, o) => n + o.unitsOnTheWay, 0);
    const next = f.ships.find((s) => s.now !== "loading at JNPT") ?? f.ships[0];
    const range = sorted.length > 1 ? `${low.coverWeeks} to ${sorted[sorted.length - 1].coverWeeks}` : `${low.coverWeeks}`;
    const headline =
      low.health === "on-track"
        ? `US stock covers ${range} weeks of Conroe's use, inside the 2 to 3 months it needs.`
        : `${low.title} stock is down to ${low.coverWeeks} weeks, under the 2-month floor.`;
    const shortNote = short
      .map((o) => `${o.title}: Pune is on course for ${o.puneThisWeek!.forecastByWeekEnd} of ${o.puneThisWeek!.committed} this week. The rest would reach Conroe a week late, around ${o.puneThisWeek!.shortUnitsLandInConroe}, leaving ${o.puneThisWeek!.coverWeeksAfterShortfall} weeks of cover.`)
      .join(" ");
    const blocks: Block[] = [
      {
        type: "stats",
        items: [
          { label: "Lowest cover", value: `${low.coverWeeks} wk`, sub: low.title, tone: low.health === "on-track" ? "good" : low.health === "at-risk" ? "watch" : "bad" },
          { label: "On the way", value: `${onTheWay}`, sub: `units on ${plural(f.ships.length, "ship")}` },
          {
            label: "Next into Conroe",
            value: next ? next.atConroe : "None",
            sub: next ? next.contents.map((c) => plural(c.units, orderById[c.orderId].unitName.toLowerCase())).join(", ").slice(0, 48) : undefined,
          },
          { label: "Pune this week", value: short.length ? `${short.length} short` : "On course", sub: "for next week's sailing", tone: short.length ? "watch" : "good" },
        ],
      },
      { type: "orders", title: "Orders finished in Conroe", orderIds: f.orders.map((o) => o.orderId) },
      {
        type: "note",
        title: "Why the buffer exists",
        text: `Door to door is ${f.doorToDoorDays} days: a truck to JNPT, a weekly sailing of 35 to 45 days to Houston, then customs and a truck to Conroe. A stop in Pune today shows up in Conroe about two months later, and the stock at sea and on site is what absorbs it.`,
      },
    ];
    return {
      headline,
      tone: low.health === "behind" ? "bad" : low.health === "at-risk" || short.length ? "watch" : "good",
      summary: shortNote ? shortNote.slice(0, 320) : `Pune is on course to ship this week's plan for every order finished in Conroe.`,
      blocks,
      followUps: ["What happens if L10 stops for a day?", "Which ship lands next in Houston?", "What's at risk this week?"],
    };
  },
};

function customerCall(customerId: string, name: string): Preset {
  return {
    id: `customer:${customerId}`,
    kind: "workflow",
    title: `Prep a call with ${name}`,
    blurb: "Pulls their orders, checks the week, and writes talking points you can use.",
    question: `Prepare me for a call with ${name}.`,
    steps: () => [`Finding ${name}'s orders`, "Checking this week's pace on each", "Checking for stops on their routes", "Forecasting the week", "Writing talking points"],
    build(snap, scope) {
      const orders = ordersFacts(snap, scope).filter((o) => o.customer === name);
      const risky = atRisk(orders);
      const points = orders.map((o) => {
        const status =
          o.health === "on-track"
            ? `On plan this week (${o.thisWeek.unitsOut} of ${o.thisWeek.unitsCommitted} ${o.title.toLowerCase()} out)`
            : `Running behind this week's plan (${o.pacePct}% pace${o.openStops.length ? `, ${o.openStops[0].title.toLowerCase()} at ${o.openStops[0].plant}` : ""}); recovery owner is ${o.lead}`;
        return `- ${o.orderId} ${o.title}: ${o.unitsDoneOverall} of ${o.quantity} delivered overall, due ${o.due}. ${status}.`;
      });
      return {
        headline: !risky.length
          ? `Everything for ${name} is on plan this week.`
          : risky.length === orders.length
            ? `${name}'s ${orders.length === 1 ? "order is" : "orders are"} slipping this week; be ready to talk about ${risky[0].orderId}.`
            : `${risky.length} of their ${orders.length} orders ${risky.length === 1 ? "is" : "are"} slipping this week; be ready to talk about ${risky[0].orderId}.`,
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

/** The presets this user can run: the briefings, the sweep, and a call prep per customer they can see. */
export function presetsFor(scope: Scope): Preset[] {
  const orders = visibleOrders(scope);
  const visible = new Set(orders.map((o) => o.customerId));
  const us = orders.some((o) => crossingStep.has(o.id)) ? [usSupply] : [];
  return [morning, risk, hours, call, ...us, sweep, ...customers.filter((c) => visible.has(c.id)).map((c) => customerCall(c.id, c.name))];
}
