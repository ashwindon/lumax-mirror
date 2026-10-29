"use client";

import { machineById } from "@/domain/catalog/machines";
import { personById } from "@/domain/catalog/people";
import type { Alert, PlantCode } from "@/domain/types";
import { duration } from "@/lib/format";
import { useLive } from "@/live/store";
import { openAlerts } from "@/live/selectors";
import { useUserScope } from "@/components/shell/AppFrame";
import { Dot, Panel, SectionTitle, TextButton, alertColor } from "@/components/ui/primitives";

const firstName = (personId: string) => personById[personId]?.name.split(" ")[0] ?? "Owner";

export function AlertRow({ alert, now, onShow }: { alert: Alert; now: number; onShow?: (alert: Alert) => void }) {
  const machine = machineById[alert.machineId];
  const owner = firstName(alert.ownerId);
  return (
    <li className="flex items-start gap-3 border-t border-line py-2.5 first:border-t-0">
      <Dot color={alertColor(alert.kind)} pulse={alert.kind === "breakdown"} className="mt-1.5 size-2" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold">{alert.title}</p>
        <p className="truncate text-[12px] text-muted">
          {machine.name}, {alert.plant}, {duration(now - alert.raisedAt)}
        </p>
        <p className="text-[12px]" style={{ color: alert.acknowledgedAt ? "var(--muted)" : "var(--idle)" }}>
          {alert.acknowledgedAt ? `${owner} is on it` : `Waiting for ${owner} to respond`}
        </p>
      </div>
      {onShow ? <TextButton onClick={() => onShow(alert)}>Show</TextButton> : null}
    </li>
  );
}

export function AlertList({ plant, onShow, className = "" }: { plant?: PlantCode; onShow: (alert: Alert) => void; className?: string }) {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);
  const list = snap ? openAlerts(snap, scope, plant) : [];
  return (
    <Panel className={`flex min-h-0 flex-col px-4 py-3 ${className}`}>
      <SectionTitle>Needs attention {snap ? `(${list.length})` : ""}</SectionTitle>
      {list.length === 0 ? (
        <p className="mt-2 text-[13px] text-muted">
          {snap ? "Nothing needs attention right now. Stops and quality holds will show up here." : "Connecting to the plants…"}
        </p>
      ) : (
        <ul className="mt-1 min-h-0 scroller overflow-y-auto">
          {list.map((a) => (
            <AlertRow key={a.id} alert={a} now={snap!.now} onShow={onShow} />
          ))}
        </ul>
      )}
    </Panel>
  );
}
