import { create } from "zustand";
import type { Scope } from "@/domain/access";
import type { Answer, AskEvent, AskTurn } from "@/brief/answer";
import type { Preset } from "@/brief/presets";
import { useLive } from "@/live/store";

export type Turn = {
  id: number;
  question: string;
  source: "briefing" | "workflow" | "claude";
  status: "working" | "done" | "error";
  steps: string[];
  answer?: Answer;
  asOf?: number;
  error?: { code: string; message: string };
};

type BriefState = {
  /** Whose thread this is; switching person starts a fresh one. */
  userId: string | null;
  turns: Turn[];
  runPreset: (preset: Preset, scope: Scope) => void;
  ask: (question: string, scope: Scope) => Promise<void>;
  clear: () => void;
};

let nextId = 1;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const useBrief = create<BriefState>((set, get) => {
  const start = (scope: Scope, turn: Omit<Turn, "id" | "status" | "steps">) => {
    const id = nextId++;
    const keep = get().userId === scope.user.id ? get().turns : [];
    set({ userId: scope.user.id, turns: [...keep, { ...turn, id, status: "working", steps: [] }] });
    return id;
  };
  const update = (id: number, patch: (t: Turn) => Partial<Turn>) =>
    set((s) => ({ turns: s.turns.map((t) => (t.id === id ? { ...t, ...patch(t) } : t)) }));

  return {
    userId: null,
    turns: [],

    // Presets run here against the live feed. The trail is walked at reading pace so
    // the reader can see what was checked; the answer is built from the latest data.
    runPreset(preset, scope) {
      const snap = useLive.getState().snap;
      if (!snap) return;
      const id = start(scope, { question: preset.question, source: preset.kind });
      const steps = preset.steps(snap, scope);
      const pause = preset.kind === "workflow" ? 520 : 320;
      void (async () => {
        for (const step of steps) {
          update(id, (t) => ({ steps: [...t.steps, step] }));
          await wait(pause);
        }
        const latest = useLive.getState().snap ?? snap;
        update(id, () => ({ status: "done", answer: preset.build(latest, scope), asOf: latest.now }));
      })();
    },

    async ask(question, scope) {
      const history: AskTurn[] = (get().userId === scope.user.id ? get().turns : [])
        .filter((t) => t.status === "done" && t.answer)
        .map((t) => ({ question: t.question, answer: { headline: t.answer!.headline, summary: t.answer!.summary } }));
      const id = start(scope, { question, source: "claude" });
      const fail = (message: string, code = "failed") => update(id, () => ({ status: "error", error: { code, message } }));

      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: scope.user.id, question, history }),
        });
        if (!res.ok || !res.body) return fail("Could not reach the briefing service. Try again.");
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value;
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const e = JSON.parse(line) as AskEvent;
            if (e.type === "step") update(id, (t) => ({ steps: [...t.steps, e.label] }));
            else if (e.type === "answer") update(id, () => ({ status: "done", answer: e.answer, asOf: e.asOf }));
            else fail(e.message, e.code);
          }
        }
        if (get().turns.find((t) => t.id === id)?.status === "working") fail("The answer was cut off. Try again.");
      } catch {
        fail("Lost the connection while answering. Try again.");
      }
    },

    clear: () => set({ turns: [] }),
  };
});
