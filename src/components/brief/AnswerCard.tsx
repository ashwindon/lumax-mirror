"use client";

import { useState } from "react";
import type { Scope } from "@/domain/access";
import { plantClock } from "@/lib/format";
import { useLive } from "@/live/store";
import type { Turn } from "@/store/brief";
import { Dot, Panel } from "@/components/ui/primitives";
import { BlockView, toneColor, toneLabel, wideBlocks } from "./blocks";

const sourceLabel: Record<Turn["source"], string> = { briefing: "Briefing", workflow: "Workflow", claude: "Asked Claude" };

function Check() {
  return (
    <svg viewBox="0 0 12 12" className="size-3 shrink-0" aria-hidden>
      <path d="M2.5 6.2 5 8.6l4.5-5" fill="none" stroke="var(--run)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return <span className="size-3 shrink-0 animate-spin rounded-full border-[1.5px] border-line border-t-ink" aria-hidden />;
}

/** The checks behind an answer: live while it is worked out, folded away once it lands. */
function Trail({ turn }: { turn: Turn }) {
  const [open, setOpen] = useState(false);
  const working = turn.status === "working";
  const steps = working ? [...turn.steps, ...(turn.source === "claude" ? ["Thinking it through"] : [])] : turn.steps;
  if (!working && !steps.length) return null;
  if (!working && !open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="self-start rounded-md text-[12px] text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-ink">
        Checked {steps.length} thing{steps.length === 1 ? "" : "s"} ›
      </button>
    );
  }
  return (
    <ol className="flex flex-col gap-1.5" aria-live="polite">
      {steps.map((s, i) => {
        const current = working && i === steps.length - 1;
        return (
          <li key={i} className={`flex items-center gap-2 text-[13px] ${current ? "text-ink" : "text-muted"}`}>
            {current ? <Spinner /> : <Check />}
            {s}
          </li>
        );
      })}
    </ol>
  );
}

export function AnswerCard({ turn, scope, onFollowUp }: { turn: Turn; scope: Scope; onFollowUp: (q: string) => void }) {
  const snap = useLive((s) => s.snap);
  const a = turn.answer;

  return (
    <article className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-2 pl-12">
        <p className="rounded-2xl rounded-br-md bg-ink px-3.5 py-2 text-[14px] text-page">{turn.question}</p>
      </div>
      <Panel className="flex flex-col gap-4 px-5 py-4">
        <div className="flex items-center gap-2 text-[12px] text-muted">
          <span className="font-medium">{sourceLabel[turn.source]}</span>
          {turn.asOf ? <span>· as of {plantClock(turn.asOf)} IST</span> : null}
        </div>

        {turn.status !== "done" || !a ? <Trail turn={turn} /> : null}

        {turn.status === "error" && turn.error ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-line bg-panel-strong/70 px-4 py-3">
            <Dot color={turn.error.code === "no-key" ? "var(--idle)" : "var(--stop)"} className="mt-1.5 size-2" />
            <div className="text-[13px]">
              <p className="font-semibold">{turn.error.code === "no-key" ? "Claude is not connected here yet" : "No answer this time"}</p>
              <p className="text-muted">
                {turn.error.message}
                {turn.error.code === "no-key" ? " The briefings and workflows still work without it." : ""}
              </p>
            </div>
          </div>
        ) : null}

        {a && snap ? (
          <>
            <div className="flex flex-col gap-1.5">
              <p className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: toneColor[a.tone] }}>
                <Dot color={toneColor[a.tone]} className="size-1.5" />
                {toneLabel[a.tone]}
              </p>
              <h2 className="font-stretch-semi-expanded text-[21px] leading-snug font-semibold text-balance">{a.headline}</h2>
              {a.summary ? <p className="max-w-[70ch] text-[14px] leading-relaxed text-muted">{a.summary}</p> : null}
            </div>
            {a.blocks.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {a.blocks.map((b, i) => (
                  <div key={i} className={`min-w-0 ${wideBlocks.has(b.type) ? "md:col-span-2" : ""}`}>
                    <BlockView block={b} snap={snap} scope={scope} />
                  </div>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <Trail turn={turn} />
              {a.followUps.length ? <span className="mx-1 h-3 w-px bg-line" aria-hidden /> : null}
              {a.followUps.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onFollowUp(q)}
                  className="rounded-full border border-line px-3 py-1 text-[12px] font-medium hover:bg-panel-strong focus-visible:outline-2 focus-visible:outline-ink"
                >
                  {q}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </Panel>
    </article>
  );
}
