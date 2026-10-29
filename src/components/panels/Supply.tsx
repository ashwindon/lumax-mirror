"use client";

import { orderById } from "@/domain/catalog/orders";
import { plantByCode } from "@/domain/catalog/plants";
import { IMPORT_COVER_WEEKS, importLegs, type ImportLeg } from "@/domain/freight";
import { count, day, dayTime, num } from "@/lib/format";
import {
  boardSupplies,
  boardSupply,
  coverLabel,
  importSupply,
  longHaulTrucks,
  weeks,
  type BoardSupply,
  type ImportLoad,
  type Truck,
} from "@/live/supply";
import type { SprintHealth } from "@/live/sprint";
import { useLive } from "@/live/store";
import { useTwin } from "@/store/twin";
import { useUserScope } from "@/components/shell/AppFrame";
import { Chip, Label, Panel, TextButton, healthColor } from "@/components/ui/primitives";

const importLabel: Record<SprintHealth, string> = {
  "on-track": "Imported parts on target",
  "at-risk": "Imported parts below target",
  behind: "Imported parts running low",
};

const boardLabel: Record<SprintHealth, string> = {
  "on-track": "Boards cover the line",
  "at-risk": "Boards run out before the next truck",
  behind: "Line waiting for boards",
};

/** Where cover sits against the band Lumax aims for. */
export function CoverBand({ value, band, max, health }: { value: number; band: [number, number]; max: number; health: SprintHealth }) {
  const at = (x: number) => `${(Math.min(max, Math.max(0, x)) / max) * 100}%`;
  return (
    <div className="relative h-2 w-full rounded-full bg-line" role="presentation">
      <span
        className="absolute inset-y-0 rounded-full"
        style={{ left: at(band[0]), right: `calc(100% - ${at(band[1])})`, background: "color-mix(in oklab, var(--run) 30%, transparent)" }}
      />
      <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-panel" style={{ left: at(value), background: healthColor[health] }} />
    </div>
  );
}

const truckNote = (t: Pick<Truck, "arriveAt" | "delay">) =>
  `arrives ${dayTime(t.arriveAt)}${t.delay ? `, ${t.delay.hours} h late: ${t.delay.reason.charAt(0).toLowerCase()}${t.delay.reason.slice(1)}` : ""}`;

function BoardRow({ b }: { b: BoardSupply }) {
  const plant = plantByCode[b.plant];
  return (
    <li className="flex flex-col gap-1 py-2.5">
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="min-w-0 truncate font-semibold">
          {plant.name} <span className="font-normal text-muted">· {orderById[b.userId].title}</span>
        </span>
        <span className="shrink-0 font-semibold tabular-nums" style={{ color: b.health === "on-track" ? undefined : healthColor[b.health] }}>
          {b.onHand > 0 ? coverLabel(b.coverHours) : "none left"}
        </span>
      </div>
      <p className="text-[12px] text-muted">
        {num(b.onHand)} on hand, {num(b.onRoad)} on the road ({b.road} from Bawal){b.atDock ? `, ${num(b.atDock)} at Bawal's dock` : ""}
      </p>
      {b.next ? (
        <p className="text-[12px]" style={{ color: b.next.delay ? "var(--idle)" : "var(--muted)" }}>
          Next truck {truckNote(b.next)}
        </p>
      ) : null}
    </li>
  );
}

const legNote = (leg: ImportLeg, lots: ImportLoad[]) => {
  const here = lots.filter((l) => l.leg === leg);
  if (!here.length) return "";
  return leg === "origin" ? ` · ${count(here.length, "lot")} booked` : leg === "sea" ? ` · ${count(here.length, "ship")}` : ` · ${count(here.length, "lot")} clearing`;
};

function Trip({ lots }: { lots: ImportLoad[] }) {
  return (
    <ol className="relative flex flex-col gap-2">
      <span className="absolute top-2 bottom-2 left-[5px] w-px border-l border-dashed border-faint" aria-hidden />
      {importLegs.map((leg) => (
        <li key={leg.id} className="relative flex items-start gap-3 text-[13px]">
          <span className={`relative mt-1 size-[11px] shrink-0 rounded-full border-2 bg-panel-strong ${lots.some((l) => l.leg === leg.id) ? "border-accent" : "border-line"}`} />
          <div className="min-w-0 flex-1">
            <p>{leg.name}</p>
            <p className="text-[12px] text-muted">
              {leg.days}
              {legNote(leg.id, lots)}
            </p>
          </div>
        </li>
      ))}
      <li className="relative flex items-start gap-3 text-[13px] font-semibold">
        <span className="relative mt-1 size-[11px] shrink-0 rounded-full border-2 border-ink bg-ink" />
        Bawal Electronics, about 3 to 4 weeks after sailing
      </li>
    </ol>
  );
}

