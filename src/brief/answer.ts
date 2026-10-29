import { z } from "zod";
import { plants } from "@/domain/catalog/plants";
import type { PlantCode } from "@/domain/types";

// The shape of every answer on the briefing page, whether a preset built it or
// Claude did. Blocks point at real orders, plants, stops and people by id; the
// browser draws them from the live feed, so the numbers on a card keep moving
// and cannot drift from what the twin shows. Only headlines, notes, stat tiles
// and drafts carry text the author wrote.

const id = z.string().min(1).max(40);
const short = (max: number) => z.string().min(1).max(max);

export const tones = ["good", "watch", "bad"] as const;
const tone = z.enum(tones);

const plantCode = z.enum(plants.map((p) => p.code) as [PlantCode, ...PlantCode[]]);
const only = { plant: plantCode.optional(), orderId: id.optional() };
const title = short(60).optional();

export const plantMeasures = ["week_pace", "utilization_today", "hours_lost_week", "open_stops"] as const;

export const blockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("stats"),
    items: z
      .array(z.object({ label: short(32), value: short(16), sub: short(48).optional(), tone: tone.optional() }))
      .min(1)
      .max(4),
  }),
  z.object({ type: z.literal("orders"), title, orderIds: z.array(id).min(1).max(6) }),
  z.object({ type: z.literal("plants"), title, codes: z.array(plantCode).min(1).max(11) }),
  z.object({ type: z.literal("compare_plants"), title, measure: z.enum(plantMeasures), codes: z.array(plantCode).max(11).optional() }),
  z.object({ type: z.literal("burndown"), title, ...only }),
  z.object({ type: z.literal("causes"), title, ...only }),
  z.object({ type: z.literal("stops"), title, alertIds: z.array(id).min(1).max(6) }),
  z.object({
    type: z.literal("people"),
    title,
    items: z.array(z.object({ personId: id, reason: short(90) })).min(1).max(4),
  }),
  z.object({ type: z.literal("note"), title, text: short(420) }),
  z.object({ type: z.literal("draft"), title, toPersonId: id.optional(), to: short(60).optional(), body: short(900) }),
]);

export const answerSchema = z.object({
  headline: short(140).describe("One sentence that answers the question. Lead with the conclusion."),
  tone: tone.describe("good: nothing needs the reader. watch: something to keep an eye on. bad: something needs action."),
  summary: short(320).optional().describe("At most two short sentences of context the visuals do not already show."),
  blocks: z.array(blockSchema).max(4),
  followUps: z.array(short(70)).max(3).describe("Questions the reader is likely to ask next, phrased as they would ask them."),
});

export type Tone = z.infer<typeof tone>;
export type Block = z.infer<typeof blockSchema>;
export type Answer = z.infer<typeof answerSchema>;
export type PlantMeasure = (typeof plantMeasures)[number];

/** One line of the trail shown while an answer is being put together. */
export type Step = { label: string };

/** What /api/ask streams back, one JSON object per line. */
export type AskEvent =
  | { type: "step"; label: string }
  | { type: "answer"; answer: Answer; asOf: number }
  | { type: "error"; code: "no-key" | "refused" | "failed" | "unauthorized"; message: string };

/** Earlier turns sent back with a question, so follow-ups have context. */
export type AskTurn = { question: string; answer?: Pick<Answer, "headline" | "summary"> };
