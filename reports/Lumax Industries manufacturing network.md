# Lumax Lights India From Eleven Plants

Lumax Industries Limited (LIL), the company behind lumaxworld.in/lumaxindustries, is India's leading automotive lamp maker. ICRA ranks it first in passenger-vehicle lighting and third in two-wheeler lighting. It designs and builds headlamps, rear combination lamps, fog, signal and interior lamps, and the LED electronics inside them. Revenue was ₹4,184 crore in FY26 and ₹2,565 crore in H1 FY27. It manufactures in three process blocks: injection moulding (including 2K/3K and BMC reflectors), surface treatment (vacuum metallising, painting, annealing) and assembly (hot-plate, vibration and ultrasonic welding, hot-melt sealing, robotic bead laying). A dedicated SMT electronics plant at Bawal feeds these blocks by shipping LED boards to the other plants, and production moulds are imported. LIL owns 11 plants, all in India: three in Haryana, two in Uttarakhand, three in Maharashtra, two in Gujarat and one in Karnataka. Its headline "12 plants" also counts the Hyundai-focused associate SL Lumax at Sriperumbudur. A second Bengaluru plant is due in January–March 2027, and the only overseas sites are design centres in Ostrava (Czech Republic) and Taiwan. Five OEMs dominate: Maruti Suzuki (26% of H1 FY27 manufacturing sales), Mahindra (16%), Honda two-wheelers (13%), Tata (11%) and Hero (7%). The sister company Lumax Auto Technologies (LATL) is itself a 7% customer, which is one reason the two companies must be kept apart in any model. Growth is fast (+33% in H1 FY27), but the EBITDA margin fell to 8.2% in Q2 FY27 as imported LED content, input costs and working capital rose.

Three facts decide what a digital-twin demo can claim:
- **Calibration data exists for two plants.** Bawal and Dharuhera publish TPM loss data: OEE of 86.2% and 85.5%, scrap of 2.8% and 1.65%, and 52 and 420 breakdowns a year. That can anchor every simulated floor.
- **Only one shop-floor system is documented.** It is the MES at the Bawal SMT plant. No public source names a partner streaming real-time IoT or machine data from any Lumax plant; the nearest is machine-level energy IoT at the sister company LATL.
- **The enterprise sources are documented.** SAP S/4HANA (RISE), OEM EDI and the LSETU supplier portal are all named in filings.

Real customer and programme names are defensible wherever Lumax announced the launch. Volumes, part numbers, most plant-to-programme assignments, stops and people must be fictional. Every inference below is tagged *(inference)*.

## Lumax Industries sells lamps and lamp electronics, not plastics

