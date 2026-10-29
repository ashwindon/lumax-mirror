"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { canSeeOrder, canSeePlant } from "@/domain/access";
import { machineById } from "@/domain/catalog/machines";
import { customerById, orders } from "@/domain/catalog/orders";
import { plantByCode } from "@/domain/catalog/plants";
import type { Alert, PlantCode } from "@/domain/types";
import { useLive } from "@/live/store";
import { orderProgress, plantHealth } from "@/live/selectors";
import { machineTarget, paceHealth, sprintTotals, visibleLines } from "@/live/sprint";
import { Ring } from "@/components/charts/Ring";
import { SprintCauses, SprintSummary } from "@/components/panels/Sprint";
import { createLabelBoard, ScreenLabel } from "@/components/three/ScreenLabels";
import { machinesByPlant } from "@/domain/catalog/machines";
import { plantLayout } from "./layout";
import * as THREE from "three";
import { useTwin } from "@/store/twin";
import { useUserScope } from "@/components/shell/AppFrame";
import { HudSheet, useWideScreen } from "@/components/shell/HudSheet";
import { AlertList } from "@/components/panels/AlertList";
import { MachineDetail } from "@/components/panels/MachineDetail";
import { StatusBar } from "@/components/panels/PlantSummary";
import { Avatar, Dot, Label, Meter, Panel, PersonRow, SectionTitle, healthColor } from "@/components/ui/primitives";
import { personById } from "@/domain/catalog/people";
import { num, percent } from "@/lib/format";

const PlantScene = dynamic(() => import("./three/PlantScene"), {
  ssr: false,
  loading: () => <p className="absolute inset-0 grid place-items-center text-[13px] text-muted">Loading the plant…</p>,
});

const labels = createLabelBoard();

/** This week's progress ring floating over every machine that has a share of the plant's commitment. */
function MachineRings({ code }: { code: PlantCode }) {
  const snap = useLive((s) => s.snap);
  const select = useTwin((s) => s.selectMachine);
  if (!snap) return null;
  const layout = plantLayout(code);
  const elapsed = Math.min(1, (snap.now - snap.sprint.weekStart) / (snap.sprint.weekEnd - snap.sprint.weekStart));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {(machinesByPlant[code] ?? []).map((m) => {
        const pos = layout.positions[m.id];
        const { target, done } = machineTarget(snap, m);
        if (!pos || target <= 0) return null;
        const health = paceHealth(done, target, elapsed);
        const share = done / target;
        return (
          <ScreenLabel key={m.id} board={labels} id={m.id} at={new THREE.Vector3(pos[0], 4.6, pos[2])}>
            <button
              type="button"
              onClick={() => select(m.id)}
              className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-line bg-panel-strong py-0.5 pr-2 pl-1 text-[11px] font-semibold whitespace-nowrap shadow-sm focus-visible:outline-2 focus-visible:outline-ink"
            >
              <Ring value={share} color={healthColor[health]} size={16} stroke={2.5} label={`${m.name}: ${Math.round(share * 100)}% of its share done`} />
              {Math.round(share * 100)}%
            </button>
          </ScreenLabel>
        );
      })}
    </div>
  );
}

/** Commitment lines at this plant and how far each has got this week. */
function PlantWeek({ code, onOpenOrder }: { code: PlantCode; onOpenOrder: (id: string) => void }) {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);
  if (!snap) return null;
  const lines = visibleLines(snap, scope, { plant: code });
  const elapsed = sprintTotals(snap, lines).elapsed;
  return (
    <Panel className="flex min-h-0 flex-col gap-3 scroller overflow-y-auto px-5 py-4">
      <SectionTitle>Committed at this plant this week</SectionTitle>
      <p className="text-[13px] text-muted">The rings over the machines show each one&apos;s share of this plan.</p>
      <ul className="flex flex-col">
        {lines.map((l) => {
          const order = orders.find((o) => o.id === l.orderId)!;
          const done = snap.sprint.done[l.id];
          const health = paceHealth(Math.min(done, l.units), l.units, elapsed);
          return (
            <li key={l.id} className="border-t border-line first:border-t-0">
              <button
                type="button"
                onClick={() => onOpenOrder(order.id)}
                className="flex w-full flex-col gap-1.5 rounded-lg py-2.5 text-left hover:bg-panel-strong/60 focus-visible:outline-2 focus-visible:outline-ink"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-[13px] font-semibold">
                    {order.route[l.opIndex].name}, {order.id}
                  </p>
                  <span className="shrink-0 text-[12px] tabular-nums text-muted">
                    {num(done)}/{num(l.units)} {order.unitName.toLowerCase()}s
                  </span>
                </div>
                <Meter value={Math.min(done, l.units)} max={l.units} tone={healthColor[health]} />
              </button>
            </li>
          );
        })}
      </ul>
      {lines.length === 0 ? <Label>Nothing you can see is committed at this plant this week.</Label> : null}
    </Panel>
  );
}

