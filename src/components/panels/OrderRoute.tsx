"use client";

import { DOOR_TO_DOOR_DAYS, crossingStep } from "@/domain/freight";
import type { Order } from "@/domain/types";
import { day } from "@/lib/format";
import { seaLoads } from "@/live/freight";
import type { OpFlow } from "@/live/selectors";
import { useLive } from "@/live/store";

function describe(f: OpFlow, crossesSea: boolean) {
  const parts = [];
  if (f.active) parts.push(`${f.active} on machine`);
  if (f.queued) parts.push(`${f.queued} waiting`);
  // Units on a ship are counted on the sea leg instead.
  if (f.inTransit && !crossesSea) parts.push(`${f.inTransit} on the way`);
  return parts.join(", ");
}

/** The leg between the last step in Pune and the first in Conroe. */
function SeaLeg({ order, onTheWay }: { order: Order; onTheWay: number }) {
  const next = useLive((s) => {
    if (!s.snap) return undefined;
    const snap = s.snap;
    return seaLoads(snap)
      .filter((l) => l.arriveAt > snap.now && l.byOrder.some((o) => o.orderId === order.id))
      .sort((a, b) => a.arriveAt - b.arriveAt)[0]?.arriveAt;
  });
  return (
    <li className="relative flex items-start gap-3 text-[13px]">
      <span className={`relative mt-1 size-[11px] shrink-0 rounded-full border-2 border-dashed bg-panel-strong ${onTheWay ? "border-accent" : "border-line"}`} />
      <div className="min-w-0 flex-1">
        <p className={onTheWay ? "" : "text-faint"}>By sea, JNPT to Houston</p>
        <p className="text-[12px] text-muted">
          {DOOR_TO_DOOR_DAYS[0]} to {DOOR_TO_DOOR_DAYS[1]} days door to door
          {onTheWay ? ` · ${onTheWay} on the way${next ? `, next in Conroe ${day(next)}` : ""}` : ""}
        </p>
      </div>
      <span className="text-faint">Sea</span>
    </li>
  );
}

/** The order's route across plants, with where its units are right now. */
export function OrderRoute({ order, flow, released, highlight }: { order: Order; flow: OpFlow[]; released: number; highlight?: number }) {
  const crossing = crossingStep.get(order.id);
  return (
    <ol className="relative flex flex-col gap-2">
      <span className="absolute top-2 bottom-2 left-[5px] w-px bg-line" aria-hidden />
      {order.route.map((op, i) => {
        const f = flow[i];
        const seaLeg = i === crossing;
        const wip = f.active + f.queued + (seaLeg ? 0 : f.inTransit);
        const finished = f.done >= released && wip === 0 && !(seaLeg && f.inTransit);
        const here = highlight === i;
        return [
          seaLeg ? <SeaLeg key="sea" order={order} onTheWay={f.inTransit} /> : null,
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
              {wip > 0 ? <p className="text-[12px] text-muted">{describe(f, seaLeg)}</p> : null}
            </div>
            <span className="tabular-nums text-faint">{op.plant}</span>
          </li>,
        ];
      })}
    </ol>
  );
}
