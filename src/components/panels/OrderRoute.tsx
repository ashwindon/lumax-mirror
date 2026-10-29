"use client";

import { stockById } from "@/domain/catalog/orders";
import { plantByCode } from "@/domain/catalog/plants";
import { roadTime } from "@/domain/freight";
import type { Order } from "@/domain/types";
import { num } from "@/lib/format";
import type { OpFlow } from "@/live/selectors";
import { useLive } from "@/live/store";

function describe(f: OpFlow) {
  const parts = [];
  if (f.active) parts.push(`${num(f.active)} on machine`);
  if (f.queued) parts.push(`${num(f.queued)} waiting`);
  return parts.join(", ");
}

/** A truck leg between two plants on the route, with what is on it or at the dock. */
function TruckLeg({ order, i, f }: { order: Order; i: number; f: OpFlow }) {
  const [from, to] = [order.route[i - 1].plant, order.route[i].plant];
  const moving = f.inTransit + f.docked;
  return (
    <li className="relative flex items-start gap-3 text-[13px]">
      <span className={`relative mt-1 size-[11px] shrink-0 rounded-full border-2 border-dashed bg-panel-strong ${moving ? "border-accent" : "border-line"}`} />
      <div className="min-w-0 flex-1">
        <p className={moving ? "" : "text-faint"}>
          Truck, {plantByCode[from].name} to {plantByCode[to].name}
        </p>
        <p className="text-[12px] text-muted">
          {roadTime(from, to)}, shuttle every 2 h
          {f.inTransit ? ` · ${num(f.inTransit)} on the way` : ""}
          {f.docked ? ` · ${num(f.docked)} at the dock` : ""}
        </p>
      </div>
      <span className="text-faint">Road</span>
    </li>
  );
}

/** The schedule's route across plants, with where its units are right now. */
export function OrderRoute({ order, flow, released, highlight }: { order: Order; flow: OpFlow[]; released: number; highlight?: number }) {
  const stock = order.consumes ? stockById[order.consumes.stockId] : undefined;
  const onHand = useLive((s) => (stock ? (s.snap?.stocks[stock.id] ?? 0) : 0));
  return (
    <ol className="relative flex flex-col gap-2">
      <span className="absolute top-2 bottom-2 left-[5px] w-px bg-line" aria-hidden />
      {order.route.map((op, i) => {
        const f = flow[i];
        const wip = f.active + f.queued;
        const finished = f.done >= released && wip === 0 && !f.inTransit && !f.docked;
        const here = highlight === i;
        const fits = stock && order.consumes?.opIndex === i;
        return [
          i > 0 && order.route[i - 1].plant !== op.plant ? <TruckLeg key={`road${i}`} order={order} i={i} f={f} /> : null,
          <li key={op.name + i} className="relative flex items-start gap-3 text-[13px]">
            <span
              className={`relative mt-1 size-[11px] shrink-0 rounded-full border-2 ${
                finished ? "border-faint bg-faint" : wip > 0 ? "border-accent bg-panel-strong" : "border-line bg-panel-strong"
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className={here ? "font-semibold" : finished ? "text-muted" : wip > 0 ? "" : "text-faint"}>
                {op.name}
                {here ? <span className="ml-1.5 text-[12px] font-normal text-muted">this machine</span> : null}
              </p>
              {wip > 0 ? <p className="text-[12px] text-muted">{describe(f)}</p> : null}
              {fits ? (
                <p className="text-[12px]" style={{ color: onHand > 0 ? "var(--muted)" : "var(--stop)" }}>
                  {stock.imported ? "Draws imported LED parts" : "Fits LED boards from Bawal"}: {onHand > 0 ? `${num(onHand)} on hand` : "none left"}
                </p>
              ) : null}
            </div>
            <span className="tabular-nums text-faint">{op.plant}</span>
          </li>,
        ];
      })}
    </ol>
  );
}
