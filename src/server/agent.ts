import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { canSeeAlert, canSeeOrder, type Scope } from "@/domain/access";
import { personById } from "@/domain/catalog/people";
import { plantByCode } from "@/domain/catalog/plants";
import type { PlantCode } from "@/domain/types";
import { tenant } from "@/lib/tenant";
import { answerSchema, type Answer, type AskEvent, type AskTurn, type Block } from "@/brief/answer";
import {
  causesFacts,
  clock,
  freightFacts,
  networkFacts,
  orderDetailFacts,
  ordersFacts,
  peopleFacts,
  plantDetailFacts,
  responseFacts,
  stopsFacts,
  velocityFacts,
} from "@/brief/facts";
import { liveSnapshot } from "./twin";

const MODEL = "claude-opus-5-5";
/** Tool rounds before giving up; a good answer needs two or three. */
const MAX_TURNS = 8;

const SYSTEM = `You are the operations analyst inside ${tenant.product}, the live digital twin of ${tenant.name}'s manufacturing network: 10 plants around Pune (L01 to L10) doing heat treatment, machining, fabrication, welding, coating and galvanizing, and one in Conroe, Texas (U01) that finishes work shipped from Pune by sea for US customers: precision machining, premium threading, coating, assembly and test. Senior people ask you what is going on and you answer from live plant data.

How the plants run:
- A customer order (e.g. SO-24117 Metro bogie frames) is a route of operations across several plants. Units move between plants by truck.
- Orders finished in Conroe (drill collars, frac gate valves) are rough-machined in Pune and shipped by sea: a truck to JNPT, a weekly Wednesday sailing of 35 to 45 days to the Port of Houston, then customs and a truck to Conroe, 40 to 60 days door to door. To ride out that gap, ${tenant.shortName} keeps 2 to 3 months (8 to 13 weeks) of what Conroe uses at sea and on site. A shortfall in Pune this week reaches Conroe about two months later, so judge it by what it does to that cover.
- Work is planned as a weekly sprint. Every Monday at 06:00 IST each order commits a number of units through every step of its route, measured in standard machine-hours. "Pace" is hours done against where an even week would be by now: 100% is on plan, 90 to 98% is at risk, under 90% is behind.
- Stops are breakdowns, quality holds, material shortages and set-ups on a machine. Each has a named owner who should acknowledge it. Machine-hours lost to stops are the main reason orders fall behind.
- Every person, machine, order and customer in this demo is fictional. Plant names and specialties are real.

How to work:
- Get the facts with the tools before answering. Never state a number you did not read from a tool. The data is already limited to what the person asking may see; if something is out of their reach, say so plainly.
- Find the cause, not just the symptom: when an order is behind, trace it to the step, the machine, the stop and the person who owns it.
- Finish by calling present_answer exactly once. Do not write the answer as plain text.

How to present:
- The reader is an executive with a minute to spare. The headline is the answer in one sentence, conclusion first, with the number that matters.
- Use two to four blocks; fewer is better when it answers the question. Prefer the visual blocks (orders, plants, compare_plants, burndown, causes, stops, people) over prose: they are drawn from live data by id. Use stats for at most four numbers you read from tools. A note is for context no visual can show, two sentences at most.
- When someone needs to act, include a people block naming who to call and why in a few words. Use draft only when the reader asked for a message or talking points.
- Follow-ups are the next questions this reader would plausibly ask, in their words.
- Plain, direct language. No filler, no hedging, no markdown in text fields.`;

const plantCode = z.enum(Object.keys(plantByCode) as [PlantCode, ...PlantCode[]]);
const only = z.object({ plant: plantCode.optional(), orderId: z.string().optional() });

/** One read-only tool: its input schema, how the trail describes the call, and what it returns. */
type ToolDef<S extends z.ZodType> = {
  description: string;
  input: S;
  label: (input: z.infer<S>) => string;
  run: (scope: Scope, input: z.infer<S>) => unknown;
};
const tool = <S extends z.ZodType>(def: ToolDef<S>) => def;