function LotRow({ lot, weeklyUse, now, focused, onFocus }: { lot: ImportLoad; weeklyUse: number; now: number; focused: boolean; onFocus: () => void }) {
  const status =
    lot.leg === "origin"
      ? `Booked on the ${day(lot.sailAt)} sailing`
      : lot.leg === "sea"
        ? `Sailed ${day(lot.sailAt)}, day ${Math.max(1, Math.ceil((now - lot.sailAt) / 86_400_000))} of ${Math.round((lot.berthAt - lot.sailAt) / 86_400_000)} at sea`
        : `At JNPT since ${day(lot.berthAt)}, on rail to the inland depot`;
  return (
    <li>
      <button
        type="button"
        onClick={onFocus}
        aria-pressed={focused}
        className={`flex w-full flex-col gap-0.5 rounded-lg px-2 py-2 text-left hover:bg-panel-strong/60 focus-visible:outline-2 focus-visible:outline-ink ${focused ? "bg-panel-strong" : ""}`}
      >
        <span className="text-[13px] font-semibold">
          {lot.id}: {weeklyUse ? `${(lot.kits / weeklyUse).toFixed(1)} weeks of parts` : count(lot.kits, "board set")}
        </span>
        <span className="text-[12px] text-muted">{status}</span>
        <span className="text-[12px] text-muted">
          {lot.leg === "inland" ? "" : `JNPT ${day(lot.berthAt)}, `}Bawal {day(lot.arriveAt)}
        </span>
        {lot.rolledDays ? (
          <span className="text-[12px]" style={{ color: "var(--idle)" }}>
            Rolled to the next sailing: the booked ship was full, {lot.rolledDays} days later
          </span>
        ) : null}
      </button>
    </li>
  );
}

function TruckRow({ t, focused, onFocus }: { t: Truck; focused: boolean; onFocus: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onFocus}
        aria-pressed={focused}
        className={`flex w-full flex-col gap-0.5 rounded-lg px-2 py-2 text-left hover:bg-panel-strong/60 focus-visible:outline-2 focus-visible:outline-ink ${focused ? "bg-panel-strong" : ""}`}
      >
        <span className="text-[13px] font-semibold">
          {plantByCode[t.from].name} to {plantByCode[t.to].name}
        </span>
        <span className="text-[12px] text-muted">{t.byOrder.map((o) => count(o.units, orderById[o.orderId].unitName.toLowerCase())).join(", ")}</span>
        <span className="text-[12px]" style={{ color: t.delay ? "var(--idle)" : "var(--muted)" }}>
          Left {dayTime(t.departAt)}, {truckNote(t)}
        </span>
      </button>
    </li>
  );
}

