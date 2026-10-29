"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { canSeePlant } from "@/domain/access";
import { orderById } from "@/domain/catalog/orders";
import { plants } from "@/domain/catalog/plants";
import { regions } from "@/domain/catalog/regions";
import type { Alert, Plant, RegionId } from "@/domain/types";
import { DOOR_TO_DOOR_DAYS } from "@/domain/freight";
import { count, day } from "@/lib/format";
import { seaLoads, usBuffers } from "@/live/freight";
import { useLive } from "@/live/store";
import { openAlerts, orderProgress, plantHealth, visibleOrders } from "@/live/selectors";
import { paceHealth, sprintTotals, visibleLines } from "@/live/sprint";
import { Ring } from "@/components/charts/Ring";
import { SprintCauses, SprintSummary } from "@/components/panels/Sprint";
import { useTwin, type NetworkView as View } from "@/store/twin";
import { useUserScope } from "@/components/shell/AppFrame";
import { HudSheet, useWideScreen } from "@/components/shell/HudSheet";
import { AlertList } from "@/components/panels/AlertList";
import { OrderDetail, OrdersList } from "@/components/panels/Orders";
import { PlantSummary } from "@/components/panels/PlantSummary";
import { createLabelBoard, ScreenLabel } from "@/components/three/ScreenLabels";
import { Panel, Stat, healthColor, statusColor } from "@/components/ui/primitives";
import { FreightDetail, weeks } from "@/components/panels/Freight";
import { palette } from "@/components/three/palette";
import { GLOBE_R, alongLane, latLon, loadPosition } from "./globe";
import { kmToWorld, plantPosition, portPosition, regionMaps } from "./geo";

const NetworkScene = dynamic(() => import("./NetworkScene"), {
  ssr: false,
  loading: () => <p className="absolute inset-0 grid place-items-center text-[13px] text-muted">Loading the network…</p>,
});

const GlobeScene = dynamic(() => import("./GlobeScene"), {
  ssr: false,
  loading: () => <p className="absolute inset-0 grid place-items-center text-[13px] text-muted">Loading the globe…</p>,
});

const labels = createLabelBoard();

function PlantLabel({ plant }: { plant: Plant }) {
  const scope = useUserScope();
  const select = useTwin((s) => s.selectNetwork);
  const health = useLive(
    useShallow((s) => {
      if (!s.snap) return null;
      const h = plantHealth(s.snap, plant.code);
      return { worst: h.worst, alerts: h.alerts };
    }),
  );
  const lens = useTwin((s) => s.lens);
  const week = useLive(
    useShallow((s) => {
      if (!s.snap) return null;
      const t = sprintTotals(s.snap, s.snap.sprint.lines.filter((l) => l.plant === plant.code));
      return { share: t.committedHours ? t.doneHours / t.committedHours : 1, health: paceHealth(t.doneHours, t.committedHours, t.elapsed) };
    }),
  );
  const tone = health && health.worst !== "running" && health.worst !== "waiting" ? statusColor[health.worst] : "var(--muted)";
  return (
    <ScreenLabel board={labels} id={plant.code} at={plantPosition(plant.code, 3.4)}>
      <button
        type="button"
        onClick={() => select({ kind: "plant", code: plant.code })}
        aria-label={`${plant.code} ${plant.name}`}
        className={`pointer-events-auto flex items-center gap-1.5 rounded-full border border-line bg-panel-strong px-2 py-0.5 text-[12px] font-semibold whitespace-nowrap shadow-sm focus-visible:outline-2 focus-visible:outline-ink ${canSeePlant(scope, plant.code) ? "" : "opacity-60"}`}
      >
        {plant.code}
        {lens === "sprint" && week ? (
          <span className="flex items-center gap-1 font-medium text-muted">
            <Ring value={week.share} color={healthColor[week.health]} size={14} stroke={2.5} label={`${Math.round(week.share * 100)}% of this week's commitment done`} />
            {Math.round(week.share * 100)}%
          </span>
        ) : health && health.alerts > 0 ? (
          <span className="flex items-center gap-1 font-medium" style={{ color: tone }}>
            <span className="size-1.5 rounded-full" style={{ background: tone }} />
            {health.alerts}
          </span>
        ) : null}
      </button>
    </ScreenLabel>
  );
}