/** The plant in one line, for the bar along the bottom of a phone screen. */
function PlantLine({ code }: { code: PlantCode }) {
  const snap = useLive((s) => s.snap);
  const health = snap ? plantHealth(snap, code) : null;
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 font-semibold">
        {code} {plantByCode[code].name}
      </span>
      {health ? (
        <span className="truncate text-muted">
          {health.counts.running} of {health.total} running
          {health.alerts ? <span style={{ color: "var(--stop)" }}> · {health.alerts} stop{health.alerts > 1 ? "s" : ""}</span> : null}
        </span>
      ) : null}
    </span>
  );
}

function PlantHeader({ code }: { code: PlantCode }) {
  const plant = plantByCode[code];
  const snap = useLive((s) => s.snap);
  const health = snap ? plantHealth(snap, code) : null;
  return (
    <Panel className="flex flex-col gap-3 px-5 py-4">
      <div>
        <p className="text-[12px] text-muted">
          {plant.code}, {plant.address}
        </p>
        <h1 className="font-stretch-semi-expanded text-[19px] font-semibold leading-tight">{plant.name}</h1>
      </div>
      {health && snap ? (
        <>
          <StatusBar counts={health.counts} total={health.total} />
          <p className="text-[12px] text-muted">
            {num(snap.opsToday[code] ?? 0)} operations finished today, machines running {percent(health.utilization)} of the time
          </p>
        </>
      ) : null}
      <PersonRow personId={plant.managerId} />
    </Panel>
  );
}

/** What this plant is working on, grouped by order, when no machine is selected. */
function PlantWork({ code, onOpenOrder }: { code: PlantCode; onOpenOrder: (id: string) => void }) {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);
  if (!snap) return null;
  const here = orders.filter((o) => o.route.some((op) => op.plant === code) && canSeeOrder(scope, o.id));

  return (
    <Panel className="flex min-h-0 flex-col gap-3 scroller overflow-y-auto px-5 py-4">
      <SectionTitle>Schedules on this floor</SectionTitle>
      <p className="text-[13px] text-muted">Click a machine to see what it is making, for which programme, and who to call.</p>
      <ul className="flex flex-col">
        {here.map((order) => {
          const p = orderProgress(snap, order);
          const ops = order.route
            .map((op, i) => ({ op, f: p.flow[i] }))
            .filter(({ op, f }) => op.plant === code && f.active + f.queued > 0);
          return (
            <li key={order.id} className="border-t border-line first:border-t-0">
              <button
                type="button"
                onClick={() => onOpenOrder(order.id)}
                className="flex w-full items-start gap-3 rounded-lg py-2.5 text-left hover:bg-panel-strong/60 focus-visible:outline-2 focus-visible:outline-ink"
              >
                <Dot color={healthColor[p.health]} className="mt-1.5 size-2" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">
                    {order.id} {order.title}
                  </p>
                  <p className="truncate text-[12px] text-muted">{customerById[order.customerId].name}</p>
                  {ops.length ? (
                    ops.map(({ op, f }) => (
                      <p key={op.name} className="text-[12px] text-muted">
                        {op.name}: {[f.active && `${num(f.active)} on machine`, f.queued && `${num(f.queued)} waiting`].filter(Boolean).join(", ")}
                      </p>
                    ))
                  ) : (
                    <p className="text-[12px] text-faint">Nothing on this floor right now</p>
                  )}
                </div>
                <Avatar initials={personById[order.leadEngineerId].initials} className="size-7 text-[11px]" />
              </button>
            </li>
          );
        })}
      </ul>
      {here.length === 0 ? <Label>No schedules you can see run through this plant.</Label> : null}
    </Panel>
  );
}