**Products and revenue mix.** LIL reports one business segment, "Automotive Lighting and Electronics". It covers headlamps, tail lamps, fog lamps, turn indicators, DRLs, LED modules, HVAC control panels and electronic sub-assemblies for passenger-vehicle (PV), two-wheeler (2W), commercial-vehicle (CV) and EV makers ([FY26 Integrated Annual Report](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). Plant profiles are more specific. Dharuhera makes "Head Lamps, Tail Lamps, Side Turn Lamps, Day Running Lamps, High Mount Stop Lamps & Reflex Reflectors" ([JIPM Dharuhera profile](https://jipmglobal.com/tpm/wp-content/uploads/25037-Company-profile.pdf)). Bawal makes "Head Lamps, Tail Lamps, Fog Lamps with latest process Triple LED function technology", mainly for Maruti Suzuki and Honda Cars India ([JIPM Bawal profile](https://jipmglobal.com/tpm/wp-content/uploads/25031CO-COMPANY-PROFILE.pdf)). Value sits at the front of the vehicle and in LEDs ([Q2 FY27 investor presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)):
- **By product (FY26):** front lighting **69%** of revenue, rear lighting 22%, other lamps 9%.
- **By vehicle (FY26):** PVs **65%**, two-wheelers 29%, CVs 6%.
- **By technology:** LED products **61%** of FY26 revenue, 63% in H1 FY27, up from 25% in FY18.

The ₹2,580 crore order book at October 2026 is about **88% LED and 11% EV** ([Q2 FY27 investor release](https://nsearchives.nseindia.com/corporate/LUMAXIND_26102026180749_LILPressrelease_26102026.pdf)). Content per vehicle explains the shift. A 4W LED headlamp is worth ₹8,000–12,000, an LED tail lamp about ₹3,000, and a complete 2W lighting kit at most ₹1,500 ([Q4 FY25 call](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_Q4FY25Transcript.pdf)). Each LED headlamp cluster carries "four to six times the rupee content" of a halogen one ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). LIL claims India's first Adaptive Driving Beam (ADB) headlamp, on Maruti's e Vitara ([Q4 FY25 call](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_Q4FY25Transcript.pdf)). It calls HVAC control panels, made at Bawal, its "second growth engine" ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)).

**Business model.** LIL is almost purely an OEM supplier. The chairman said in June 2026 that "almost 100% business is OEM related" ([Q4 FY26 call](https://financialreports.eu/filings/lumax-industries-ltd/call-transcript/2026/47979205/)). Exports were **0.62% of FY26 turnover** ([FY26 AR, BRSR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). The group aftermarket business sits in LATL, not LIL ([Q2 FY27 investor presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)). Tooling is billed separately: "Moulds Revenue" was ₹104.9 crore of H1 FY27 revenue, against ₹2,460.2 crore of manufacturing revenue, and LIL's customer pie charts exclude it ([Q2 FY27 investor presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)).

**How it manufactures.** Management sums it up in one sentence: "lighting is essentially a 3-part process, there is injection moulding, there is a paint shop and there is final assembly." Paint-shop utilisation is about 80%. A new lamp size needs new moulding machines, and "the assembly lines will always be new for any new models" ([Q4 FY25 call](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_Q4FY25Transcript.pdf)). A fourth block, electronics, sits in a dedicated SMT plant at Bawal, whose PCBs "are sent to other plants for integration with the remaining parts" ([Mobility Outlook, Apr 2022](https://www.mobilityoutlook.com/features/inr-100-crore-investment-lumax-groups-bet-on-manufacturing-electronic-components/)). Production moulds come from outside the company: "all our tooling are imported right now", and "we actually do source a lot from China" ([Q1 FY27 call, Aug 2026](https://www.lumaxworld.in/lumaxindustries/pdf/lumax-industries-q1fy27-earnings-call-transcript.pdf)). Plants sit next to OEM clusters and ran at **70–80% capacity utilisation** in FY26 ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). *(Inference)* The natural unit of a factory twin is therefore a programme-dedicated assembly line drawing on shared moulding and surface-treatment capacity. Imported moulds are long-lead assets, and LED boards are the main inter-plant flow.

Three companies carry the Lumax name, and the demo has to keep them apart:

| Entity | Relationship to LIL | Business | Plants | Treatment in the demo *(inference)* |
|---|---|---|---|---|
| **Lumax Industries Ltd (LIL)**, NSE LUMAXIND, BSE 517206 | The subject | Automotive lighting and lighting electronics | 11 owned, all in India | Fully modelled |
| **SL Lumax Ltd** | Associate, 21.28%; JV with SL Corporation (Korea) since 1997 | Lamps, chassis, trim, mirrors, shift levers, parking brakes; "mainly caters to Hyundai India"; FY26 revenue ₹2,933 crore | Sriperumbudur (counted in LIL's "12") | Grey associate pin; no floor, no orders |
| **Lumax Auto Technologies Ltd (LATL)**, NSE LUMAXTECH | Separately listed sister company. Holds 5.62% of LIL, is a 7% LIL customer, and traded ₹638 crore with LIL in FY26 | Plastics and interiors, structures and control systems, mechatronics, CNG, aftermarket | 29 plants | External customer node only; no LATL plants or products |

Sources: [Q2 FY27 investor presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf); [FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf).

Some figures and projects look like LIL's but are not, and should never be shown as LIL's:
- **Group-wide figures**, such as "41 manufacturing facilities" in eight states, 15,000+ employees and about ₹12,000 crore of "Lumax brand revenue". These combine LIL, LATL and associates ([Q2 FY27 investor presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)).
- **LATL's new ₹156 crore Chakan plant**, which is for its interiors business ([Investywise](https://www.investywise.com/?p=103731)).
- **The Lumax IAC rollout of Dassault 3DEXPERIENCE**, which is an LATL project ([ThePrint/ANI](https://theprint.in/ani-press-releases/solize-partners-india-takes-lumax-iac-live-on-dassault-systemes-3dexperience-platform/3050880/)).

## Eleven owned plants, all in India, sit inside five OEM clusters

LIL's FY26 governance report states that "there was total 11 locations where the manufacturing plants of the Company were located as on March 31, 2026". The BRSR counts **11 national plants and zero international plants**, plus five national and two international offices ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). The website's "12 world-class manufacturing facilities" ([home page](https://www.lumaxworld.in/lumaxindustries/)) and the deck's "12 manufacturing plants, 6 states" both include SL Lumax's Sriperumbudur plant, as the slide's own footnote says ([Q2 FY27 investor presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)). The plants form five clusters, with a second Bengaluru plant under construction:
- **NCR-Haryana:** three plants.
- **Uttarakhand:** two plants.
- **Pune:** three plants.
- **Sanand:** two plants.
- **Bengaluru:** one plant.

| # | Plant (LIL label) | Address as filed | Approx. lat, lon (grade) | Since | What it makes | Customers served |
|---|---|---|---|---|---|---|
| 1 | Bawal (lighting) | Plot 195–195A, Sector 4, Phase II, Growth Centre Bawal, Rewari 123501, Haryana | 28.09, 76.60 (C) | 2011–12 | 4W headlamps, tail lamps, fog lamps incl. triple-LED function. 1.2M vehicle lamp sets/yr, 80% utilised | Maruti Suzuki, Honda Cars India |
| 2 | Bawal Electronics Facility (SMT) | Plot 12, Sector 5, Phase II, Industrial Estate G.C. Bawal, Rewari | 28.09, 76.60 (C) | Commercial production 12 Jan 2022 | LED PCB/SMT assembly, HVAC control panels; MES installed | Internal: all LIL lamp plants |
| 3 | Dharuhera | Plot 6, Industrial Area, Dharuhera, Rewari, Haryana | 28.205, 76.795 (C) | April 1998 | Headlamps, tail lamps, side turn lamps, DRLs, HMSL, reflex reflectors. 1.4M 4W + 4.2M 2W sets/yr capacity. Absorbed the Gurugram plant in 2023 | Suzuki Motor Gujarat (SMG) and Honda Motorcycle & Scooter India (HMSI): both gave awards in 2024. Maruti tail lamps (2012). John Deere spares export |
| 4 | Pantnagar | Plot 51, Sector 11, IIE, Pantnagar, Udham Singh Nagar, Uttarakhand | 28.99, 79.43 (C, estimate) | 2008 | Lighting; ISO 50001 | Set up for Tata Motors; current customers not published |
| 5 | Haridwar | Plot 5, Industrial Park-II, Village Salempur Mehdood, Haridwar | 29.93, 78.05 (C, estimate) | 2010 | 2W lighting *(inference from customer)*; five GreenPro-certified products | Hero MotoCorp (2012 source) |
| 6 | Chakan II (Mahalunge Ingle) | 608–609 Chakan–Talegaon Road, Mahalunge Ingle, Chakan, Pune 410501 | 18.755, 73.809 (C) | 2005; expanded 2008 | IATF scope "Design & Manufacture of Lighting Equipment"; ISO 50001 | Pune cluster; not published plant by plant |
| 7 | Chakan III (Sawardari) | Plot A-79, Block C, Horizon Industrial Park, Village Sawardari, Chakan, Pune 410501 | 18.761, 73.782 (B) | Phase 1 on 1 Nov 2023; Phase 2 in Q4 FY26 | LED headlamps and advanced LED assemblies. Phase 2 adds 8.5 lakh lamps/yr. RE100 | M&M, Tata PV, Skoda-VW, Maruti; Phase 2 primarily Skoda-VW |
| 8 | Chinchwad | D2-43/2, MIDC Industrial Area, Chinchwad, Pune 411019 | 18.632, 73.803 (C) | Not stated | IATF scope "Design & Manufacture of Lighting Equipment" | Not published |
| 9 | Sanand (D-1) | Plot D-1, Vendors Park, Sanand, Ahmedabad, Gujarat | 23.025, 72.279 (C) | Built 2011; production from FY18 | Swift headlamps and rear lamps; 3 lakh light sets/yr (FY18) | Maruti (Gujarat); Tata Tigor and HMSI planned (FY18) |
| 10 | Sanand II (E-1) | Plot E-1, Tata Nano Vendor Park, North Kotpura, Sanand 382110 | 23.025, 72.279 (C) | D-2 merged in Feb 2025; "operationalized Q1 FY 2025-26" | Advanced lighting for new OEM orders | "Maruti Suzuki's Sanand operations and other Gujarat-based OEMs" |
| 11 | Bengaluru (Bidadi) | Plot 69–70A, Phase II, Sector 2, Bidadi Industrial Area, Ramanagara 562109, Karnataka | 12.781, 77.416 (B) | 2011–12 | 4W and 2W lamps, incl. single-source Honda Activa/Shine headlamps; RE100 since Dec 2025 | Toyota Kirloskar, HMSI |
| u/c | Bengaluru greenfield | Bidadi Industrial Area, plot undisclosed | ~12.78, 77.42 *(inference)* | Commissioning Q4 FY27 | ₹140 crore outlay; ~₹450 crore revenue expected in FY28 | New Maruti Suzuki and Toyota Kirloskar orders |
| assoc. | SL Lumax (not LIL-owned) | Sriperumbudur, near Chennai | Town-level only | — | Lamps, chassis, trim, mirrors | Hyundai India |

Sources:
- **Addresses:** [FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf), [ISO 14001 certificate](https://www.lumaxworld.in/lumaxindustries/pdf/EMS-certificate-ISO-14001-2015.pdf), [IATF Chakan](https://www.lumaxworld.in/lumaxindustries/pdf/IATF-LIL-chakan.pdf), [IATF Chinchwad](https://www.lumaxworld.in/lumaxindustries/pdf/IATF-LIL-chinchwad.pdf), [FY25 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Integrated-Annual-Report-FY-2024-25.pdf).
- **Start dates:** [milestones](https://www.lumaxworld.in/lumaxindustries/milestones.html), [FY22 AR](https://www.lumaxworld.in/lumaxindustries/pdf/Annual_Report_for_Year_ended_March312022.pdf), [FY24 AR](https://www.lumaxworld.in/lumaxindustries/pdf/Annual-Report-for-Year-ended-March-31-2024-LUMAX-INDUSTRIES-LIMITED.pdf), [FY18 AR](https://www.lumaxworld.in/lumaxindustries/pdf/annual-report-2017-2018.pdf).
- **Products and customers:**
  - Plant profiles: [JIPM Bawal](https://jipmglobal.com/tpm/wp-content/uploads/25031CO-COMPANY-PROFILE.pdf), [JIPM Dharuhera](https://jipmglobal.com/tpm/wp-content/uploads/25037-Company-profile.pdf).
  - Press: [Autocar Pro 2012](https://www.autocarpro.in/feature/lumax-shines-bright-cars-bikes-3475), [MarkLines profile](https://www.marklines.com/en/top500/lumax-industries).
  - Rating agency: [ICRA](https://www.icra.in/Rating/GetRationalReportFilePdf?id=142650).
  - Earnings calls: [Q4 FY25 call](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_Q4FY25Transcript.pdf), [Q1 FY27 call](https://www.lumaxworld.in/lumaxindustries/pdf/lumax-industries-q1fy27-earnings-call-transcript.pdf).
  - Export shipments: [Panjiva](https://panjiva.com/Lumaxindustries-Ltd/40466600).
- **Coordinates:** the research team geocoded the named estate or locality with [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/search?q=Dharuhera&format=json). Grade A means the exact address matched. Grade B means the named estate matched, so the plot is probably within about 1–2 km. Grade C means only the town or a landmark matched (about 2–5 km), or the figure is an estimate. B and C are map placeholders *(inference)*.

**Network changes, 2023–2027.** The network has changed more since 2023 than in the decade before.
- **Gurugram plant closed.** The plant at Plot 16, Sector 18, Maruti Complex (set up in 1985) was "not operating at its full efficiency". Its production moved to Dharuhera, and manufacturing stopped from **31 May 2023** ([FY23 AR](https://www.lumaxworld.in/lumaxindustries/pdf/annual-report-for-year-ended-march-31-2023.pdf)).
- **Manesar electronics gone.** The facility at Plot 91-B, Sector 5, IMT Manesar was listed in March 2021 and missing by March 2022, when the Bawal SMT plant appeared ([FY21 AR](https://www.lumaxworld.in/lumaxindustries/pdf/annual-report-for-year-ended-march-312021.pdf); [FY22 AR](https://www.lumaxworld.in/lumaxindustries/pdf/Annual_Report_for_Year_ended_March312022.pdf)). *(Inference)* The SMT operation moved to Bawal, though no filing says "shifted".
- **Chakan III opened.** Commercial production began on **1 November 2023** ([FY24 AR](https://www.lumaxworld.in/lumaxindustries/pdf/Annual-Report-for-Year-ended-March-31-2024-LUMAX-INDUSTRIES-LIMITED.pdf)). Phase 2 (₹152.6 crore, +8.5 lakh lamps a year) started in Q4 FY26 to "primarily cater to the requirements of Skoda and Volkswagen" ([Q3 FY26 call](https://www.lumaxworld.in/lumaxindustries/pdf/LILTranscript20022026.pdf); [Q4 FY26 call](https://www.lumaxworld.in/lumaxindustries/pdf/LILtranscript-2025-26.pdf)).
- **Sanand consolidated.** Sanand Plant 2 (D-2, opened March 2022) merged into the new E-1 plant in February 2025 ([FY25 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Integrated-Annual-Report-FY-2024-25.pdf)).
- **Bengaluru greenfield approved.** On 7 November 2025 the board approved a **₹140 crore greenfield plant at Bidadi**, to be commissioned by Q4 FY27 for new Maruti Suzuki and Toyota Kirloskar orders ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). Management expects "almost INR450 crores in FY 28" from it ([Q3 FY26 call](https://www.lumaxworld.in/lumaxindustries/pdf/LILTranscript20022026.pdf)). It says about a third of the order book will be served from the Bangalore region ([Q2 FY26 call](https://financialreports.eu/filings/lumax-industries-ltd/call-transcript/2025/46257444/)).
- **More capacity coming.** Brownfield expansions are under way at Sanand and Bawal, and land has been banked in Haryana ([Q1 FY27 call](https://www.lumaxworld.in/lumaxindustries/pdf/lumax-industries-q1fy27-earnings-call-transcript.pdf); [Q2 FY26 call](https://financialreports.eu/filings/lumax-industries-ltd/call-transcript/2025/46257444/)).

**Plant naming.** Two naming conventions matter for labels. *(Inference)* Chakan II is the older Mahalunge Ingle plant and Chakan III is the Sawardari greenfield. The maps moved from "Chakan/Chakan II" (FY24) to "Chakan II/Chakan III" (FY25–26) with the same two addresses, and the Skoda-VW business "started from our Chakan 3 facility" ([Q1 FY27 call](https://www.lumaxworld.in/lumaxindustries/pdf/lumax-industries-q1fy27-earnings-call-transcript.pdf)). Likewise, "Sanand" now means D-1 and "Sanand II" means E-1.

**Published capacity** is sparse:
- **Bawal:** 1.2 million vehicle lamp sets a year, run at 80% utilisation ([JIPM Bawal](https://jipmglobal.com/tpm/wp-content/uploads/25031CO-COMPANY-PROFILE.pdf)). A 2013 article quoted "10 million lamps per annum" ([Autocar Pro 2013](https://www.autocarpro.in/feature/2013-automotive-lighting-special-lumax-industries-supply-bentley-3297)). *(Inference)* The two figures reconcile if a vehicle set holds about eight lamps.
- **Dharuhera:** 1.4 million 4W and 4.2 million 2W sets a year ([JIPM Dharuhera](https://jipmglobal.com/tpm/wp-content/uploads/25037-Company-profile.pdf)).
- **Sanand D-1:** 3 lakh light sets a year (FY18).
- **Chakan Phase 2:** 8.5 lakh lamps a year.
- **Chakan Phase 1:** 25.38 lakh lamps a year, but only from an unopened press snippet ([Business Standard snippet](https://business-standard.com/amp/markets/capital-market-news/lumax-inds-to-set-up-new-manufacturing-plant-at-sanand-expand-capacity-of-chakan-based-unit-124031300297_1.html)).

Chakan Phase 1 utilisation rose from 50–60% in Q4 FY24 to 70–80% in Q4 FY25 ([Q4 FY24 call](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_Q4FY24EarningsCallTranscript.pdf); [Q4 FY25 call](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_Q4FY25Transcript.pdf)). Management targets ₹900–1,000 crore of peak revenue from Chakan by FY28 ([Q4 FY24 call](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_Q4FY24EarningsCallTranscript.pdf)).

**R&D, design and office sites.** LIL has "two R&D centres in Gurugram and Pune and two overseas design centres in Taiwan and the Czech Republic" ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)), with 500+ R&D staff ([FY24 AR](https://www.lumaxworld.in/lumaxindustries/pdf/Annual-Report-for-Year-ended-March-31-2024-LUMAX-INDUSTRIES-LIMITED.pdf)).
- **India R&D.** FY26 R&D facility spending of ₹16.09 crore was booked to "Chakan and Gurugram", which places the Pune centre at Chakan ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). *(Inference)* It most likely sits on the Chakan II campus, whose certification scope includes design. The Gurugram centre most likely sits at or near the corporate office at Plot 878, Udyog Vihar Phase V.
- **Czech Republic (LETC).** The Lumax European Technical Centre is run by the wholly owned subsidiary Lumax Industries Czech s.r.o., registered at Na Rovince 879, Hrabová, Ostrava and incorporated on 14 March 2022 ([ARES register](https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/14339579)). That address geocodes exactly to 49.7697, 18.2694 ([OSM](https://nominatim.openstreetmap.org/search?q=Na+Rovince+879,+Ostrava&format=json)). It opened with 15 staff working on optics, electronics hardware and software, and CAE, and Skoda Auto attended the opening ([Autocar Pro, Sep 2022](https://autocarpro.in/news-national/lumax-opens-new-technology-and-design-centre-in-the-czech-republic-102931)).
- **Taiwan.** The centre was inaugurated in May 2016 as an interface with tooling markets in China and Korea ([Autocar Pro, May 2016](https://autocarpro.in/news-international/lumax-design-centre-taiwan-looks-enter-china-japan-south-korea-20021)). No city is published, and the FY27 deck dates it to 2010 instead ([Q2 FY27 investor presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)).
- **Japan.** LIL engineers are deputed to Stanley Electric's design centre in Japan, but LIL owns no Japanese site ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)).
- **Offices.** The registered office is in Nangal Raya, New Delhi; the corporate office is in Gurugram ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)).
- **Not disclosed:** any warehouse, OEM-side hub or NABL-accredited lab. Indian homologation photometry is offered by labs such as ICAT ([ICAT](https://www.icat.in/index.php/testlabs/11)); that LIL uses such labs is an inference.

**Towns shared with LATL.** *(Inference)* Arithmetic on the FY23 group plant table ([Q4 FY23 investor presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LILQ4FY23Presentation.pdf)) implies two groups of towns:
- **LATL only:** Nashik, Waluj, Manesar, Bhiwadi and Mehsana.
- **Both companies:** Gurugram, Pune/Chakan, Pantnagar, Sanand and Bengaluru.

So every pin needs a legal-entity label, and LATL's Pantnagar unit (announced in 2007) must not be confused with LIL's ([Business Standard, 2007](https://www.business-standard.com/article/companies/lumax-auto-to-set-up-unit-in-pantnagar-107011701018_1.html)).

## Moulding, coating and assembly run every floor; Bawal makes the electronics

**Process chain.** Lumax's own plant documents name the process steps:
- **Dharuhera:** key processes are "moulding, surface treatment (metalizing) and assembly", with "automatic bead laying, ultrasonic welding, hot melt sealing and hot plate sealing" ([JIPM Dharuhera](https://jipmglobal.com/tpm/wp-content/uploads/25037-Company-profile.pdf)). The plant also runs an "ESD Head lamp synchronous process", "100% Poka Yoke", "100% FIFO in all storage systems" and a "100% automated material handling system".
- **Bawal:** "Electic machine, 2K molding machines, metallising facility along with vibration, hot plate & ultrasonic welding, hot melt sealing" ([JIPM Bawal](https://jipmglobal.com/tpm/wp-content/uploads/25031CO-COMPANY-PROFILE.pdf)).
- **FY26 additions** ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)): expanded **2K/3K injection moulding**, servo conversion of hydraulic moulding machines and IE-4 motors in **annealing ovens**. "BMC waste reduction" points to moulded thermoset reflectors, and "reduction of paint sludge" points to a paint shop.
- **Safety checklist:** the BRSR covers "molding and surface treatment areas, assembly lines, tool rooms ... robotic zones".
- **Bawal Electronics plant:** it runs "SMT lines of imported machines" and is about 90% automated. In 2022 it planned to add one SMT line a year for four years ([Mobility Outlook](https://www.mobilityoutlook.com/features/inr-100-crore-investment-lumax-groups-bet-on-manufacturing-electronic-components/)). It now runs an MES for "end-to-end traceability, real-time production monitoring, and process control". It is being equipped for PCB assembly, electronic driver production and EMI/EMC pre-compliance testing ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)); one research pass attributed that last item to the Czech centre, but the verbatim quote names Bawal.

**Machines and brands.** Few brands are public:
- **Robots:** six from Stanley Electric in the 1990s, six from Vaccutek Automation (Taiwan) between 1998 and 2005, and then from about 2006 a total of 28 ABB IRB 140 and IRB 1410 units, mainly for hot-melt gluing of headlamps ([ABB case study, 2008](https://library.e.abb.com/public/a265c301709c4135ad81f25edac6c82c/Lumax_casestudy_en_lr.pdf)).
- **Large presses:** in 2010 Lumax was investing in "1,300 tonne and 1,500 tonne injection moulding machines" and multi-colour tail-lamp lens moulding ([Autocar Professional, 2010](https://www.autocarpro.in/news-national/lumax-technology-drive-growth-711)).
- **Software** is better documented: Autodesk Moldflow for gate design on clear parts ([Autodesk case study](https://damassets.autodesk.net/content/dam/autodesk/www/pdfs/autodesk-lumax-industries-ltd-case-study-ver-1.pdf)), and Dassault 3DEXPERIENCE for product lifecycle management (PLM) ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)).
- **Not public:** no source names LIL's brands of moulding machine, metallizer, hard-coat line, welder, SMT line, aiming machine or goniophotometer. No Lumax source mentions laser welding. *(Inference)* The joining mix is the older, longer-cycle set (hot plate, vibration, ultrasonic, hot melt), and a demo should use generic machine labels.

**Tooling.** Mould-making is not an in-house activity to model. Tooling is imported, and the Taiwan centre exists to coordinate with Asian toolmakers. Management sees Indian tool localisation as "maybe a 2030 kind of a visibility" ([Q1 FY27 call](https://www.lumaxworld.in/lumaxindustries/pdf/lumax-industries-q1fy27-earnings-call-transcript.pdf)). Plant tool rooms do maintenance. A Bengaluru "Senior Engineer – Tool Room" maintains injection moulds using a lathe, milling, drilling and surface grinding. A Dharuhera manager is to "own the mould development process" ([beBee job listings](https://bebee.com/in/companies/lumax-industries/jobs)). A ₹26.39 crore customs dispute over imported moulds, tools and dies, adjudicated at the Jawaharlal Nehru Custom House (Nhava Sheva), confirms the import route ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)).

**Published plant performance.** Two plants have published JIPM TPM award profiles with performance data:

| Metric | Bawal (4W lighting) | Dharuhera (4W + 2W) |
|---|---|---|
| Capacity | 1.2M vehicle lamp sets/yr (0.75M at 2012 start), 80% utilised | 1.4M 4W sets + 4.2M 2W sets/yr |
| Employees; area (covered) | 858; 42,900 m² (30,300 m²) | 1,390; 44,000 m² (26,163 m²) |
| Sales | Not stated | ₹536 crore (FY24-25) |
| OEE | **86.2%** (FY24-25) | **85.5%** (2025) |
| Availability / performance / quality | 97.2% / 95.9% / 92.5% | 93.5% / 93.8% / 97.5% |
| Breakdowns per year; MTBF | 52; 536.6 days | 420; 245 days |
| MTTR | 59 (unit printed as "Hour") | 27 minutes |
| In-line scrap | **2.8%** of sales | **1.65%** |
| Productivity | 10.5 parts per operator-hour | 24.3 parts per operator-hour (assembly) |
| Production lead time | 3.18 days | 2.5 days (headlamp) |
| Delivery performance; complaints/yr | 100%; 11 | 100%; 2 |

Sources: [JIPM Bawal profile](https://jipmglobal.com/tpm/wp-content/uploads/25031CO-COMPANY-PROFILE.pdf); [JIPM Dharuhera profile](https://jipmglobal.com/tpm/wp-content/uploads/25037-Company-profile.pdf).

**What these numbers mean.** The figures are internally consistent and unusually useful for calibration:
- **The OEE arithmetic checks out.** Availability × performance × quality reproduces the published OEE at both plants: 0.972 × 0.959 × 0.925 = 86.2%, and 0.935 × 0.938 × 0.975 = 85.5% *(inference: own arithmetic)*.
- **Breakdowns are not where Dharuhera loses time.** Its 420 breakdowns at 27 minutes each add up to only about 190 hours of repair a year. That is far too little to explain a 6.5% availability loss, so most of the loss must be changeovers, set-ups and other stops *(inference)*.
- **Bawal loses more to quality than to availability.** A 92.5% quality rate against 2.8% scrap implies rework loops of several per cent *(inference)*.
- **The MTBF figures hint at equipment counts.** If MTBF is per-equipment calendar time, Bawal has roughly 76–93 tracked machines (52 × 536.6 days) and Dharuhera roughly 280–345 (420 × 245 days) *(inference; depends on how JIPM defines the metric)*.
- **The Bawal MTTR unit is probably wrong.** "59 Hour" is probably meant as minutes *(inference)*.
- **Daily volumes.** At an assumed 300 working days, Dharuhera's capacity is about 4,700 4W sets and 14,000 2W sets a day, and Bawal's output at 80% utilisation is about 3,200 sets a day *(inference)*.
- **Dharuhera's weight in the company.** Its ₹536 crore of FY25 sales is about 16% of LIL's FY25 revenue *(inference)*.

**Industry step times.** Lumax publishes almost no cycle times, so the remaining step times come from other companies and vendors:
- **The one Lumax figure (Gurgaon, 2008):** an ABB robot hot-melt-gluing 2W headlamps ran about four seconds faster than the 16-second manual cycle, lifting output from 300 to 345 lamps an hour ([ABB case study](https://library.e.abb.com/public/a265c301709c4135ad81f25edac6c82c/Lumax_casestudy_en_lr.pdf)). The hourly rates imply 10.4–12 seconds, so the case study's own figures do not quite reconcile *(inference)*.
- **Hot-plate welding** of lamps takes "40 sec. to 1 min.", against 20–25 seconds for laser welding ([Machine Design/Emerson](https://www.machinedesign.com/fastening-joining/article/55041926/emerson-technology-comparison-laser-welding-vs-hot-plate-welding-in-automotive-lighting)).
- **Metallising:** a batch evaporation metallizer coats a car-lamp reflector with aluminium and topcoat in 20–25 minutes ([Bühler AluMet](https://buhlergroup.com/global/en/products/alumet_vacuum_evaporationmetalizer.html)). An inline sputter machine claims under 35 seconds, but that is a vendor claim ([DirectIndustry](https://www.directindustry.com/prod/buehler-leybold-optics/product-36157-567585.html)).
- **Hard coating:** a thermal siloxane hardcoat cures for 30 minutes at 126–130 °C after a 5–30 minute flash-off ([Momentive PHC587 TDS](https://www.momentive.com/docs/default-source/tds/silfort/silfort-phc587_tds.pdf)).
- **Thick projector lenses** can need "up to 15 or even 20 minutes" per cycle in single-layer moulding ([Covestro](https://solutions.covestro.com/en/highlights/articles/theme/processing-technology/optics)).
- **Leak testing:** a service-level test holds at most 30 mbar and flags a drop of more than 10 mbar within 30 seconds ([Mercedes-Benz TSB via NHTSA](https://static.nhtsa.gov/odi/tsbs/2024/MC-11007974-0001.pdf)).
- **Sizing reference:** the Indian peer Fiem runs over 450 moulding machines of 50–1,400 tonnes across six plants ([Machinist](https://machinist.in/?p=3982)).

**Quality.** Bawal holds IATF 16949, ISO 14001, ISO 45001 and ISO 50001; Dharuhera holds the first three ([JIPM Bawal](https://jipmglobal.com/tpm/wp-content/uploads/25031CO-COMPANY-PROFILE.pdf)). ISO 45001 covers all plants, and ISO 50001 also covers Chakan II and Pantnagar ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). FY26 TPM awards went to Bengaluru, Pantnagar, Bawal, Dharuhera and Chakan III ([Q4 FY26 release](https://nsearchives.nseindia.com/corporate/LUMAXIND_28052026211706_LILPressrelease.pdf)). Lumax's own Moldflow engineer names the clear-part defects: "Weld lines, Air traps, yellowing, and Air Bubble" ([Autodesk](https://damassets.autodesk.net/content/dam/autodesk/www/pdfs/autodesk-lumax-industries-ltd-case-study-ver-1.pdf)). Industry sources add metallising and coating defects such as runs, haze and dirt ([Products Finishing](https://www.pfonline.com/articles/uv-curable-basecoats-and-clearcoats-for-automotive-lighting)), hot-plate flash and stringing ([Machine Design](https://www.machinedesign.com/fastening-joining/article/55041926/emerson-technology-comparison-laser-welding-vs-hot-plate-welding-in-automotive-lighting)), and condensation through vents ([Gore white paper](https://www.gore.com/system/files/2021-08/whitepaper-venting-solutions-for-clear-visibility.pdf)).

## Five OEMs take about three-quarters of manufacturing sales

| Customer | FY22 share | FY23 share | H1 FY26, ₹ cr (share) | H1 FY27, ₹ cr (share) | H1 growth *(inference: computed)* | Wallet share (management) |
|---|---|---|---|---|---|---|
| Maruti Suzuki + Suzuki Motor Gujarat | 37% | 32% | 474 (26%) | **631 (26%)** | +33% | 27–30% of Maruti's lighting buy |
| Mahindra & Mahindra | 9% | 14% | 372 (20%) | **397 (16%)** | +7% | ~50% |
| Honda Motorcycle & Scooter India | 13% | 12% | 293 (16%) | **326 (13%)** | +11% | 50–60% |
| Tata Motors (PV + CV) | 8% | 7% | 161 (9%) | **281 (11%)** | +75% | Not disclosed |
| Lumax Auto Technologies (sister co.) | n/s | n/s | 103 (6%) | **175 (7%)** | +70% | n/a |
| Hero MotoCorp | 8% | 9% | 139 (8%) | **160 (7%)** | +15% | ~35% |
| TVS Motor | 1% | 4% | 39 (2%) | **76 (3%)** | +95% | Heading to 15–18% |
| Toyota Kirloskar | 3% | 3% | 57 (3%) | **71 (3%)** | +25% | First headlamp win FY26 |
| Suzuki Motorcycle India | in Others | in Others | reclassified | **55 (2%)** | n/m | Heading to ~35% |
| Others (incl. MG, Skoda-VW, CV, tractors) | 20% | 16% | ~9% | **288 (12%)** | n/m | — |
| **Total (excl. moulds)** | ₹1,659 cr | ₹2,228 cr | 1,824 | **2,460** | +35% | |

Sources:
- **Customer splits:** FY22–23 from the [Q4 FY23 investor presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LILQ4FY23Presentation.pdf), H1 FY26 from the [Q2 FY26 investor presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LILIP08112025.pdf), and H1 FY27 from the [Q2 FY27 investor presentation](https://nsearchives.nseindia.com/corporate/LUMAXIND_26102026201707_LILIPQ2FY2027.pdf).
- **Wallet shares:** [Q4 FY25 call](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_Q4FY25Transcript.pdf) and [Q2 FY26 call](https://financialreports.eu/filings/lumax-industries-ltd/call-transcript/2025/46257444/).
- **Caveat:** values are read from pie-chart slides, so slices of 2–4% carry some reading risk.

**Concentration is high but easing.** The top three customers were 58% of FY25 revenue: Maruti 24%, Mahindra 20% and HMSI 14% ([Q4 FY25 call](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_Q4FY25Transcript.pdf)). They were about 61% in FY26 ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)), and ICRA says the top eight provide about 85% of revenue ([ICRA](https://www.icra.in/Rating/GetRationalReportFilePdf?id=142650)). In H1 FY27 the top three fell to about 55% of manufacturing sales, because Tata (+75%), LATL (+70%) and TVS (+95%) grew much faster than Mahindra (+7%) *(inference: computed from deck values)*. Maruti's share slid from 37% in FY22 to 24% in FY25 while its revenue stayed flat at about ₹675–712 crore. It recovered after revenue jumped nearly 50% in FY26, "driven by multiple new model SOPs" ([Q4 FY26 call](https://financialreports.eu/filings/lumax-industries-ltd/call-transcript/2026/47979205/)). At the Q2 FY27 run-rate, manufacturing sales are about **₹100 crore a week**: roughly ₹25 crore from Maruti, ₹16 crore from Mahindra, ₹13 crore from HMSI and ₹11.5 crore from Tata *(inference: quarterly values ÷ 13)*.

**Where LIL is entrenched.** Management puts LIL's wallet share at 27–30% of Maruti's lighting purchases, with "a very strong wallet share" in headlamps. It is about 50% at Mahindra and close to 60% at HMSI ([Q4 FY25 call](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_Q4FY25Transcript.pdf)). In November 2025 management added Hero at about 35%, with TVS heading to 15–18%, Suzuki Motorcycle to about 35% and Yamaha to 15–20% ([Q2 FY26 call](https://financialreports.eu/filings/lumax-industries-ltd/call-transcript/2025/46257444/)). HMSI revenue rose about 55% year on year in Q4 FY25, against HMSI's own 3% growth. The reason is that LIL is single source on new Activa and Shine models (internal codes K0NH and K1KG), built at the Bangalore plant ([Q4 FY25 call](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_Q4FY25Transcript.pdf)).

**Flagship programmes.**
- **e Vitara (Maruti):** LIL supplies "the full lighting system". At Maruti's targeted 150,000–170,000 units, that is worth "close to Rs. 400 crores to Rs. 500 crores annually". LIL invested "a significant amount of money in our Gujarat facility" to build it ([Q2 FY26 call](https://financialreports.eu/filings/lumax-industries-ltd/call-transcript/2025/46257444/)). That works out to about ₹23,500–33,000 of lighting per car and 8–10% of LIL's FY27 run-rate *(inference)*.
- **Toyota Kirloskar:** LIL won its first Toyota headlamp business in FY26, taken "from the competition" and bound for the new Bengaluru plant ([Q2 FY26 call](https://financialreports.eu/filings/lumax-industries-ltd/call-transcript/2025/46257444/)).
- **Chakan:** the new capacity serves "key models of M&M, TMPV, Skoda Volkswagen India, and MSIL" ([ICRA](https://www.icra.in/Rating/GetRationalReportFilePdf?id=142650)).

**Exports, aftermarket and competitors.** LIL serves 13 countries, but exports are only 0.62% of turnover ([FY26 AR, BRSR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). US customs data show Dharuhera shipping tractor spare parts to John Deere's parts distribution centre through Jawaharlal Nehru port ([Panjiva](https://panjiva.com/Lumaxindustries-Ltd/40466600)). Hyundai is effectively not an LIL account: "SL Lumax supplies 100% to across models of Hyundai Motor India" ([Q4 FY26 call](https://financialreports.eu/filings/lumax-industries-ltd/call-transcript/2026/47979205/)). ICRA calls LIL "the leading supplier of lighting solutions for the PV segment and the third largest in the 2W segment". It names Uno Minda (PV and 2W), Fiem (2W), India Japan Lighting (PV) and Marelli Motherson (PV) as competitors ([ICRA](https://www.icra.in/Rating/GetRationalReportFilePdf?id=142650)). The often-quoted ~50% market-share claims include SL Lumax and are dated ([Q4 FY24 call](https://nsearchives.nseindia.com/corporate/LUMAXIND_06062024163701_LILTranscript06062024.pdf)), so the demo should not show a standalone LIL market share.

## A 50:50 Jain–Stanley company is growing faster than its margins

**Ownership.** LIL is a 50:50 promoter company ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)):
- **Stanley side, 37.50%:** Stanley Electric 35.77% and Thai Stanley 1.73%.
- **Jain side, 37.50%:** Deepak Jain 13.30%, Anmol Jain 13.30%, LATL 5.62% and Lumax Finance 5.28%.

The LATL stake is the one formal link that crosses the company boundary. The sister company is a promoter-group shareholder, a 7% customer and a trading partner, with ₹638 crore of related-party transactions in FY26 against a ₹675 crore cap ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). It runs no LIL plant.

**The Stanley partnership.** Stanley has been LIL's technical collaborator since 1984 and a shareholder since 1994. The tie-up was extended to electronics and HVAC panels in 2020. The Bawal electronics plant was "developed as part of the extended Stanley Electric JV", although no separate JV entity exists ([Q2 FY27 investor presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf); [FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). The money involved is material. In FY26 LIL paid Stanley ₹57.75 crore in royalty (up from ₹39.30 crore), ₹7.35 crore in design charges and ₹9.26 crore in management fees, and bought ₹122 crore of materials from it ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). The royalty and fees together equal about 18% of FY26 EBITDA *(inference)*.

**Subsidiary, associate and leadership.** LIL has one wholly owned subsidiary, Lumax Industries Czech s.r.o., and one associate, SL Lumax ([ICRA](https://www.icra.in/Rating/GetRationalReportFilePdf?id=142650)). Leadership changed in May 2026. Deepak Jain became Chairman. Anmol Jain became Managing Director, with "primary executive responsibility for the Company's overall operations". D.K. Jain became Chairman Emeritus ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). Day-to-day management sits with CEO Raju Ketkale (since July 2024) and CFO Ravi Teltia. Operations are split between an EVP – Operations, North & Sanand and a VP – Regional Head West ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). *(Inference)* That North & Sanand versus West split is a natural way to group the demo's regional views.

| Period | Revenue (₹ cr) | EBITDA (₹ cr) | EBITDA margin | Consolidated PAT (₹ cr) |
|---|---|---|---|---|
| FY22 | 1,751 | 131 | 7.5% | — |
| FY23 | 2,320 | 217 | 9.3% | 103.1 |
| FY24 | 2,637 | 266 | 10.1% | 111.0 |
| FY25 | 3,400 | 295 | 8.7% | 139.9 |
| FY26 | **4,184** | **412** | **9.8%** | **172.5** |
| H1 FY27 | 2,565 (+33%) | 223 | 8.7% | 103.1 (+44%) |
| Q2 FY27 | 1,342 (+33%) | 110 | **8.2%** | 52.0 (+46%) |

Sources: [Q2 FY27 investor presentation](https://nsearchives.nseindia.com/corporate/LUMAXIND_26102026201707_LILIPQ2FY2027.pdf); [FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf); FY23–24 PAT from [Business Standard](https://www.business-standard.com/markets/capital-market-news/lumax-industries-consolidated-net-profit-rises-73-83-in-the-march-2024-quarter-124052500183_1.html).

**Growth versus margin.** Revenue has grown 24% a year since FY22 ([Q2 FY27 investor presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)). In April 2026 ICRA upgraded LIL to **[ICRA]AA-(Stable)/A1+**, citing a higher share of OEM business, economies of scale and "higher automation levels at newly commissioned plants" ([ICRA](https://www.icra.in/Rating/GetRationalReportFilePdf?id=142650); the research team could not re-verify this document link). But growth is outpacing margin. Raw material rose to **69.2% of revenue** in Q2 FY27 from 64.7% a year earlier, pushing the EBITDA margin down to 8.2% against FY27 guidance of 10.5–11% ([Q2 FY27 investor presentation](https://nsearchives.nseindia.com/corporate/LUMAXIND_26102026201707_LILIPQ2FY2027.pdf); [Multibagg](https://www.multibagg.ai/market-pulse/articles/lumax-q1fy27-97587)). The chairman cited "supply chain disruptions and volatility in input costs" and said LIL is working with customers "on cost recovery" ([Q2 FY27 release](https://nsearchives.nseindia.com/corporate/LUMAXIND_26102026180749_LILPressrelease_26102026.pdf)). The Q1 call described a lag of about one quarter in passing costs on to OEMs ([Sahi](https://www.sahi.com/news/lumax-industries-raises-fy27-capex-guidance-to-200-250-crore-on-order-wins-378-PE1_CORP)). Management also concedes that "the material margin on an LED lamp is lower" ([Q4 FY25 call](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_Q4FY25Transcript.pdf)), so the shift to LED lifts revenue faster than profit.

**Balance sheet strain.** Between March and September 2026 ([Q2 FY27 investor presentation](https://nsearchives.nseindia.com/corporate/LUMAXIND_26102026201707_LILIPQ2FY2027.pdf)):
- **Receivables** rose from ₹630 crore to ₹812.5 crore.
- **Inventories** rose from ₹643 crore to ₹800 crore.
- **Borrowings** climbed from ₹807 crore to about ₹893 crore, ₹798.5 crore of it short-term.
- **For scale:** net worth was ₹969.6 crore and cash ₹14.8 crore.

ICRA flags the reliance on short-term borrowings and creditors as an asset-liability mismatch ([ICRA](https://www.icra.in/Rating/GetRationalReportFilePdf?id=142650)). Capex was ₹410+ crore in FY26 ([Q2 FY27 investor presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)). FY27 capex guidance was raised to ₹200–250 crore in August 2026 on order wins from Maruti and Toyota ([Sahi](https://www.sahi.com/news/lumax-industries-raises-fy27-capex-guidance-to-200-250-crore-on-order-wins-378-PE1_CORP)). About a third of consolidated PAT, roughly ₹54 crore in FY26, is LIL's share of SL Lumax's profit, a business it does not run *(inference from the before- and after-associate profit lines in the [FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf))*. *(Inference)* Working capital, input-cost recovery and ramp-up execution are therefore the leadership pain points that demo briefings should address.

## Imported LEDs, SAP S/4HANA and one MES frame the data story

**Bill of materials and localisation.** LIL's bill of materials has two halves. About 90% of conventional components are sourced in India ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). LED electronics are not. In the CFO's words, the LED module "is primarily being imported and will continue to be imported" and connectors "are primarily now being imported", while bare PCBs are partly localised and SMT assembly is in-house ([Q4 FY25 call](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_Q4FY25Transcript.pdf)). Localisation figures differ by source, probably because the bases differ:

| Item | Aug 2026 call | FY26 Annual Report |
|---|---|---|
| SMT assembly | 100% | 100% |
| Bare PCBs | 40–50% | 60–70% |
| Connectors | ~24% | 35–40% |
| Overall electronics | — | 30–35% |

Sources: [Yahoo Finance call summary](https://finance.yahoo.com/markets/stocks/articles/lumax-industries-ltd-bom-517206-010455714.html); [FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf).

On the call, management valued further localisation at 70–90 basis points of margin within two to three years. Driver ICs and optical lens components are also "significantly import-dependent". The mitigation is "dual-sourcing from Stanley's global supply network" ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). FY26 foreign-exchange outgo was **₹999 crore**, against ₹2,620 crore of materials consumed. Foreign-currency payables at March 2026 were dominated by USD (about ₹302 crore), with smaller JPY, CZK and EUR amounts ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). The only material named in any source is Covestro Makrolon LED2245 polycarbonate, used for a light blade ([Autodesk](https://damassets.autodesk.net/content/dam/autodesk/www/pdfs/autodesk-lumax-industries-ltd-case-study-ver-1.pdf)).

**Logistics.** Deliveries are short-haul by design: plants sit beside OEM clusters, and the Sanand plants sit inside an OEM vendor park ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)).
- **Customer side:** LIL uses **EDI** "for daily supply schedules and delivery status" ([FY24 AR, BSE filing](https://www.bseindia.com/xml-data/corpfiling/AttachHis/b0645e8c-2f6c-47c8-a591-baa13d7d9f31.pdf)).
- **Supplier side:** the **LSETU** supplier portal is open to all domestic and international suppliers. Schedules are "generated through SAP's Material Resource Planning (MRP) system, which integrates with LSETU in real time", and suppliers must create Advance Shipment Notes before dispatch ([FY24 AR](https://www.bseindia.com/xml-data/corpfiling/AttachHis/b0645e8c-2f6c-47c8-a591-baa13d7d9f31.pdf)). In FY26 SAP MRP was extended to imported material ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)).
- **Supplier development:** seven supplier clusters anchor it, and LIL is targeting a 40–50% CNG conversion of its logistics fleet ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)).
- **Imports:** customs proceedings and US shipment data show imports arriving through JNPT/Nhava Sheva ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf); [Panjiva](https://panjiva.com/Lumaxindustries-Ltd/40466600)).
- **Inventory:** the company holds about two months of inventory against disruption ([Yahoo Finance call summary](https://finance.yahoo.com/markets/stocks/articles/lumax-industries-ltd-bom-517206-010455714.html)). Inventory turned 4.94 times in FY26 ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)), or about 74 days *(inference)*.
- **Not disclosed:** any 3PL, milk-run operator, warehouse or JIT/JIS sequencing arrangement.

*(Inference)* The inter-plant flows a demo can defend are Bawal Electronics PCBAs to every lamp plant, imported moulds and LED modules arriving through JNPT, and related-party flows with LATL.

**Enterprise IT.** The backbone is SAP. In FY24 LIL moved to **SAP S/4HANA under RISE with SAP**, hosted in Google's data centre and managed by SAP with a 99.7% uptime guarantee, and it bought SAP Analytics Cloud licences ([FY24 AR](https://www.bseindia.com/xml-data/corpfiling/AttachHis/b0645e8c-2f6c-47c8-a591-baa13d7d9f31.pdf)). The ERP is "deployed across all manufacturing facilities" and integrates "financial reporting, procurement, inventory management, production planning, and quality management". In FY26 it was extended to the new Sanand facility ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). *(Inference)* In SAP terms that means the FI/CO, MM, PP and QM modules, plus SD for OEM schedule agreements. Waste is monitored daily on an SAP portal, and ESG targets on a digital dashboard ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)).
- **Engineering:** **Dassault 3DEXPERIENCE** with the Global Modular Architecture solution, implemented by SOLIZE Partners India to unify engineering across India, Taiwan and Europe ([Industrial Automation India, Jun 2026](https://www.industrialautomationindia.in/news/lumax-adopts-3dexperience-platform-for-global-engineering)). Alongside it sit Moldflow and the in-house **iLEDX** platform, whose "Digital Twin framework" supports "simulation-first development" of lamps ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)).
- **Workplace and HR:** Google Workspace Enterprise with Gemini, endpoint detection and response (EDR) security and in-house penetration-testing (VAPT) tools, a Contract Labour Management System and digital attendance ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf); [FY24 AR](https://www.bseindia.com/xml-data/corpfiling/AttachHis/b0645e8c-2f6c-47c8-a591-baa13d7d9f31.pdf)).

**Shop-floor systems.** The record here is thin. The only named system is the **MES at the Bawal SMT Electronics plant**, and its vendor is not disclosed ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). Elsewhere LIL reports:
- **TPM** across eight pillars.
- **DOJO 2.0**, an operator-training pilot "on select machines" to be rolled out to all plants.
- **OT controls:** an internal-control framework "progressively extended to cover operational technology environments" as Industry 4.0 automation spreads, while tracking the AIS-189/190 vehicle cybersecurity and software-update standards ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)).

The digital push is group-wide. In July 2026 Lumax World appointed Namrita Mahindro as Chief Digital & Information Officer (CDIO) ([Veloxx Media](https://veloxxmedia.com/lumax-world-strengthens-executive-digital-leadership-with-the-appointment-of-namrita-mahindro-as-chief-digital-information-officer-cdio/)). A September 2026 group posting seeks a "Head – Digital Manufacturing & Connected Technologies CoE" across "42 manufacturing plants". It names MES/MOM, OEE, an "Operational Excellence Command Centre", data historians, predictive maintenance, digital twin, OPC-UA, MQTT and SAP S/4HANA PP/QM ([freehire listing](https://freehire.me/jobs/head-digital-manufacturing-connected-technologies-coe-lumax-world-odtkb2hn)). *(Inference)* That posting describes almost exactly what a digital-twin demo would show, which makes it the strongest public signal that a buyer exists. But it is a group role (LIL plus LATL), and the capabilities it lists are ambitions, not installed systems.

**Real-time machine data: no IoT partner is on the public record (checked 29 October 2026).** A recent project with an outside company to collect real-time IoT data from some Lumax plants could not be confirmed. Vendor searches (Altizon, Infinite Uptime, Faclon, Ripik, Litmus, Siemens, Rockwell, Bosch, PTC, the large Indian IT integrators and the telcos), news searches, and full-text checks of the LIL FY26 annual report, both recent LATL annual reports, LATL's Q4 FY26 deck and LIL's Q1 FY27 call of 11 August 2026 ([transcript](https://nsearchives.nseindia.com/corporate/LUMAXIND_18082026182722_LILtranscript18082026.pdf)) found no named partner, case study or go-live announcement. What is documented, by entity:
- **LIL:** only the Bawal SMT MES, which gives "end-to-end traceability, real-time production monitoring, and process control" ([FY26 AR, p.61](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). No lamp plant is said to stream machine data. LIL's FY26 training topics include "Industry 4.0 & IoT", PLC programming, Power BI and SAP FI/CO/MM/PP/PM/QM/SD/PS, which confirms SAP PM (plant maintenance) and Power BI in the toolset ([FY26 AR, BRSR p.151](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)).
- **LATL (the sister company, not LIL):** "IoT-enabled controls to monitor our energy input at a granular, machine-specific level" ([LATL FY26 AR, pp.44–45](https://www.lumaxworld.in/lumaxautotech/downloads/LATL_Integrated_Annual_Report_FY_2025_26.pdf)), and "centralized data management systems across 30 manufacturing and engineering facilities" giving "a real-time view of key performance indicators" ([LATL FY25 AR, p.37](https://www.lumaxworld.in/lumaxautotech/downloads/annual-report-for-year-ended-march-312025.pdf)). Neither names a vendor or a plant, and LATL says plant-specific data sits in "in-house systems" alongside SAP RISE ([LATL FY26 AR](https://www.lumaxworld.in/lumaxautotech/downloads/LATL_Integrated_Annual_Report_FY_2025_26.pdf)).
- **Group:** the CoE job ad, still open when it was updated on 27 October 2026, lists Siemens, Rockwell, Schneider Electric, Bosch Rexroth, PTC, Dassault and AWS/Azure industrial IoT suites as partners the new head "will manage". It treats OPC-UA, MQTT and edge gateways as work still to be done ([freehire listing](https://freehire.me/jobs/head-digital-manufacturing-connected-technologies-coe-lumax-world-odtkb2hn)). Even the employer is unclear: freehire names Lumax World, while the iimjobs listing for the same role is under Lumax Auto Technologies ([iimjobs](https://www.iimjobs.com/j/lumax-auto-technologies-head-digital-manufacturing-and-connected-technologies-coe-1736982?jobPos=95)).

Two tie-ups are easy to mistake for such a project, and neither collects plant data. The June 2026 Dassault 3DEXPERIENCE deal through SOLIZE is engineering PLM ([Autocar Pro](https://www.autocarpro.in/news/lumax-industries-centralizes-global-product-development-via-digital-platform-deployment-133241)), and ABB's case study covers robots that glue headlamps ([ABB](https://library.e.abb.com/public/a265c301709c4135ad81f25edac6c82c/Lumax_casestudy_en_lr.pdf?x-sign=D+E82Rl0WoH430lObMHdQY4g+sErtGFmE3aiuv0SrPMCmqeOCbKcvYvaRDH0RUwX)). The March 2026 JIPM TPM awards (Excellence for Chakan, Special awards for Bengaluru and Pantnagar, Consistency awards for Dharuhera and Bawal) show mature maintenance practice, not automated data capture ([Autocar Pro, Mar 2026](https://www.autocarpro.in/news/lumax-group-bags-six-jipm-tpm-awards-lumax-auto-technologies-wins-excellence-honour-for-second-year-131846)). *(Inference)* As of 29 October 2026 Lumax has no group-wide live machine-data platform: connectivity is islanded at the Bawal MES and LATL's energy metering, and the command centre is still being staffed. A vendor's or employee's LinkedIn post about a go-live could exist without being indexed, so the partner, plants and entity should be confirmed with Lumax (question 11 below). Full notes are in `research_notes/Lumax plant IoT partnership/iot_partnership.md`.

**People.** The workforce leans heavily on contract labour. At 31 March 2026 LIL had 1,660 permanent employees, 1,576 permanent workers and **5,084 contract workers**: 8,320 people in all, with contract labour about 76% of the shop-floor workforce ([FY26 AR, BRSR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). 22% of permanent workers are unionised. A "Women in Night Shift" programme confirms night operations, but no source gives shift timings ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)).

**Energy.** LIL used about 427 TJ of energy in FY26, almost all of it electricity, and roughly a quarter of it renewable *(inference from BRSR totals)*. Bengaluru reached RE100 in December 2025 with zero grid units, Chakan III is RE100, and Dharuhera hosts a 1.458 MWp agrivoltaic plant ([FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)). FY24 rooftop solar capacity by plant ([FY24 AR](https://www.lumaxworld.in/lumaxindustries/pdf/Annual-Report-for-Year-ended-March-31-2024-LUMAX-INDUSTRIES-LIMITED.pdf)), ready-made values for an energy layer:
- Bawal: 1,050 kW
- Dharuhera: 713 kW
- Chakan: 602 kW
- Pantnagar: 526 kW
- SMT Bawal: 499 kW
- Sanand: 250 kW

## Proposal: an eleven-plant map with six deep floors

### Three ground rules follow from the evidence

The earlier demo's pattern fits Lumax well: real plant locations and specialties, representative machines, fictional orders routed across plants, live stops with owners, a weekly plan against actual, and leadership briefings. Lumax's plants are publicly addressed, two publish loss data, its launches are announced every quarter and its enterprise systems are named. Three ground rules follow *(all inference)*:
1. **Show where every number comes from.** Tag each figure with one of four labels, and put a "simulated data" watermark on every live view, because only the Bawal SMT plant has a documented MES:
   - **S** – a sourced Lumax fact.
   - **I** – an industry figure from another company or vendor.
   - **D** – derived by arithmetic from sourced figures (an inference).
   - **A** – a design assumption to confirm with Lumax (an inference).
2. **Treat the legal-entity boundary as part of the design.** Model LIL plants only, show SL Lumax as a grey associate pin, and show LATL only as an external customer node.
3. **Use real names only down to the programme level.** OEM names and announced vehicle programmes are public. Every quantity, date, part number, price, stop event and person is invented.

All proposal content below is design, and therefore inference, unless a citation says otherwise.

### Place eleven live pins, context pins and an overseas inset

**Map layout** *(inference)*:
- **Base map:** India, with five cluster zooms (NCR-Haryana, Uttarakhand, Pune, Sanand, Bengaluru) and an overseas inset.
- **Accuracy halos:** draw a halo around each pin sized to its coordinate grade: none for A, about 2 km for B, about 5 km for C.
- **Shared estates:** offset the two pairs of plants that share an estate (Bawal lighting and SMT; Sanand D-1 and E-1) by about 1 km so both can be clicked.

| Pin | Demo role | Lat, lon (grade) | Basis |
|---|---|---|---|
| Bawal (lighting) | Live, deep floor | 28.09, 76.60 (C) | S address; coordinates D |
| Bawal Electronics (SMT) | Live, deep floor; hub arrows to all lamp plants | 28.09, 76.60 (C), offset | S flow |
| Dharuhera | Live, deep floor | 28.205, 76.795 (C) | S |
| Pantnagar | Live, summary floor | 28.99, 79.43 (C, estimate) | S address; coordinates A |
| Haridwar | Live, summary floor | 29.93, 78.05 (C, estimate) | S address; coordinates A |
| Chakan II | Live, summary floor; Pune R&D shown co-located | 18.755, 73.809 (C) | R&D location is inference |
| Chakan III | Live, deep floor | 18.761, 73.782 (B) | S |
| Chinchwad | Live, summary floor, flagged "customers to confirm" | 18.632, 73.803 (C) | S address |
| Sanand (D-1) | Live, summary floor | 23.025, 72.279 (C) | S |
| Sanand II (E-1) | Live, deep floor | 23.025, 72.279 (C), offset | S |
| Bengaluru (Bidadi) | Live, deep floor | 12.781, 77.416 (B) | S |
| Bengaluru greenfield | Ghost pin with "SOP Q4 FY27" countdown | ~12.78, 77.42 | S project; coordinates A |
| SL Lumax, Sriperumbudur | Grey associate pin; no floor, no orders | Town-level (not geocoded) | S |
| Corporate office + Gurugram R&D | Office pin | 28.505, 77.084 (B) | R&D co-location is inference |
| LETC, Ostrava (Lumax Industries Czech s.r.o.) | Overseas inset: engineering, optics, software | 49.7697, 18.2694 (A) | S |
| Taiwan design centre | Overseas inset: tooling liaison | Country-level only; city unconfirmed | S existence |
| Stanley Electric, Japan | Partner node (not an LIL site): technology, LED dual-sourcing | Country-level | S |
| JNPT / Nhava Sheva | Inbound port for imported LED modules, connectors, moulds | Not geocoded | S |
| History layer | Gurugram plant (closed 31 May 2023), Manesar electronics (2019 to ~2021), Sanand D-2 (Mar 2022 – Feb 2025) | 28.496, 77.070 (B); 28.367, 76.921 (C) | S |

Show customer destinations as cluster-level OEM nodes, such as "Maruti Suzuki – Sanand operations", "Toyota Kirloskar – Bidadi" or "HMSI – Bengaluru", not as precise OEM plant pins, because OEM plant locations were not researched. A timeline slider replaying the 2023–2027 changes gives leadership an immediate "this is our network" moment: Gurugram's closure, Chakan III's opening, the Sanand merger, Phase 2 and the greenfield countdown. Do not draw LATL plants. At most, add a toggle reading "LATL sites not modelled (sister company)".

### Build every floor from one calibrated station library

| Station (generic label) | Lumax evidence | Process time to use | Basis | Losses and defects to simulate |
|---|---|---|---|---|
| IMM-XL, 1,300–1,500 t (4W housings, outer lenses) | Presses bought 2010; servo retrofits FY26 | 60–90 s per shot | S presses; A time | Mould change, mould damage (sent to tool room), flash, weld lines |
| IMM 2K/3K rotary (multi-colour tail-lamp lenses) | 2K/3K expanded FY26 | 60–90 s | S capability; A time | Colour-boundary defects (I), mould change |
| IMM 150–850 t (bezels, inner lenses, light guides, 2W parts) | "Electric" and servo machines | 30–60 s | S; A time | Weld lines, air traps, bubbles, yellowing (S defect list) |
| Thick projector-lens press | — | Up to 15–20 min single-layer; model as multi-cavity | I (Covestro) | Sink marks |
| BMC reflector press | BMC in use | 60–120 s | S; A time | Outgassing that surfaces later as metallising defects (I) |
| Annealing oven | IE-4 motors in annealing ovens | 30–60 min dwell | S; A time | Oven fault (batch hold) |
| Hard-coat line (flow/spray, flash, cure) | Not named at Lumax *(inference that it exists)* | 5–30 min flash + 30 min cure at 126–130 °C | I (Momentive) | Runs, haze, dirt inclusions |
| UV basecoat, batch vacuum metallizer, topcoat | "Metallising facility" | 20–25 min per batch | S; I time (Bühler) | Iridescence, pinholes, adhesion loss (I) |
| Paint booth (masks, bezels) | Paint shop ~80% utilised | Conveyor pace | S; A time | Sludge, rework |
| Hot-plate welder | Named at both JIPM plants | 40–60 s | S; I time (Emerson) | Flash, stringing, fuming |
| Vibration or ultrasonic welder | Named at both JIPM plants | 15–30 s | S; A time | Weak weld that leads to leak-test failure |
| Hot-melt or bead-laying robot (ABB IRB 140/1410 class) | 28 ABB robots by 2008; automatic bead laying | 10–16 s per 2W headlamp | S (ABB 2008) | Bead skip that leads to leak-test failure |
| Leak test (pressure decay) | — | ~30 s hold at ≤30 mbar; fail above a 10 mbar drop | I (service bulletin, not a production spec) | Re-seal and retest loop |
| Aim and photometric end-of-line test | — | 20–40 s | A; station types I (Averna) | Re-aim loop; ADB segment failure |
| Electrical function test | LED open/short monitoring exhibited | 10–20 s | S feature; A time | LED open/short, then board swap |
| SMT line: print, SPI, 2–3 placers, nitrogen reflow, AOI, (X-ray), depanel, ICT/FCT | Imported lines, ~90% automated, MES | 25–45 s per panel | S line; I sequence; A time | Feeder errors, voids above 5% (I), AOI false calls |
| HVAC control-panel line | Made at Bawal | 30–60 s | S; A time | Function-test failure |

Sources for the evidence and I columns: [JIPM Bawal](https://jipmglobal.com/tpm/wp-content/uploads/25031CO-COMPANY-PROFILE.pdf), [JIPM Dharuhera](https://jipmglobal.com/tpm/wp-content/uploads/25037-Company-profile.pdf), [FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf), [Autocar 2010](https://www.autocarpro.in/news-national/lumax-technology-drive-growth-711), [ABB](https://library.e.abb.com/public/a265c301709c4135ad81f25edac6c82c/Lumax_casestudy_en_lr.pdf), [MarkLines profile](https://www.marklines.com/en/top500/lumax-industries), [Covestro](https://solutions.covestro.com/en/highlights/articles/theme/processing-technology/optics), [Momentive](https://www.momentive.com/docs/default-source/tds/silfort/silfort-phc587_tds.pdf), [Bühler](https://buhlergroup.com/global/en/products/alumet_vacuum_evaporationmetalizer.html), [Emerson](https://www.machinedesign.com/fastening-joining/article/55041926/emerson-technology-comparison-laser-welding-vs-hot-plate-welding-in-automotive-lighting), [Mercedes-Benz TSB](https://static.nhtsa.gov/odi/tsbs/2024/MC-11007974-0001.pdf), [Averna](https://www.averna.com/en/products/platforms/headlamp-test-platform), [BestPCBs](https://www.bestpcbs.com/blog/tag/automotive-lighting-pcb-manufacturing/).

Every lamp floor shares one routing, with rework loops that make quality losses visible (S process blocks, I/A detail):

```
Moulding ─┬─ outer lens (PC) ──► annealing ──► hard coat ───────────────────────────┐
          ├─ housing ───────────────────────────────────────────────────────────────┤
          ├─ reflector (BMC) / bezel ──► UV basecoat ──► metallizer ──► topcoat ────┤
          └─ inner lens / light guide (2K/3K) ──────────────────────────────────────┤
Bawal SMT: print ► SPI ► place ► reflow ► AOI ► ICT/FCT ► in transit (2–5 days) ────┤
                                                                                    ▼
Assembly: LED module or bulb holder ► reflector/projector ► inner lens ► seal or weld
  ► leak test ─(fail: re-seal)─► aim + photometry ─(fail: re-aim)─► function test
  ─(fail: board swap)─► visual ► pack ► OEM dispatch against EDI call-off
```

### Six deep floors carry the story; five summary floors complete the network

Fleet counts are design assumptions (A) unless marked. For Bawal they are deliberately sized to fall within the 76–93 machine population implied by its MTBF data (D).

| Plant and demo specialty | Representative stations (fleet counts are A) | Daily output target | Calibration |
|---|---|---|---|
| **Dharuhera**: the mixed 4W + 2W "mother plant". Makes headlamps, tail lamps, side turn lamps, DRLs, HMSL and reflex reflectors (S). Runs a synchronous ESD headlamp line and automated material handling (S) | **Moulding:** 45 IMMs (4 XL, 6 2K/3K, 4 BMC, 31 small/mid). **Finishing:** 3 annealing ovens, 2 hard-coat lines, 2 basecoat lines + 5 metallizers, 1 paint booth. **Assembly:** 6 4W lines (hot-plate welders, bead-laying robots) and 8 2W lines (hot-melt robots, ultrasonic welders). **Test:** leak and function test on every line, 6 aim/photometric stations | ~3,500 4W sets + ~10,500 2W sets (D: 75% of capacity over 300 days) | OEE 85.5% (93.5/93.8/97.5); scrap 1.65%; ~1.4 breakdowns per working day, MTTR 27 min; lead time 2.5 days; 24.3 parts/operator-hour (all S/D) |
| **Bawal (lighting)**: premium 4W LED and triple-LED headlamps, rear combination lamps and fog lamps for Maruti and Honda Cars (S) | **Moulding:** 28 IMMs (4 XL, 6 2K/3K, 3 BMC, 2 thick-lens, 13 mid). **Finishing:** 2 annealing ovens, 1 hard-coat line, 1 basecoat line + 3 metallizers, 1 paint booth. **Assembly:** 6 lines (3 LED headlamp lines with hot-melt robots and paired hot-plate welders, 2 rear combination lamp lines with vibration welders, 1 fog lamp line with ultrasonic). **Test:** 3 aim/photometric stations | ~3,200 vehicle sets (D) | OEE 86.2% (97.2/95.9/92.5); scrap 2.8% with visible rework loops; ~1 breakdown a week; MTTR 59 min (unit A); lead time 3.18 days; 10.5 parts/operator-hour (S/D) |
| **Bawal Electronics (SMT)**: LED PCBA hub for all lamp plants plus HVAC control panels (S); the only MES-connected floor (S) | 4 SMT lines (A, consistent with the 2022 plan of one line a year, S), each with printer, SPI, 2–3 placers, nitrogen reflow and AOI. Plus 1 X-ray, 2 depanelers, 4 ICT/FCT testers, 1 HVAC panel line and 1 EMI/EMC pre-compliance bench (S: being equipped) | Boards matched to lamp-plant demand, plus 2–5 days in transit (A) | No published OEE: use 85% and 98% AOI first-pass yield (A). Stop feed shown as "MES-sourced" |
| **Chakan III**: newest, "highly automated" LED plant for M&M, Tata PV, Skoda-VW and Maruti; Phase 2 serves Skoda-VW (S); RE100 (S) | **Moulding:** 30 IMMs incl. 8 2K/3K. **Finishing:** 1 hard-coat line, 3 metallizers. **Assembly:** 6 Phase-1 lines (M&M SUV headlamps and fog/cornering lamps, Tata lamps) and 3 automated Phase-2 lines (Skoda-VW rear lamps). **Test:** automated aim/photometric end-of-line | ~9,000 lamps (D: 25.38 lakh unverified + 8.5 lakh S lamps a year at 80%) | Start from the Bawal availability profile (A). Ramp Phase 2 the way Phase 1 actually ramped: 50–60%, then 70–80%, then toward ~90% utilisation (S). Scrap 2.0–2.8% during ramp-up (A, within the S range) |
| **Sanand II (E-1)**: Gujarat EV/ADB showcase with the e Vitara full lighting system incl. ADB headlamps (S: Gujarat; which Sanand plant is A) | **Moulding:** 20 IMMs. **Finishing:** 2 metallizers, 1 hard-coat line. **Assembly:** 2 ADB headlamp lines with matrix-module function test and ADB photometric end-of-line test; 2 rear combination lamp lines | ~500–570 vehicle sets at management's 150–170k units/yr (D); the actual ramp shown lower (A) | OEE ramps from 80% toward 86%; scrap near the 2.8% ceiling while ramping (A) |
| **Bengaluru (Bidadi)**: single-source HMSI Activa / Activa e / Shine 2W headlamps (S) plus Toyota 4W lamps (S account; current programmes A); RE100 (S) | **Moulding:** 24 IMMs. **Finishing:** 2 metallizers, 1 hard-coat line. **Assembly:** 4 2W lines with hot-melt robots at a 10–16 s takt (S benchmark); 2 4W lines. **Support:** a tool room for mould maintenance (S role). The greenfield ghost pin sits next door | Sized from HMSI's ~₹12.7 crore a week. At most ₹1,500 per kit, that implies at least ~85,000 2W kits a week network-wide (D) | Reuse the Dharuhera 2W loss profile (A transfer) |

The five summary floors are Pantnagar, Haridwar, Chakan II, Chinchwad and Sanand D-1. Each should show KPI tiles and one representative line. OEE should fall between the two published plants (85.5–86.2%), scrap between 1.65% and 2.8%, and breakdown rates should scale between the Bawal and Dharuhera rates by assumed size (D/A). Each needs a visible "mix to confirm" badge where the customer mapping is unsourced:
- **Pantnagar:** founded for Tata Motors (S, 2008).
- **Haridwar:** Hero MotoCorp 2W (S, 2012).
- **Chakan II:** Pune 4W. It won the ACMA Manufacturing Excellence Award 2025 and a Mahindra "(Chakan)" on-time fulfilment award (S).
- **Chinchwad:** design and manufacture of lighting (S); customers unpublished.
- **Sanand D-1:** Swift lamps, 3 lakh sets a year (S, FY18), plus brownfield capacity for about 100,000 vehicles (S).

Sources: [Q4 FY26 release](https://nsearchives.nseindia.com/corporate/LUMAXIND_28052026211706_LILPressrelease.pdf); [FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf); [MarkLines profile](https://www.marklines.com/en/top500/lumax-industries); [Q2 FY25 call](https://www.lumaxworld.in/lumaxindustries/pdf/LILQ2transcript14112024.pdf).

**Cross-plant routing** is what makes the network feel real:
- Bawal PCBAs flow to every lamp plant (S).
- Imported moulds and LED modules arrive through JNPT (S).
- Overflow can move between sister plants in the same cluster (Bawal↔Dharuhera, Chakan II↔III, Sanand D-1↔II) when a line is short of capacity. This is a fictional routing rule (A) that demonstrates network rebalancing.

### Stops should be mostly changeovers and minor losses, not breakdowns

| Stop type | Where | Rate and duration to simulate | Basis | Owner role on screen |
|---|---|---|---|---|
| Breakdown | Any station | Dharuhera-class plant ~1.4 per working day at 27 min; Bawal-class ~1 a week at ~59 min | S/D; Bawal unit A | Maintenance engineer (TPM planned-maintenance pillar, S) |
| Mould change or set-up | IMMs | Fills the rest of the availability loss: ~13 min (Bawal) to ~31 min (Dharuhera) per machine per 8-hour shift | D | Moulding shift engineer ("Senior Engineer – Moulding" role, S) |
| Mould damage or tool trial | IMMs | Rare, lasting hours; replacement tooling is imported | S import; A rate | Tool-room engineer (S role) |
| Minor stops and speed loss | Assembly, SMT | 4.1% (Bawal) to 6.2% (Dharuhera) of run time, ~20–30 min per shift | S/D | Line leader (A) |
| Quality hold or rework loop | Metallizing, leak test, end-of-line test | Quality loss 2.5–7.5%; scrap 1.65–2.8% | S | Quality engineer (A) |
| Material wait: imported LED module, connector, driver IC | SMT, assembly | Rare but long | S dependence; A rate | Vendor development / PPC manager (S roles) |
| PCBA in transit from Bawal | Lamp-plant assembly | Occasional delay | S flow; A rate | PPC manager (S role at Bawal) |
| Manpower shortfall | Assembly | Fed from the Contract Labour Management System; 76% of workers are contract | S mix; A rate | Shift in-charge (A) |

Role sources: [beBee job listings](https://bebee.com/in/companies/lumax-industries/jobs); [FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf).

**What the stop feed should look like** *(inference)*:
- **Breakdowns stay rare.** They run at about 1.4 a day across all of Dharuhera and one a week at Bawal, so a screen flooded with red machine failures would misrepresent Lumax's own TPM record. Most of the live feed should be changeovers, minor stops, quality holds and material waits.
- **A network-wide breakdown rate.** Scaling the two published plants by headcount gives roughly 2–8 breakdowns a day across LIL, about 6 at the blended rate (D, assumption-heavy). That is one every few hours somewhere in the network.
- **Scrap by cause.** Split scrap roughly 45% moulding (S defect types), 30% surface treatment (I) and 25% assembly and test (I). This split is an assumption to confirm.
- **People.** Owners should be fictional names attached to the real role titles above. Never attach a fictional event to an executive named in the annual report.

### Use real customers and programmes, with fictional quantities

| Customer (real) | Announced programmes and lamps (sourced) | Demo plant (basis) | Weekly value, ₹ cr (D) | Must be fictional |
|---|---|---|---|---|
| Maruti Suzuki / Suzuki Motor Gujarat | e Vitara full lighting incl. ADB headlamp, rear combination lamp, tail/stop lamp; new Swift complete lighting; Victoris DRL with projector; Grand Vitara spot lamps | e Vitara at Sanand II (Gujarat S, plant A); Swift at Sanand D-1 (A; previous generation S); Victoris at Bawal (A); legacy tail lamps at Dharuhera (A) | 25.0 (e Vitara 7.7–9.6 at target volume) | Call-offs, part numbers, prices (keep within the ₹8–12K headlamp and ₹3K tail-lamp bands), receiving OEM plant |
| Mahindra & Mahindra | Thar ROXX / Thar Refresh headlamp, fog/cornering lamp, side repeater; XUV 7XO fog, cornering, map, sun-visor and roof lamps; Scorpio-N headlamp, rear, fog, reverse and HMSL; BE 6 Bi-LED headlamp; UDO electric 3W | Chakan III (Thar ROXX and XUV700 at Chakan, S; others A); Chakan II takes overflow (A) | 16.2 | Volumes, variants, destinations |
| Honda Motorcycle & Scooter India | Activa, Activa e and Shine headlamps (single source) | Bengaluru Bidadi (S) | 12.7 | Everything below model level |
| Tata Motors (PV, CV) | Punch facelift DRL, headlamp and fog lamp; Tiago headlamp; Sierra fog and auxiliary tail lamp; Altroz mood, tailgate and overhead lamps; Aeris tail lamp | Chakan III (Tata named for Chakan, S); Chinchwad and Pantnagar for CV and legacy work (A) | 11.5 | Volumes, plant split |
| Lumax Auto Technologies (sister company) | Content undisclosed | Dharuhera / Bawal (A) | 7.9 | The entire flow; label it "group company sale" |
| Hero MotoCorp | Xtreme 160 LED headlamp | Haridwar (founding customer S; current A) | 6.5 | Volumes |
| TVS Motor | Jupiter LED headlamp; Apache RTX 300 headlamp | Not disclosed (A: Bidadi) | 3.2 | Plant, volumes |
| Toyota Kirloskar | Urban Cruiser lamp set; Urban Cruiser Ebella headlamp, side turn indicator, tail and lid lamps; new headlamp award | Bidadi now; greenfield from Q4 FY27 (S) | 3.1 | Volumes, SOP date |
| Suzuki Motorcycle India | e-Access headlamp and front turn signal; Burgman Street front turn signal | Not disclosed (A: Dharuhera) | 2.2 | Plant, volumes |
| Others (~12%) | Skoda-VW Kushaq facelift tail lamp and Taigun rear lamp (Chakan III Phase 2, S); Force Traveller 2 headlamp; VECV Titan headlamp; Mahindra Last Mile Mobility e-rickshaw lamps; John Deere tractor spares exported from Dharuhera via JNPT (S) | As noted; others A | 11.8 | Volumes, plants |
| Moulds (tooling) | Customer-funded moulds for new programmes | Billed by milestone (S revenue line) | ~3.2 (Q2 FY27 ₹41.5 cr ÷ 13) | Project names, milestones |
| Internal | Bawal PCBAs to all lamp plants (S); HVAC control panels (S product, customer undisclosed) | Bawal Electronics | Transfer | Volumes, HVAC customer |

Sources:
- **Launches and programmes:** [Q4 FY24 call](https://nsearchives.nseindia.com/corporate/LUMAXIND_06062024163701_LILTranscript06062024.pdf), [Q4 FY25 release](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_PressRelease.pdf), [Q3 FY26 release](https://bsmedia.business-standard.com/_media/bs/data/announcements/bse/10022026/71c79680-ed85-4b7b-8edd-db1c4af675aa.pdf), [Q4 FY26 release](https://nsearchives.nseindia.com/corporate/LUMAXIND_28052026211706_LILPressrelease.pdf), [Q1 FY27 release](https://nsearchives.nseindia.com/corporate/LUMAXIND_08082026172412_PressRelease.pdf), [Q2 FY27 release](https://nsearchives.nseindia.com/corporate/LUMAXIND_26102026180749_LILPressrelease_26102026.pdf).
- **Programme details:** [MarkLines Scorpio-N](https://www.marklines.com/en/news/274204), [MarkLines Aug 2024](https://www.marklines.com/en/news/312816), [MarkLines profile](https://www.marklines.com/en/top500/lumax-industries).
- **Plant links:** [Q2 FY25 call](https://www.lumaxworld.in/lumaxindustries/pdf/LILQ2transcript14112024.pdf) (Thar ROXX and XUV700 at Chakan), [Q4 FY26 call](https://financialreports.eu/filings/lumax-industries-ltd/call-transcript/2026/47979205/) (Skoda-VW).
- **Weekly values:** Q2 FY27 customer sales ÷ 13 ([Q2 FY27 investor presentation](https://nsearchives.nseindia.com/corporate/LUMAXIND_26102026201707_LILIPQ2FY2027.pdf)).

**Order mechanics** *(inference)*:
- **Releases:** model OEM orders as daily EDI schedule releases against monthly forecasts. LIL's EDI does carry daily schedules (S); the forecast structure is an assumption.
- **Pilot supply:** new programmes start about a month before the OEM's start of production, as LIL described in 2012 ([Autocar Pro 2012](https://www.autocarpro.in/feature/lumax-shines-bright-cars-bikes-3475)).
- **Delivery misses:** both audited plants report 100% delivery performance (S), so a missed delivery should be a rare, headline event rather than routine noise.

**Exclude from the order book:**
- Hyundai and Kia orders, which belong to SL Lumax.
- Any LATL product (plastics, interiors) on an LIL floor.
- The 2013-era Jaguar Land Rover export work.
- Any EV start-up account with no evidence, such as Ather or Ola.

### A ₹100-crore week drives plan-versus-actual and the briefings

**The weekly plan.** Set the network weekly plan at about ₹100 crore of manufacturing sales plus about ₹3 crore of mould billing (D from Q2 FY27). Split it by customer as in the table above, and by plant through the programme assignments.
- **Plan side** comes from simulated SAP MRP and schedule-agreement releases.
- **Actual side** comes from simulated production confirmations and dispatches.
- **Plant loading** should sit at 70–80% of capacity (S) for mature plants. Chakan III Phase 2, Sanand II and later the Bengaluru greenfield show ramp curves below rate.
- **Typical deviations** are inferences tied to real pressures: an imported-module shortage at Sanand II, a Bawal rework spike, or a mould-change backlog at Dharuhera.
- **Tooling revenue** should be lumpy and weighted to the second half, as management guides (S) ([Sahi](https://www.sahi.com/news/lumax-industries-raises-fy27-capex-guidance-to-200-250-crore-on-order-wins-378-PE1_CORP)).

**Leadership briefings** should be addressed to role titles and drawn from LIL's real issues:
- **MD / CEO:** network plan against actual; programme ramp-ups; Toyota and Maruti greenfield readiness.
- **EVP Operations, North & Sanand:** Bawal, Dharuhera, Uttarakhand and Sanand OEE against the JIPM baselines.
- **VP Operations, West:** the Chakan and Chinchwad plants. Bengaluru's reporting line is unconfirmed.
- **CFO:** raw material at 69.2% of revenue against guidance; the one-quarter cost-recovery lag; inventory of about ₹800 crore and receivables of about ₹812 crore; USD exposure on LED imports. All of these figures are S.

The briefings can name the real structure. They must never put invented words or events in the mouths of the named executives *(inference)*.

### Read from SAP, EDI, LSETU and the Bawal MES, and label the rest simulated

| System the demo "reads" | Evidence | What the demo shows from it | Confidence |
|---|---|---|---|
| SAP S/4HANA (RISE, Google data centre, SAP-managed): PP, MM incl. import MRP, QM, FI/CO; SD *(inference)* | [FY24 AR](https://www.bseindia.com/xml-data/corpfiling/AttachHis/b0645e8c-2f6c-47c8-a591-baa13d7d9f31.pdf); [FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf) | Production orders, MRP and stock, inspection lots, scrap cost, schedule agreements | High that it exists |
| SAP Analytics Cloud | [FY24 AR](https://www.bseindia.com/xml-data/corpfiling/AttachHis/b0645e8c-2f6c-47c8-a591-baa13d7d9f31.pdf) | Leadership briefing tiles | High that it is licensed; use unknown |
| OEM EDI | [FY24 AR](https://www.bseindia.com/xml-data/corpfiling/AttachHis/b0645e8c-2f6c-47c8-a591-baa13d7d9f31.pdf) | Daily schedules and delivery status, which become the orders | High |
| LSETU supplier portal (with ASNs) | [FY24 AR](https://www.bseindia.com/xml-data/corpfiling/AttachHis/b0645e8c-2f6c-47c8-a591-baa13d7d9f31.pdf) | Supplier schedules, ASNs, inbound ETAs, payment status | High |
| Bawal SMT MES | [FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf) | Line states, board traceability, first-pass yield: the only "connected" floor | High that it exists; vendor unknown |
| Dassault 3DEXPERIENCE (Global Modular Architecture) | [Industrial Automation India](https://www.industrialautomationindia.in/news/lumax-adopts-3dexperience-platform-for-global-engineering) | Bills of materials, engineering changes and release dates that drive ramp-ups | High |
| iLEDX digital-twin framework | [FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf) | Positioned as the product twin, which the factory twin complements | Medium |
| TPM/JIPM OEE records; DOJO 2.0 | [JIPM Bawal](https://jipmglobal.com/tpm/wp-content/uploads/25031CO-COMPANY-PROFILE.pdf); [FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf) | OEE baselines; operator certification on pilot machines | Medium; format unknown |
| Contract Labour Management System; digital attendance | [FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf) | Manpower available per shift | Medium |
| SAP waste portal; ESG dashboard | [FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf) | Daily scrap and waste; energy and renewable share | Medium |
| Google Workspace Enterprise with Gemini | [FY26 AR](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf) | Briefing distribution *(inference)* | Low |
| LATL machine-level IoT energy monitoring; LATL real-time KPI dashboards across 30 facilities | [LATL FY26 AR](https://www.lumaxworld.in/lumaxautotech/downloads/LATL_Integrated_Annual_Report_FY_2025_26.pdf); [LATL FY25 AR](https://www.lumaxworld.in/lumaxautotech/downloads/annual-report-for-year-ended-march-312025.pdf) | Nothing on LIL floors. Cite only as group precedent that machine-level metering already exists | High that LATL claims it; vendor and plants unknown |
| **Do not claim:** plant-wide MES at the lamp plants, SCADA or a historian, OPC-UA/MQTT connectivity, APS/IBP planning, PLC brands, or a named IoT / real-time machine-data partner at any Lumax plant | The [group CoE job ad](https://freehire.me/jobs/head-digital-manufacturing-connected-technologies-coe-lumax-world-odtkb2hn) lists these as ambitions; no IoT partner is public as of 29 Oct 2026 | Label as "future connection" | — |

### Eleven questions to settle with Lumax before building

| # | Question | Why it matters | Best current evidence |
|---|---|---|---|
| 1 | Which plant builds which programme and serves which OEM plant? This is especially unclear for Pantnagar, Chinchwad, Chakan II, Haridwar and post-2023 Dharuhera. Which Sanand plant builds the e Vitara? Where are the TVS, Suzuki 2W, Force, VECV and Mahindra Last Mile Mobility lamps made? | Drives order routing and plant specialties | Partial: Chakan, Sanand and Bengaluru only |
| 2 | Machine population per plant: number and tonnage of injection moulding machines; metallizer, hard-coat and paint lines; any laser welding. How does JIPM define MTBF? | Fleet counts are currently assumptions | Machine types only; implied 76–93 machines at Bawal |
| 3 | Real cycle times, line takts, shift pattern (3×8 h or 2×12 h) and working days | Throughput and stop timing | One 2008 robot benchmark only |
| 4 | Bawal SMT: line count, MES vendor and data model. Does any lamp plant have machine connectivity or a historian? | Decides which tiles can be "live" | MES existence only |
| 5 | Is Bawal's MTTR 59 minutes or 59 hours? Can the JIPM figures be shown to a Lumax audience? | Calibration and credibility | Unit printed as "Hour" |
| 6 | Plot-level coordinates, especially for Bawal (×2), Pantnagar, Haridwar and Sanand (×2), and the greenfield plot | Map accuracy | Grade B/C geocodes |
| 7 | Delivery model: EDI frequency, JIT/JIS sequencing, freeze windows, logistics partners | Order and dispatch logic | Daily EDI schedules only |
| 8 | What does LATL buy from LIL (₹175 crore in H1 FY27), and should it appear at all? | Entity separation | Undisclosed |
| 9 | Permission to show OEM and programme names, OEM confidentiality limits, and use of real executive titles | Legal and relationship risk | Names are public launches only |
| 10 | Taiwan centre city and role; whether to show Stanley Electric and SL Lumax; Bengaluru's regional reporting line | Map completeness and briefing routing | Country-level only; North & Sanand / West split |
| 11 | Which company ran the reported real-time IoT / machine-data project, at which plants, for which entity (LIL or LATL), and what does it capture (machine states, counts, energy)? | If confirmed at LIL plants, those floors become live tiles on day one | Not public; nearest are the Bawal MES and LATL's energy IoT |

### Conclusion: honesty about the data becomes the pitch

The research shifts the demo's centre of gravity *(inference)*. Lumax is not a plant that spends its days fighting breakdowns: its two audited plants run at 85–86% OEE, with breakdowns counted per week or per day. The twin's value lies in the problems Lumax itself reports:
- **Simultaneous ramp-ups:** Chakan III Phase 2, Sanand II and the Bengaluru greenfield.
- **Import exposure:** a dollar-exposed LED bill of materials that funnels through one SMT hub and one port.
- **Quality:** rework-heavy quality at its premium 4W plant.
- **Working capital:** receivables and inventory growing faster than sales.

One storyline tells Lumax's story better than any animated press: an e Vitara ADB line at Sanand II waiting on an imported module, the Bawal SMT plant re-sequencing boards to protect it, and the CFO view of what that inventory buffer costs.

The second shift is that honesty about data becomes a selling point *(inference)*. Only the Bawal SMT MES is documented, and the group is now hiring to build an Operational Excellence Command Centre across all its plants. The most persuasive demo therefore shows which tiles would be live on day one (SAP S/4HANA, EDI, LSETU, the Bawal MES) and which stay simulated until machines are connected. That turns the S/I/D/A provenance tags from a disclaimer into the implementation roadmap that the group CDIO's new digital-manufacturing team is being recruited to deliver. If the IoT project Lumax is said to have run is confirmed, the plants it covers join the day-one live tiles. It also keeps the demo firmly on the LIL side of the LIL–LATL line.