const tools = {
  get_network: tool({
    description: "Network overview right now: this week's pace, units out today, open stops, and per plant its machine status, utilization, pace and hours lost. Start here for broad questions.",
    input: z.object({}),
    label: () => "Checking every plant",
    run: (scope) => networkFacts(liveSnapshot(), scope),
  }),
  list_orders: tool({
    description: "Every order the user can see, slowest first: customer, due date, lead engineer, pace and health this week, units out against commitment, forecast, hours lost and open stops on its route.",
    input: z.object({}),
    label: () => "Checking every order against this week's plan",
    run: (scope) => ordersFacts(liveSnapshot(), scope),
  }),
  get_order: tool({
    description: "One order step by step: each operation's plant, done against committed this week, health, and units on a machine, waiting, or in transit. Use it to find which step is holding an order up.",
    input: z.object({ orderId: z.string().describe("e.g. SO-24117") }),
    label: (i) => `Tracing ${i.orderId} through its route`,
    run: (scope, i) => orderDetailFacts(liveSnapshot(), scope, i.orderId.toUpperCase()),
  }),
  get_plant: tool({
    description: "One plant machine by machine: status and for how long, what it is working on, any stop and its cause, the owner, and committed hours done this week against its share.",
    input: z.object({ plant: plantCode }),
    label: (i) => `Walking the floor at ${i.plant}`,
    run: (scope, i) => plantDetailFacts(liveSnapshot(), scope, i.plant),
  }),
  list_stops: tool({
    description: "Open stops (breakdowns, quality holds, material shortages, set-ups), most serious and oldest first, with cause, minutes open, owner, whether acknowledged and the order it holds up.",
    input: z.object({
      plant: plantCode.optional(),
      kind: z.enum(["breakdown", "quality", "material", "setup"]).optional(),
      unacknowledgedOnly: z.boolean().optional(),
    }),
    label: (i) => (i.unacknowledgedOnly ? "Finding stops nobody has picked up" : `Reading open stops${i.plant ? ` at ${i.plant}` : ""}`),
    run: (scope, i) => stopsFacts(liveSnapshot(), scope, i),
  }),
  get_stop_causes: tool({
    description: "Machine-hours lost to stops this week grouped by cause, biggest first, optionally for one plant or order.",
    input: only,
    label: (i) => `Adding up hours lost${i.orderId ? ` on ${i.orderId}` : i.plant ? ` at ${i.plant}` : ""}`,
    run: (scope, i) => causesFacts(liveSnapshot(), scope, i),
  }),
  get_response_times: tool({
    description: "How quickly each owner acknowledges stops this week, slowest first.",
    input: z.object({ plant: plantCode.optional() }),
    label: () => "Checking how fast stops get picked up",
    run: (scope, i) => responseFacts(liveSnapshot(), scope, i.plant),
  }),
  get_velocity: tool({
    description: "Committed against done machine-hours for the last six weeks and this week, optionally for one plant or order. Earlier weeks are simulated.",
    input: only,
    label: () => "Comparing with earlier weeks",
    run: (scope, i) => velocityFacts(liveSnapshot(), scope, i),
  }),
  get_sea_freight: tool({
    description:
      "The sea lane from Pune to Conroe: each ship and what it carries, when it reaches Houston and Conroe, the US stock per order in weeks of Conroe's use against the 8 to 13 week target, and whether Pune ships this week's plan.",
    input: z.object({}),
    label: () => "Checking the ships to Houston",
    run: (scope) => freightFacts(liveSnapshot(), scope),
  }),
  find_people: tool({
    description: "People by name, job title or plant code, with extension, the orders they lead, the machines they own and their open stops. An empty query lists everyone.",
    input: z.object({ query: z.string() }),
    label: (i) => (i.query ? `Looking up ${i.query}` : "Looking up the team"),
    run: (scope, i) => peopleFacts(liveSnapshot(), scope, i.query),
  }),
};

type ToolName = keyof typeof tools;

const PRESENT = "present_answer";

/** JSON Schema for a tool input, without the dialect marker zod adds. */
function inputSchema(schema: z.ZodType) {
  const json = z.toJSONSchema(schema) as Record<string, unknown>;
  delete json.$schema;
  return json as Anthropic.Beta.BetaTool.InputSchema;
}

const toolParams: Anthropic.Beta.BetaToolUnion[] = [
  ...Object.entries(tools).map(([name, t]) => ({
    name,
    description: t.description,
    input_schema: inputSchema(t.input),
  })),
  {
    name: PRESENT,
    description:
      "Show the answer to the reader. Call it once, last. Blocks that take ids are drawn live from the twin: orders by order id, plants by plant code, stops by alertId, people by personId, exactly as the tools returned them.",
    input_schema: inputSchema(answerSchema),
  },
];