/** Everything that feeds the lamp lines: imported parts into Bawal, and boards out of it. */
export function SupplyDetail({ onClose, className = "" }: { onClose?: () => void; className?: string }) {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);
  const selection = useTwin((s) => s.network);
  const selectNetwork = useTwin((s) => s.selectNetwork);
  if (!snap) return null;
  const imports = importSupply(snap);
  const boards = boardSupplies(snap, scope);
  const trucks = longHaulTrucks(snap, scope);
  const focus = selection?.kind === "supply" ? selection.focus : undefined;
  const pick = (id: string) => selectNetwork({ kind: "supply", focus: focus === id ? undefined : id });
  const worstBoard = boards.reduce<SprintHealth>((w, b) => (b.health === "behind" || (b.health === "at-risk" && w === "on-track") ? b.health : w), "on-track");
  const seesImports = scope.user.role === "executive" || scope.plants.has("BWE");

  return (
    <Panel className={`flex min-h-0 flex-col gap-4 scroller overflow-y-auto px-5 py-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-wrap gap-1.5">
            {boards.length ? <Chip color={healthColor[worstBoard]}>{boardLabel[worstBoard]}</Chip> : null}
            {imports && seesImports ? <Chip color={healthColor[imports.health]}>{importLabel[imports.health]}</Chip> : null}
          </div>
          <h2 className="font-stretch-semi-expanded text-[19px] font-semibold leading-tight">LED boards and imported parts</h2>
          <p className="text-[13px] text-muted">
            Bawal Electronics builds the LED boards for every lamp plant and trucks them out each day. The LED packages, driver ICs and connectors on
            them are mostly imported, through JNPT.
          </p>
        </div>
        {onClose ? <TextButton onClick={onClose}>Close</TextButton> : null}
      </div>

      {boards.length ? (
        <div className="border-t border-line pt-3">
          <Label>Boards at each lamp plant · how long they last at plan</Label>
          <ul className="divide-y divide-line">
            {boards.map((b) => (
              <BoardRow key={b.stockId} b={b} />
            ))}
          </ul>
        </div>
      ) : null}

      {trucks.length ? (
        <div className="border-t border-line pt-3">
          <Label>Long-haul trucks on the road ({trucks.length})</Label>
          <ul className="mt-1 -mx-2 flex flex-col">
            {trucks.map((t) => (
              <TruckRow key={t.key} t={t} focused={focus === t.key} onFocus={() => pick(t.key)} />
            ))}
          </ul>
        </div>
      ) : null}

      {imports && seesImports ? (
        <>
          <div className="border-t border-line pt-3">
            <div className="flex items-baseline justify-between gap-3">
              <Label>Imported parts at Bawal and at sea</Label>
              <span className="text-[13px] font-semibold tabular-nums" style={{ color: imports.health === "on-track" ? undefined : healthColor[imports.health] }}>
                {weeks(imports.coverWeeks)}
              </span>
            </div>
            <div className="mt-2">
              <CoverBand value={imports.coverWeeks} band={IMPORT_COVER_WEEKS} max={12} health={imports.health} />
            </div>
            <p className="mt-1.5 text-[12px] text-muted">
              {weeks(imports.onHandWeeks)} on hand, the rest at sea or clearing. Lumax says it holds about two months of inventory against disruption;
              the band shows {IMPORT_COVER_WEEKS[0]} to {IMPORT_COVER_WEEKS[1]} weeks.
            </p>
          </div>
          <div className="border-t border-line pt-4">
            <Label>The trip</Label>
            <div className="mt-2.5">
              <Trip lots={imports.lots} />
            </div>
          </div>
          {imports.lots.length ? (
            <div className="border-t border-line pt-3">
              <Label>Lots on their way ({imports.lots.length})</Label>
              <ul className="mt-1 -mx-2 flex flex-col">
                {imports.lots.map((l) => (
                  <LotRow key={l.id} lot={l} weeklyUse={imports.weeklyUse} now={snap.now} focused={focus === l.id} onFocus={() => pick(l.id)} />
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}
      <p className="text-[11px] text-faint">
        Lanes, sailing day and transit times are assumptions to confirm with Lumax; it does not publish its logistics partners.
      </p>
    </Panel>
  );
}

/** One line on a lamp schedule or plant: the boards on hand and the next truck in. */
export function BoardsNote({ stockId, onOpen }: { stockId: string; onOpen?: () => void }) {
  const snap = useLive((s) => s.snap);
  const b = snap ? boardSupply(snap, stockId) : null;
  if (!b) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={!onOpen}
      className="flex w-full flex-col gap-1 rounded-lg bg-panel-strong px-3 py-2.5 text-left enabled:hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ink"
    >
      <span className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="font-semibold">LED boards from Bawal</span>
        <span className="font-semibold tabular-nums" style={{ color: b.health === "on-track" ? undefined : healthColor[b.health] }}>
          {b.onHand > 0 ? `${coverLabel(b.coverHours)} on hand` : "none left"}
        </span>
      </span>
      <span className="text-[12px] text-muted">
        {num(b.onHand)} at the line, {num(b.onRoad)} on the road
        {b.next ? `; next truck ${truckNote(b.next)}` : ""}
        {onOpen ? " · see the trucks" : ""}
      </span>
    </button>
  );
}
