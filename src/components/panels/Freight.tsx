"use client";

import { orderById } from "@/domain/catalog/orders";
import { BUFFER_TARGET_WEEKS, DOOR_TO_DOOR_DAYS, freightLegs, type FreightLeg } from "@/domain/freight";
import { count, day } from "@/lib/format";
import { tenant } from "@/lib/tenant";
import { orderBuffer, puneOutlook, seaLoads, unitsByLeg, usBuffers, type BufferHealth, type OrderBuffer, type SeaLoad } from "@/live/freight";
import { useLive } from "@/live/store";
import { useTwin } from "@/store/twin";
import { useUserScope } from "@/components/shell/AppFrame";
import { Chip, Label, Panel, TextButton, healthColor } from "@/components/ui/primitives";

const DAY = 86_400_000;
export const weeks = (w: number) => `${w.toFixed(1)} weeks`;

const bufferLabel: Record<BufferHealth, string> = {
  "on-track": "US stock on target",
  "at-risk": "US stock below 2 months",
  behind: "US stock running low",
};

const units = (n: number, orderId: string) => count(n, orderById[orderId].unitName.toLowerCase());

const loadContents = (load: SeaLoad) => load.byOrder.map((o) => units(o.units, o.orderId)).join(", ");

/** Where cover sits against the 2-to-3-month band Ultra keeps. */
export function CoverBand({ weeks: w, health }: { weeks: number; health: BufferHealth }) {
  const max = 16;
  const at = (x: number) => `${(Math.min(max, Math.max(0, x)) / max) * 100}%`;
  return (
    <div className="relative h-2 w-full rounded-full bg-line" role="presentation">
      <span
        className="absolute inset-y-0 rounded-full"
        style={{ left: at(BUFFER_TARGET_WEEKS[0]), right: `calc(100% - ${at(BUFFER_TARGET_WEEKS[1])})`, background: "color-mix(in oklab, var(--run) 30%, transparent)" }}
      />
      <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-panel" style={{ left: at(w), background: healthColor[health] }} />
    </div>
  );
}

function BufferRow({ buffer }: { buffer: OrderBuffer }) {
  const order = orderById[buffer.orderId];
  return (
    <li className="flex flex-col gap-1.5 py-2.5">
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="font-semibold">{order.title}</span>
        <span className="font-semibold tabular-nums" style={{ color: buffer.health === "on-track" ? undefined : healthColor[buffer.health] }}>
          {weeks(buffer.coverWeeks)}
        </span>
      </div>
      <CoverBand weeks={buffer.coverWeeks} health={buffer.health} />
      <p className="text-[12px] text-muted">
        {buffer.onTheWay} on the way, {buffer.onSite} in Conroe; Conroe uses {buffer.weeklyUse} a week
      </p>
    </li>
  );
}

const legNote = (leg: FreightLeg, n: number, ships: number) =>
  leg === "sea" ? `${n} on ${count(ships, "ship")}` : leg === "port" ? `${n} waiting to load` : leg === "road" ? `${n} on trucks` : `${n} clearing`;

function Trip({ byLeg, ships }: { byLeg: Record<FreightLeg, number>; ships: number }) {
  return (
    <ol className="relative flex flex-col gap-2">
      <span className="absolute top-2 bottom-2 left-[5px] w-px border-l border-dashed border-faint" aria-hidden />
      {freightLegs.map((leg) => (
        <li key={leg.id} className="relative flex items-start gap-3 text-[13px]">
          <span className={`relative mt-1 size-[11px] shrink-0 rounded-full border-2 bg-panel-strong ${byLeg[leg.id] ? "border-accent" : "border-line"}`} />
          <div className="min-w-0 flex-1">
            <p>{leg.name}</p>
            <p className="text-[12px] text-muted">
              {leg.days}
              {byLeg[leg.id] ? ` · ${legNote(leg.id, byLeg[leg.id], ships)}` : ""}
            </p>
          </div>
        </li>
      ))}
      <li className="relative flex items-start gap-3 text-[13px] font-semibold">
        <span className="relative mt-1 size-[11px] shrink-0 rounded-full border-2 border-ink bg-ink" />
        Conroe, {DOOR_TO_DOOR_DAYS[0]} to {DOOR_TO_DOOR_DAYS[1]} days after leaving Pune
      </li>
    </ol>
  );
}

function PuneWeek({ orderId }: { orderId: string }) {
  const snap = useLive((s) => s.snap);
  const o = snap ? puneOutlook(snap, orderId) : null;
  if (!o) return null;
  const order = orderById[orderId];
  const low = o.coverAfter < BUFFER_TARGET_WEEKS[0];
  return (
    <li className="py-2 text-[13px]">
      <p>
        <span className="font-semibold">{order.title}:</span> Pune is on course to ship {o.forecast} of {o.committed} this week, landing in Conroe around{" "}
        {day(o.landsAt)}.
      </p>
      {o.short ? (
        <p className="mt-1 text-[12px]" style={{ color: low ? "var(--stop)" : "var(--idle)" }}>
          {units(o.short, orderId)} would miss the sailing and reach Conroe a week late, around {day(o.lateAt)}. Cover would dip to {weeks(o.coverAfter)}
          {low ? ", below the 2-month floor." : ", still inside the buffer."}
        </p>
      ) : (
        <p className="mt-1 text-[12px] text-muted">Nothing short so far, so the buffer stays where it is.</p>
      )}
    </li>
  );
}