export function PlantView({ code }: { code: PlantCode }) {
  const scope = useUserScope();
  const router = useRouter();
  const machineId = useTwin((s) => s.machineId);
  const selectMachine = useTwin((s) => s.selectMachine);
  const focusMachine = useTwin((s) => s.focusMachine);
  const selectNetwork = useTwin((s) => s.selectNetwork);
  const lens = useTwin((s) => s.lens);
  const snap = useLive((s) => s.snap);
  const selectedHere = machineId && machineById[machineId]?.plant === code ? machineId : null;
  const wide = useWideScreen();
  // On a phone the panels live in a sheet: closed until asked for, open when a machine is tapped.
  const [sheetOpen, setSheetOpen] = useState(false);
  const [closedFor, setClosedFor] = useState<string | null>(null);
  const open = selectedHere ? closedFor !== selectedHere : sheetOpen;
  const toggleSheet = () => {
    if (selectedHere) setClosedFor(open ? selectedHere : null);
    else setSheetOpen(!open);
  };

  useEffect(() => {
    if (machineId && machineById[machineId]?.plant !== code) selectMachine(null);
  }, [code, machineId, selectMachine]);

  if (!canSeePlant(scope, code)) {
    return (
      <div className="grid h-full place-items-center p-6">
        <Panel className="max-w-md px-6 py-5">
          <h1 className="text-[17px] font-semibold">{plantByCode[code].name} is outside your access</h1>
          <p className="mt-2 text-[13px] text-muted">
            Its status shows on the network map. Ask {personById[plantByCode[code].managerId].name}, the plant head, if you need to see its machines.
          </p>
          <Link href="/" className="mt-4 inline-block rounded-lg bg-ink px-3 py-1.5 text-[13px] font-semibold text-page">
            Back to the network
          </Link>
        </Panel>
      </div>
    );
  }

  const openOrder = (orderId: string) => {
    selectNetwork({ kind: "order", id: orderId });
    router.push("/");
  };
  const showAlert = (alert: Alert) => focusMachine(alert.machineId);

  const overview =
    lens === "sprint" && snap ? (
      <>
        <SprintSummary lines={visibleLines(snap, scope, { plant: code })} title="This plant this week" />
        <SprintCauses only={{ plant: code }} />
      </>
    ) : (
      <AlertList plant={code} onShow={showAlert} />
    );
  const detail = selectedHere ? (
    <MachineDetail machineId={selectedHere} onOpenOrder={openOrder} />
  ) : lens === "sprint" ? (
    <PlantWeek code={code} onOpenOrder={openOrder} />
  ) : (
    <PlantWork code={code} onOpenOrder={openOrder} />
  );

  return (
    <>
      <div className="absolute inset-0">
        <PlantScene code={code} labels={labels} />
      </div>
      {lens === "sprint" ? <MachineRings code={code} /> : null}
      {wide ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex justify-between gap-4 px-4 pt-[84px] pb-4">
          <div className="hud-column w-[360px]">
            <PlantHeader code={code} />
            {overview}
          </div>
          <div className="ml-auto flex min-h-0 w-[380px] flex-col">{detail}</div>
        </div>
      ) : (
        <HudSheet summary={<PlantLine code={code} />} open={open} onToggle={toggleSheet}>
          {selectedHere ? (
            detail
          ) : (
            <>
              <PlantHeader code={code} />
              {overview}
              {detail}
            </>
          )}
        </HudSheet>
      )}
      <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-[12px] text-muted max-lg:hidden">
        Drag to orbit, right-drag to pan, scroll to zoom
      </p>
    </>
  );
}
