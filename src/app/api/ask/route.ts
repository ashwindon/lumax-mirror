import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { scopeFor } from "@/domain/access";
import { personById } from "@/domain/catalog/people";
import type { AskEvent } from "@/brief/answer";
import { ask } from "@/server/agent";

// A question can take several tool rounds with Claude.
export const maxDuration = 60;

const body = z.object({
  userId: z.string(),
  question: z.string().trim().min(1).max(500),
  history: z
    .array(z.object({ question: z.string().max(500), answer: z.object({ headline: z.string(), summary: z.string().optional() }).optional() }))
    .max(20)
    .default([]),
});

/** Streams the work as newline-delimited JSON: a "step" per tool call, then the "answer" or an "error". */
export async function POST(request: Request) {
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request" }, { status: 400 });

  // Demo sign-in: the persona id decides the scope, as it does in the browser.
  // Real sign-in replaces this with the verified identity from the session.
  const person = personById[parsed.data.userId];
  if (!person) return Response.json({ error: "Unknown user" }, { status: 401 });
  const scope = scopeFor(person);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (e: AskEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(e)}\n`));
      try {
        await ask(scope, parsed.data.question, parsed.data.history, emit);
      } catch (err) {
        const message =
          err instanceof Anthropic.AuthenticationError
            ? "The Claude connection is not authorized. Check the API key on this deployment."
            : err instanceof Anthropic.RateLimitError
              ? "Claude is busy right now. Try again in a moment."
              : err instanceof Anthropic.APIError
                ? `Claude returned an error (${err.status ?? "network"}). Try again.`
                : "Something went wrong answering that. Try again.";
        console.error("ask failed", err);
        emit({ type: "error", code: "failed", message });
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
}
