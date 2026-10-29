"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { canSeePlant } from "@/domain/access";
import { plants } from "@/domain/catalog/plants";
import type { Snapshot } from "@/domain/types";
import { plantClock } from "@/lib/format";
import { boardSupplies } from "@/live/supply";
import { useLive } from "@/live/store";
import { plantHealth } from "@/live/selectors";
import { paceHealth, sprintTotals } from "@/live/sprint";
import { causesFacts, networkFacts, stopsFacts } from "@/brief/facts";
import { presetsFor, type Preset } from "@/brief/presets";
import { useBrief } from "@/store/brief";
import { Ring } from "@/components/charts/Ring";
import { useUserScope } from "@/components/shell/AppFrame";
import { Dot, Panel, healthColor, statusColor } from "@/components/ui/primitives";
import { AnswerCard } from "./AnswerCard";

const normalize = (q: string) => q.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

function greeting(now: number) {
  const hour = Number(new Date(now).toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

/** Every plant on one line: worst machine state and how much of the week's commitment is done. */
function Pulse({ snap }: { snap: Snapshot }) {
  const scope = useUserScope();
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Plants right now">
      {plants.map((p) => {
        const allowed = canSeePlant(scope, p.code);
        const h = plantHealth(snap, p.code);
        const t = sprintTotals(snap, snap.sprint.lines.filter((l) => l.plant === p.code));
        const share = t.committedHours ? t.doneHours / t.committedHours : null;
        const tone = h.worst === "down" || h.worst === "setup" ? statusColor[h.worst] : "var(--run)";
        const inner = (
          <>
            <Dot color={tone} className="size-1.5" />
            {p.code}
            {share !== null ? (
              <Ring value={share} color={healthColor[paceHealth(t.doneHours, t.committedHours, t.elapsed)]} size={14} stroke={2.5} label={`${p.code}: ${Math.round(share * 100)}% of this week's commitment done`} />
            ) : null}
          </>
        );
        const cls = "flex items-center gap-1.5 rounded-full border border-line bg-panel-strong px-2.5 py-1 text-[12px] font-semibold tabular-nums";
        return (
          <li key={p.code} title={`${p.code} ${p.name}`}>
            {allowed ? (
              <Link href={`/plants/${p.code.toLowerCase()}`} className={`${cls} hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ink`}>
                {inner}
              </Link>
            ) : (
              <span className={`${cls} opacity-50`}>{inner}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** A live number on each card, so the gallery is already a glance at the network. */
function useTeasers(snap: Snapshot | null) {
  const scope = useUserScope();
  return useMemo(() => {
    if (!snap) return {} as Record<string, { value: string; label: string; tone?: string }>;
    const net = networkFacts(snap, scope);
    const stops = stopsFacts(snap, scope);
    const lost = causesFacts(snap, scope).totalHoursLost;
    const escalate = stops.filter((s) => !s.acknowledged || s.openMinutes >= 30).length;
    const short = boardSupplies(snap, scope).filter((b) => b.health !== "on-track");
    return {
      morning: { value: `${net.week.pacePct}%`, label: "week pace", tone: healthColor[net.week.health] },
      risk: { value: `${net.ordersAtRisk}`, label: net.ordersAtRisk === 1 ? "schedule slipping" : "schedules slipping", tone: net.ordersAtRisk ? "var(--idle)" : undefined },
      hours: { value: `${Math.round(lost)} h`, label: "lost to stops" },
      call: { value: `${net.unacknowledgedStops}`, label: net.unacknowledgedStops === 1 ? "stop not picked up" : "stops not picked up", tone: net.unacknowledgedStops ? "var(--stop)" : undefined },
      sweep: { value: `${escalate}`, label: escalate === 1 ? "stop to escalate" : "stops to escalate", tone: escalate ? "var(--idle)" : undefined },
      supply: {
        value: `${short.length}`,
        label: short.length === 1 ? "plant short of boards" : "plants short of boards",
        tone: short.some((b) => b.health === "behind") ? "var(--stop)" : short.length ? "var(--idle)" : undefined,
      },
    } as Record<string, { value: string; label: string; tone?: string }>;
    // Recompute on each snapshot; the scope is stable for the session.
  }, [snap, scope]);
}

function PresetCard({ preset, teaser, onRun }: { preset: Preset; teaser?: { value: string; label: string; tone?: string }; onRun: () => void }) {
  return (
    <button
      type="button"
      onClick={onRun}
      className="group flex min-h-[132px] flex-col justify-between gap-3 rounded-2xl border border-line bg-panel px-4 py-3.5 text-left shadow-panel transition-[transform,box-shadow] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ink"
    >
      <span>
        <span className="block text-[14px] font-semibold">{preset.title}</span>
        <span className="mt-1 block text-[12px] leading-snug text-muted">{preset.blurb}</span>
      </span>
      {teaser ? (
        <span className="flex items-baseline gap-1.5">
          {teaser.tone ? <Dot color={teaser.tone} className="size-1.5 self-center" /> : null}
          <span className="font-stretch-semi-expanded text-[20px] leading-none font-semibold tabular-nums">{teaser.value}</span>
          <span className="text-[12px] text-muted">{teaser.label}</span>
        </span>
      ) : null}
    </button>
  );
}

export function BriefView() {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);
  const brief = useBrief();
  const turns = brief.userId === scope.user.id ? brief.turns : [];
  const presets = useMemo(() => presetsFor(scope), [scope]);
  const briefings = presets.filter((p) => p.kind === "briefing");
  const sweep = presets.find((p) => p.id === "sweep");
  const calls = presets.filter((p) => p.id.startsWith("customer:"));
  const teasers = useTeasers(snap);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const asking = turns.some((t) => t.source === "claude" && t.status === "working");

  useEffect(() => {
    // Bring the newest question to the top, so its answer unfolds below it.
    if (turns.length) threadRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [turns.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** Questions that match a preset run it on the spot; anything else goes to Claude. */
  const send = (question: string) => {
    const q = question.trim();
    if (!q) return;
    const preset = presets.find((p) => normalize(p.question) === normalize(q));
    if (preset) brief.runPreset(preset, scope);
    else if (!asking) void brief.ask(q, scope);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (asking) return;
    send(draft);
    setDraft("");
  };

  if (!snap) return <p className="grid h-full place-items-center text-[13px] text-muted">Replaying this week at the plants…</p>;

  const firstName = scope.user.name.split(" ")[0];

  return (
    <div className="absolute inset-0 scroller overflow-y-auto px-4 pt-[84px]">
      <div className="mx-auto flex min-h-full max-w-[1040px] flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pt-4">
          <div>
            <p className="text-[12px] text-muted">
              {plantClock(snap.now)} IST at the plants · you see {scope.summary}
            </p>
            <h1 className="font-stretch-semi-expanded text-[28px] leading-tight font-semibold">
              {greeting(snap.now)}, {firstName}.
            </h1>
          </div>
          <Pulse snap={snap} />
        </header>

        {turns.length === 0 ? (
          <div className="flex flex-col gap-5">
            <section className="flex flex-col gap-2.5">
              <h2 className="text-[13px] font-semibold">Briefings</h2>
              <div className={`grid gap-3 sm:grid-cols-2 ${briefings.length > 4 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
                {briefings.map((p) => (
                  <PresetCard key={p.id} preset={p} teaser={teasers[p.id]} onRun={() => brief.runPreset(p, scope)} />
                ))}
              </div>
            </section>
            <section className="flex flex-col gap-2.5">
              <h2 className="text-[13px] font-semibold">Workflows</h2>
              <div className="grid gap-3 lg:grid-cols-2">
                {sweep ? <PresetCard preset={sweep} teaser={teasers.sweep} onRun={() => brief.runPreset(sweep, scope)} /> : null}
                {calls.length ? (
                  <div className="flex min-h-[132px] flex-col justify-between gap-3 rounded-2xl border border-line bg-panel px-4 py-3.5 shadow-panel">
                    <span>
                      <span className="block text-[14px] font-semibold">Prep a customer call</span>
                      <span className="mt-1 block text-[12px] leading-snug text-muted">{calls[0].blurb}</span>
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      {calls.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => brief.runPreset(p, scope)}
                          className="rounded-full border border-line bg-panel-strong px-3 py-1 text-[12px] font-medium hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ink"
                        >
                          {p.title.replace("Prep a call with ", "")}
                        </button>
                      ))}
                    </span>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        ) : (
          <div ref={threadRef} className="flex flex-col gap-6 [&>*]:scroll-mt-[96px]">
            {turns.map((t) => (
              <AnswerCard key={t.id} turn={t} scope={scope} onFollowUp={send} />
            ))}
          </div>
        )}

        <div className="sticky bottom-0 mt-auto flex flex-col gap-2 bg-gradient-to-t from-page via-page/90 to-transparent pt-6 pb-4">
          {turns.length ? (
            <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap max-sm:-mx-4 max-sm:px-4 sm:flex-wrap">
              {[...briefings, ...(sweep ? [sweep] : [])].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => brief.runPreset(p, scope)}
                  className="shrink-0 rounded-full border border-line bg-panel-strong px-3 py-1 text-[12px] font-medium hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ink"
                >
                  {p.title}
                </button>
              ))}
              <button type="button" onClick={brief.clear} className="ml-auto shrink-0 rounded-md px-2 py-1 text-[12px] text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-ink">
                Start over
              </button>
            </div>
          ) : null}
          <form onSubmit={submit}>
            <Panel className="flex items-center gap-2 py-1.5 pr-1.5 pl-4">
              <label htmlFor="ask" className="sr-only">
                Ask about the plants
              </label>
              <input
                id="ask"
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={500}
                autoComplete="off"
                placeholder="Ask anything about the plants, e.g. why is Sanand II short of ADB boards?"
                className="h-10 min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-faint"
              />
              <kbd className="hidden rounded border border-line px-1.5 text-[11px] text-faint sm:block">/</kbd>
              <button
                type="submit"
                disabled={asking || !draft.trim()}
                className="h-9 shrink-0 rounded-xl bg-ink px-4 text-[13px] font-semibold text-page disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                {asking ? "Working…" : "Ask"}
              </button>
            </Panel>
          </form>
        </div>
      </div>
    </div>
  );
}
