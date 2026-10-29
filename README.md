# Mirror for Lumax Industries

A live 3D view of Lumax Industries' lamp-making network with operational oversight on top: what each plant and machine is doing, which OEM schedule it is for, who owns it, and who to call when something stops. It covers the eleven plants in India, the LED boards Bawal Electronics trucks to every lamp plant, and the imported LED parts that come in through JNPT. It is built on simulated data.

It is the same product as [Project-mirror](https://github.com/ashwindon/Project-mirror), rebuilt around Lumax: the research behind every plant, process, customer and number is in [`reports/`](reports/) and [`research_notes/`](research_notes/).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 and pick a person on the sign-in page. There are no passwords; the person you pick decides what you can see.

- **Executives** see every plant and schedule.
- **Plant heads** see their plant in full, the schedules that pass through it, and only status for other plants.
- **Programme leads and engineers** see the schedules they lead and the machines they own.

Typed questions on the Briefing page need a Claude API key. Put `ANTHROPIC_API_KEY=...` in `.env.local` for local runs, or in the project's environment variables on Vercel. Everything else, including the ready-made briefings and workflows, works without it.

## What is in it

- **Network** (`/`): a globe centred on India, with the five clusters (NCR–Haryana, Uttarakhand, Pune, Sanand, Bengaluru), the long-haul roads from Bawal Electronics with the board trucks on them, the sea lane that brings LED packages, driver ICs and connectors to JNPT, and Lumax's design centres in Ostrava and Taiwan. Click a cluster for its map: plants, shuttle trucks between sister plants, the highway exits, nearby OEMs, and the Bengaluru greenfield under construction.
- **Plant floors** (`/plants/sn2` etc.): each floor is laid out the way lamp plants run, moulding at the back (IMM-XL presses, 2K rotary presses, BMC reflector presses), surface treatment in the middle (hard coat, vacuum metallizers, paint) and assembly and test at the front (assembly lines with hot-melt robots, hot-plate and vibration welders, leak testers, aim and photometry tunnels, function testers). Bawal Electronics has its SMT lines and the AOI, X-ray and ICT cells. Click a machine for what it is making, for which schedule, its stop and cause, and who to call.
- **Needs attention**: open stops with who has picked them up. Most are what Lumax's own TPM records say they should be: mould changes, minor stops, quality holds and waits for parts or operators. Breakdowns are rare.
- **This week** (switch at the top right): every plant and machine against the week's commitment, with burndowns and where the hours went.
- **Supply**: LED boards at each lamp plant in hours of cover, every long-haul truck from Bawal and any held on the road, and imported parts at Bawal and at sea in weeks of cover against the roughly two months Lumax says it holds.
- **Briefing** (`/brief`): ready-made briefings (morning brief, what's at risk, where hours are going, who to call, LED boards and imports) and workflows (an escalation sweep that drafts the note, and call prep for each OEM) answer instantly from the live data. Anything else goes in the ask bar and Claude works it out with read-only tools over the same data and access rules.
- **Sprint board** (`/sprint`): one lane per schedule, running through its route, with stops, owners, the week's burndown and six weeks of history.

## The week the demo tells

Every Monday at 06:00 IST the planner commits each schedule to a number of units for the week, in standard machine-hours. Plants release work as the OEM call-offs come in and level-load to the plan, filling spare time with other programmes. Three problems are written in, so the demo never shows only the happy path (`chronicTroubles` in `src/domain/faults.ts` and `roadDelay` in `src/domain/freight.ts`):

- **SA-61021 e Vitara ADB headlamps at Sanand II** keep failing the matrix function test, and their ADB driver boards keep getting held at Bawal's X-ray cell for solder voiding. When Tuesday's truck to Sanand is held at a border check post, the ADB lines run out of boards on Thursday.
- **SA-61066 Victoris headlamps** depend on the one Dharuhera metallizer approved for their BMC reflectors, and the reflectors keep outgassing in the chamber.

## How it is put together

| Folder | What it holds |
|---|---|
| `src/domain/catalog` | Reference data: plants, machines, people, OEMs, schedules, routes and parts stocks. An SAP feed replaces this later. |
| `src/domain/access.ts` | Role-based scope. Every view filters through it, so the rules can move behind an API unchanged. |
| `src/domain/planning.ts` | The weekly planner that turns due dates and capacity into commitments. |
| `src/domain/freight.ts` | Shuttle and long-haul trucks, and the weekly import sailings. |
| `src/live/sim` | A deterministic simulator in a Web Worker: machines pick up work, change moulds, stop, wait for boards, and trucks carry work between plants. Same week, same replay, so everyone watching sees the same thing. |
| `src/live/supply.ts`, `src/live/sprint.ts` | Board and import cover; sprint maths (pace, burndown, forecast, causes, response times, velocity). |
| `src/live/source.ts` | The `LiveSource` interface. Swap `simulatedSource()` for a feed from SAP S/4HANA, OEM EDI, LSETU and the Bawal MES to go live. |
| `src/brief` | The briefing layer: the answer format, role-scoped facts over the live state, and the ready-made briefings and workflows. |
| `src/server` | Server-side replay of the same simulated week, and the Claude agent behind `/api/ask`. |
| `src/components` | The 3D scenes (React Three Fiber) and the panels on top of them. |

## What is real and what is not

Plant names, addresses, start years, what each plant makes, the OEMs it serves, the announced programmes, the station types, the SMT plant feeding every lamp plant, the imports through JNPT, and the Bawal and Dharuhera headcounts are from Lumax's filings and public sources (see `reports/`). Plant codes, quantities, prices, dates, cycle times, machine fleets, stops, logistics lanes and every person are fictional. Hyundai and Kia work (SL Lumax) and Lumax Auto Technologies are not modelled.