function MapLabels({ region }: { region: RegionId }) {
  const { towns, board, port } = regionMaps[region];
  const selectNetwork = useTwin((s) => s.selectNetwork);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {towns.map((t) => (
        <ScreenLabel key={t.name} board={labels} id={`town:${t.name}`} at={kmToWorld(region, t.at, 0.1)}>
          <span className="text-[11px] whitespace-nowrap text-faint italic">{t.name}</span>
        </ScreenLabel>
      ))}
      <ScreenLabel board={labels} id="port" at={portPosition(region, 0.1)}>
        <button
          type="button"
          onClick={() => selectNetwork({ kind: "freight" })}
          className="pointer-events-auto flex flex-col rounded-lg border border-line bg-panel-strong px-2 py-1 text-left shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-ink"
        >
          <span className="text-[12px] font-semibold whitespace-nowrap">{port.name}</span>
          <span className="text-[11px] whitespace-nowrap text-muted">{port.note}</span>
        </button>
      </ScreenLabel>
      <ScreenLabel board={labels} id="north" at={kmToWorld(region, [0, 0], 0.1).set(board.w / 2 - 5, 0.1, -board.d / 2 + 4)}>
        <span className="flex flex-col items-center text-[11px] text-muted">
          <svg viewBox="0 0 8 12" className="h-3 w-2" aria-hidden>
            <path d="M4 12V1M1 4l3-3 3 3" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          North
        </span>
      </ScreenLabel>
      {plants
        .filter((p) => p.region === region)
        .map((p) => (
          <PlantLabel key={p.code} plant={p} />
        ))}
    </div>
  );
}

/** Each region as a pin on the globe, and what is at sea between them. */
function GlobeLabels() {
  const scope = useUserScope();
  const flyToRegion = useTwin((s) => s.flyToRegion);
  const selection = useTwin((s) => s.network);
  const selectNetwork = useTwin((s) => s.selectNetwork);
  const snap = useLive((s) => s.snap);
  const loads = snap ? seaLoads(snap) : [];
  const onTheWay = loads.reduce((n, l) => n + l.units, 0);
  const next = loads.filter((l) => l.arriveAt > (snap?.now ?? 0)).sort((a, b) => a.arriveAt - b.arriveAt)[0];
  const lowest = snap ? usBuffers(snap, scope).sort((a, b) => a.coverWeeks - b.coverWeeks)[0] : undefined;
  const focus = selection?.kind === "freight" ? loads.find((l) => l.sailAt === selection.sailAt) : undefined;
  const laneAt = alongLane(0.5);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {regions.map((r) => {
        const codes = plants.filter((p) => p.region === r.id).map((p) => p.code);
        const stops = snap ? openAlerts(snap, scope).filter((a) => codes.includes(a.plant)).length : 0;
        return (
          <ScreenLabel key={r.id} board={labels} id={`region:${r.id}`} at={latLon(r.lat, r.lon, 0.4)} facing={latLon(r.lat, r.lon).normalize()} inward>
            <button
              type="button"
              onClick={() => flyToRegion(r.id)}
              className="pointer-events-auto flex flex-col items-start rounded-xl border border-line bg-panel-strong px-3 py-1.5 text-left shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-ink"
            >
              <span className="text-[13px] font-semibold whitespace-nowrap">
                <span className="max-sm:hidden">
                  {r.country} · {r.name}
                </span>
                <span className="sm:hidden">{r.country === "United States" ? "USA" : r.country}</span>
              </span>
              <span className="text-[12px] whitespace-nowrap text-muted">
                {count(codes.length, "plant")}
                {stops ? <span style={{ color: "var(--stop)" }}> · {count(stops, "stop")} open</span> : null}
              </span>
              {r.id === "texas" && lowest ? (
                <span className="text-[12px] whitespace-nowrap" style={{ color: lowest.health === "on-track" ? "var(--muted)" : healthColor[lowest.health] }}>
                  Stock for {weeks(lowest.coverWeeks)}
                </span>
              ) : null}
            </button>
          </ScreenLabel>
        );
      })}
      {/* A picked ship gets its own label instead. */}
      {loads.length && !focus ? (
        <ScreenLabel board={labels} id="lane" at={laneAt.clone().setLength(laneAt.length() + 0.8)} facing={laneAt.clone().normalize()}>
          <button
            type="button"
            onClick={() => selectNetwork({ kind: "freight" })}
            className="pointer-events-auto flex flex-col items-start rounded-xl border border-line bg-panel-strong px-3 py-1.5 text-left shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-ink"
          >
            <span className="text-[13px] font-semibold whitespace-nowrap">
              <span className="max-sm:hidden">
                Sea freight · {DOOR_TO_DOOR_DAYS[0]} to {DOOR_TO_DOOR_DAYS[1]} days door to door
              </span>
              <span className="sm:hidden">
                {DOOR_TO_DOOR_DAYS[0]} to {DOOR_TO_DOOR_DAYS[1]} days by sea
              </span>
            </span>
            <span className="text-[12px] whitespace-nowrap text-muted max-sm:hidden">
              {count(loads.length, "ship")} · {onTheWay} units on the way{next ? ` · next in Conroe ${day(next.arriveAt)}` : ""}
            </span>
          </button>
        </ScreenLabel>
      ) : null}
      {focus ? (
        <ScreenLabel board={labels} id="ship" at={loadPosition(focus).setLength(GLOBE_R + 0.5)} facing={loadPosition(focus).normalize()} inward>
          <span className="flex flex-col rounded-lg border border-line bg-panel-strong px-2 py-1 text-[12px] whitespace-nowrap shadow-sm">
            <span className="font-semibold">
              {focus.byOrder.map((o) => count(o.units, orderById[o.orderId].unitName.toLowerCase())).join(", ")}
            </span>
            <span className="text-muted">
              {focus.leg === "port" ? `Sails ${day(focus.sailAt)}` : focus.leg === "sea" ? `Houston ${day(focus.berthAt)}` : "In Houston"} · Conroe{" "}
              {day(focus.arriveAt)}
            </span>
          </span>
        </ScreenLabel>
      ) : null}
    </div>
  );
}