/** Drops ids that do not exist or that the reader may not see, and blocks left empty by that. */
function sanitize(answer: Answer, scope: Scope): Answer {
  const snap = liveSnapshot();
  const alerts = new Map(snap.alerts.map((a) => [a.id, a]));
  const blocks = answer.blocks
    .map((b): Block | null => {
      switch (b.type) {
        case "orders": {
          const orderIds = b.orderIds.map((x) => x.toUpperCase()).filter((x) => canSeeOrder(scope, x));
          return orderIds.length ? { ...b, orderIds } : null;
        }
        case "stops": {
          const alertIds = b.alertIds.filter((x) => alerts.has(x) && canSeeAlert(scope, alerts.get(x)!));
          return alertIds.length ? { ...b, alertIds } : null;
        }
        case "people": {
          const items = b.items.filter((p) => personById[p.personId]);
          return items.length ? { ...b, items } : null;
        }
        case "draft":
          return { ...b, toPersonId: b.toPersonId && personById[b.toPersonId] ? b.toPersonId : undefined };
        case "burndown":
        case "causes":
          return b.orderId && !canSeeOrder(scope, b.orderId.toUpperCase()) ? null : { ...b, orderId: b.orderId?.toUpperCase() };
        default:
          return b;
      }
    })
    .filter((b): b is Block => b !== null);
  return { ...answer, blocks };
}

const describe = (issues: z.core.$ZodIssue[]) => issues.map((i) => `${i.path.join(".") || "answer"}: ${i.message}`).join("; ");

/** Answers one question, sending each step of the work and then the answer to `emit`. */
export async function ask(scope: Scope, question: string, history: AskTurn[], emit: (e: AskEvent) => void) {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    emit({ type: "error", code: "no-key", message: "Custom questions need the Claude connection, which is not set up on this deployment yet." });
    return;
  }
  const client = new Anthropic();
  const { user } = scope;
  const snap = liveSnapshot();

  const messages: Anthropic.Beta.BetaMessageParam[] = [];
  for (const turn of history.slice(-6)) {
    if (!turn.answer) continue;
    messages.push({ role: "user", content: turn.question });
    messages.push({ role: "assistant", content: [turn.answer.headline, turn.answer.summary].filter(Boolean).join(" ") });
  }
  messages.push({
    role: "user",
    content: `[Asked by ${user.name}, ${user.title}, who can see ${scope.summary}. Time at the plants: ${clock(snap).asOf}.]\n\n${question}`,
  });

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: SYSTEM,
      tools: toolParams,
      messages,
      cache_control: { type: "ephemeral" },
      output_config: { effort: "medium" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });

    if (response.stop_reason === "refusal") {
      emit({ type: "error", code: "refused", message: "Claude declined to answer that one. Try asking it a different way." });
      return;
    }
    if (response.stop_reason === "max_tokens") {
      emit({ type: "error", code: "failed", message: "The answer ran too long. Try a narrower question." });
      return;
    }
    messages.push({ role: "assistant", content: response.content });

    const calls = response.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (!calls.length) {
      messages.push({ role: "user", content: `Show that with ${PRESENT}.` });
      continue;
    }

    const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
    let answer: Answer | null = null;
    for (const call of calls) {
      if (call.name === PRESENT) {
        const parsed = answerSchema.safeParse(call.input);
        if (parsed.success) answer = sanitize(parsed.data, scope);
        results.push(
          parsed.success
            ? { type: "tool_result", tool_use_id: call.id, content: "Shown." }
            : { type: "tool_result", tool_use_id: call.id, is_error: true, content: `Not shown, fix and call again: ${describe(parsed.error.issues)}` },
        );
        continue;
      }
      const def = tools[call.name as ToolName] as ToolDef<z.ZodType> | undefined;
      const input = def?.input.safeParse(call.input);
      if (!def || !input?.success) {
        results.push({ type: "tool_result", tool_use_id: call.id, is_error: true, content: def ? describe(input!.error!.issues) : `No tool named ${call.name}.` });
        continue;
      }
      emit({ type: "step", label: def.label(input.data) });
      results.push({ type: "tool_result", tool_use_id: call.id, content: JSON.stringify(def.run(scope, input.data)) });
    }

    if (answer) {
      emit({ type: "answer", answer, asOf: liveSnapshot().now });
      return;
    }
    messages.push({ role: "user", content: results });
  }
  emit({ type: "error", code: "failed", message: "That took more digging than expected. Try a narrower question." });
}