function ShipRow({ load, now, focused, onFocus }: { load: SeaLoad; now: number; focused: boolean; onFocus: () => void }) {
  const status =
    load.leg === "port"
      ? `Loading at JNPT for the ${day(load.sailAt)} sailing${load.onRoad ? `, ${load.onRoad} still on the road` : ""}`
      : load.leg === "sea"
        ? `Sailed ${day(load.sailAt)}, day ${Math.max(1, Math.ceil((now - load.sailAt) / DAY))} of ${Math.round((load.berthAt - load.sailAt) / DAY)} at sea`
        : `In Houston since ${day(load.berthAt)}, clearing customs`;
  return (
    <li>
      <button
        type="button"
        onClick={onFocus}
        aria-pressed={focused}
        className={`flex w-full flex-col gap-0.5 rounded-lg px-2 py-2 text-left hover:bg-panel-strong/60 focus-visible:outline-2 focus-visible:outline-ink ${focused ? "bg-panel-strong" : ""}`}
      >
        <span className="text-[13px] font-semibold">{loadContents(load)}</span>
        <span className="text-[12px] text-muted">{status}</span>
        <span className="text-[12px] text-muted">
          {load.leg === "import" ? "" : `Houston ${day(load.berthAt)}, `}Conroe {day(load.arriveAt)}
        </span>
      </button>
    </li>
  );
}

/** Everything between Pune and Conroe: the stock it adds up to, the trip, and each ship. */
export function FreightDetail({ onClose, className = "" }: { onClose?: () => void; className?: string }) {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);
  const selection = useTwin((s) => s.network);
  const selectNetwork = useTwin((s) => s.selectNetwork);
  if (!snap) return null;
  const buffers = usBuffers(snap, scope);
  const loads = seaLoads(snap, scope);
  const byLeg = unitsByLeg(snap, scope);
  const focus = selection?.kind === "freight" ? selection.sailAt : undefined;
  const worst = buffers.reduce<BufferHealth>((w, b) => (b.health === "behind" || (b.health === "at-risk" && w === "on-track") ? b.health : w), "on-track");

  return (
    <Panel className={`flex min-h-0 flex-col gap-4 scroller overflow-y-auto px-5 py-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col items-start gap-2">
          {buffers.length ? <Chip color={healthColor[worst]}>{bufferLabel[worst]}</Chip> : null}
          <h2 className="font-stretch-semi-expanded text-[19px] font-semibold leading-tight">Sea freight, Pune to Conroe</h2>
          <p className="text-[13px] text-muted">
            One sailing a week from JNPT to the Port of Houston. {DOOR_TO_DOOR_DAYS[0]} to {DOOR_TO_DOOR_DAYS[1]} days door to door, so {tenant.shortName} keeps 2
            to 3 months of Conroe&apos;s needs at sea and on site.
          </p>
        </div>
        {onClose ? <TextButton onClick={onClose}>Close</TextButton> : null}
      </div>

      {buffers.length ? (
        <div className="border-t border-line pt-3">
          <Label>
            US stock in weeks of use · target {BUFFER_TARGET_WEEKS[0]} to {BUFFER_TARGET_WEEKS[1]}
          </Label>
          <ul className="divide-y divide-line">
            {buffers.map((b) => (
              <BufferRow key={b.orderId} buffer={b} />
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-[13px] text-muted">None of your orders cross to Conroe.</p>
      )}

      <div className="border-t border-line pt-4">
        <Label>The trip</Label>
        <div className="mt-2.5">
          <Trip byLeg={byLeg} ships={loads.filter((l) => l.leg === "sea").length} />
        </div>
      </div>

      {buffers.length ? (
        <div className="border-t border-line pt-3">
          <Label>What Pune ships this week</Label>
          <ul className="divide-y divide-line">
            {buffers.map((b) => (
              <PuneWeek key={b.orderId} orderId={b.orderId} />
            ))}
          </ul>
        </div>
      ) : null}

      {loads.length ? (
        <div className="border-t border-line pt-3">
          <Label>Ships on the way ({loads.length})</Label>
          <ul className="mt-1 -mx-2 flex flex-col">
            {[...loads].reverse().map((l) => (
              <ShipRow
                key={l.sailAt}
                load={l}
                now={snap.now}
                focused={focus === l.sailAt}
                onFocus={() => selectNetwork({ kind: "freight", sailAt: focus === l.sailAt ? undefined : l.sailAt })}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </Panel>
  );
}

/** One line on an order or a plant: the US stock and the next ship in. */
export function BufferNote({ orderId, onOpen }: { orderId: string; onOpen?: () => void }) {
  const snap = useLive((s) => s.snap);
  const b = snap ? orderBuffer(snap, orderId) : null;
  if (!b) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={!onOpen}
      className="flex w-full flex-col gap-1.5 rounded-lg bg-panel-strong px-3 py-2.5 text-left enabled:hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ink"
    >
      <span className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="font-semibold">US stock: {weeks(b.coverWeeks)} of use</span>
        <span className="text-[12px] text-muted">
          target {BUFFER_TARGET_WEEKS[0]} to {BUFFER_TARGET_WEEKS[1]}
        </span>
      </span>
      <CoverBand weeks={b.coverWeeks} health={b.health} />
      <span className="text-[12px] text-muted">
        {b.onTheWay} on the way from Pune, {b.onSite} in Conroe{onOpen ? " · see the ships" : ""}
      </span>
    </button>
  );
}