/** Globe, or one region's map. */
function ViewSwitch({ view, onChange }: { view: View; onChange: (view: View) => void }) {
  const options: { id: View; label: string; short: string }[] = [
    { id: "globe", label: "Globe", short: "Globe" },
    ...regions.map((r) => ({ id: r.id, label: `${r.country === "United States" ? "USA" : r.country} · ${r.name}`, short: r.country === "United States" ? "USA" : r.country })),
  ];
  return (
    <div className="pointer-events-auto absolute top-[84px] left-1/2 z-20 flex -translate-x-1/2 gap-0.5 rounded-full border border-line bg-panel-strong p-0.5 shadow-sm max-sm:top-[92px]">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={view === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-full px-3 py-1 text-[12px] font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-ink ${view === o.id ? "bg-ink text-page" : "text-muted hover:text-ink"}`}
        >
          <span className="max-sm:hidden">{o.label}</span>
          <span className="sm:hidden">{o.short}</span>
        </button>
      ))}
    </div>
  );
}

function NetworkKpis() {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);
  if (!snap) return null;
  const orders = visibleOrders(scope);
  const progress = orders.map((o) => orderProgress(snap, o));
  const finished = progress.reduce((n, p) => n + p.finishedToday, 0);
  const risky = progress.filter((p) => p.health !== "on-track").length;
  let running = 0;
  let total = 0;
  for (const code of scope.plants) {
    const h = plantHealth(snap, code);
    running += h.counts.running;
    total += h.total;
  }
  const alerts = openAlerts(snap, scope);
  const unanswered = alerts.filter((a) => !a.acknowledgedAt).length;

  return (
    <Panel className="grid grid-cols-2 divide-line [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(-n+2)]:border-line [&>*:nth-child(odd)]:border-r [&>*:nth-child(odd)]:border-line">
      <Stat label="Units finished today" value={finished} sub={`across ${count(orders.length, "order")}`} />
      <Stat label="Machines running" value={`${running}/${total}`} sub={`in ${count(scope.plants.size, "plant")}`} />
      <Stat label="Open alerts" value={alerts.length} sub={unanswered ? `${unanswered} waiting for a response` : "All being handled"} />
      <Stat label="Orders at risk" value={risky} sub={risky ? "Stops eating into float" : "All on track"} />
    </Panel>
  );
}

function NetworkWeek() {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);
  if (!snap) return null;
  const title =
    scope.user.role === "executive" ? "All plants this week" : scope.user.role === "plant-manager" ? "Your plant this week" : "Your orders this week";
  return (
    <>
      <SprintSummary lines={visibleLines(snap, scope)} title={title} />
      <SprintCauses />
    </>
  );
}

/** The network in one line, for the bar along the bottom of a phone screen. */
function NetworkLine() {
  const scope = useUserScope();
  const snap = useLive((s) => s.snap);
  if (!snap) return <span className="text-muted">Connecting to the plants…</span>;
  const progress = visibleOrders(scope).map((o) => orderProgress(snap, o));
  const risky = progress.filter((p) => p.health !== "on-track").length;
  const alerts = openAlerts(snap, scope).length;
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 font-semibold">{count(progress.length, "order")}</span>
      <span className="truncate text-muted">
        {risky ? <span style={{ color: "var(--idle)" }}>{risky} at risk</span> : "all on track"}
        {alerts ? <span style={{ color: "var(--stop)" }}> · {count(alerts, "stop")} open</span> : null}
      </span>
    </span>
  );
}

export function NetworkView() {
  const scope = useUserScope();
  const router = useRouter();
  const view = useTwin((s) => s.networkView);
  const setView = useTwin((s) => s.setNetworkView);
  const flyToRegion = useTwin((s) => s.flyToRegion);
  // A veil the colour of the 3D background covers the swap between the globe and a map.
  const [veil, setVeil] = useState({ on: false, delay: 0 });
  useEffect(() => {
    const lift = setTimeout(() => setVeil({ on: false, delay: 0 }), 380);
    return () => clearTimeout(lift);
  }, [view]);
  const changeView = (next: View) => {
    if (next === view) return;
    if (view === "globe" && next !== "globe") return flyToRegion(next);
    setVeil({ on: true, delay: 0 });
    setTimeout(() => setView(next), 240);
  };
  const lens = useTwin((s) => s.lens);
  const selection = useTwin((s) => s.network);
  const selectNetwork = useTwin((s) => s.selectNetwork);
  const focusMachine = useTwin((s) => s.focusMachine);
  const wide = useWideScreen();
  const selectionKey = selection ? (selection.kind === "plant" ? selection.code : selection.kind === "order" ? selection.id : "freight") : null;
  // On a phone the panels live in a sheet: closed until asked for, open when a plant or order is tapped.
  const [sheetOpen, setSheetOpen] = useState(false);
  const [closedFor, setClosedFor] = useState<string | null>(null);
  const open = selectionKey ? closedFor !== selectionKey : sheetOpen;
  const toggleSheet = () => {
    if (selectionKey) setClosedFor(open ? selectionKey : null);
    else setSheetOpen(!open);
  };

  const showAlert = (alert: Alert) => {
    if (canSeePlant(scope, alert.plant)) {
      focusMachine(alert.machineId);
      router.push(`/plants/${alert.plant.toLowerCase()}`);
    } else {
      selectNetwork({ kind: "plant", code: alert.plant });
    }
  };

  const overview =
    lens === "sprint" ? (
      <NetworkWeek />
    ) : (
      <>
        <NetworkKpis />
        <AlertList onShow={showAlert} />
      </>
    );
  const showFreight = () => selectNetwork({ kind: "freight" });
  const detail =
    selection?.kind === "plant" ? (
      <PlantSummary code={selection.code} onClose={() => selectNetwork(null)} onShowFreight={showFreight} />
    ) : selection?.kind === "order" ? (
      <OrderDetail orderId={selection.id} onBack={() => selectNetwork(null)} onShowAlert={showAlert} onShowFreight={showFreight} />
    ) : selection?.kind === "freight" ? (
      <FreightDetail onClose={() => selectNetwork(null)} />
    ) : (
      <OrdersList onSelect={(id) => selectNetwork({ kind: "order", id })} />
    );

  return (
    <>
      <div className="absolute inset-0">
        {view === "globe" ? (
          <GlobeScene labels={labels} onApproach={() => setVeil({ on: true, delay: 1050 })} onEnter={(region) => setView(region)} />
        ) : (
          <NetworkScene key={view} labels={labels} region={view} />
        )}
      </div>
      {view === "globe" ? <GlobeLabels /> : <MapLabels region={view} />}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{ background: palette.background, opacity: veil.on ? 1 : 0, transition: `opacity ${veil.on ? 420 : 520}ms ease ${veil.delay}ms` }}
      />
      <ViewSwitch view={view} onChange={changeView} />
      {wide ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex justify-between gap-4 px-4 pt-[84px] pb-4">
          <div className="hud-column w-[360px]">{overview}</div>
          <div className="ml-auto flex min-h-0 w-[380px] flex-col">{detail}</div>
        </div>
      ) : (
        <HudSheet summary={<NetworkLine />} open={open} onToggle={toggleSheet}>
          {selection ? (
            detail
          ) : (
            <>
              {overview}
              {detail}
            </>
          )}
        </HudSheet>
      )}
      <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-[12px] text-muted max-lg:hidden">
        {view === "globe"
          ? "Click India or the US to zoom in, or the sea lane to see what is on the way. Drag to turn the globe."
          : "Click a plant or an order. Drag to orbit, scroll to zoom."}
      </p>
    </>
  );
}
