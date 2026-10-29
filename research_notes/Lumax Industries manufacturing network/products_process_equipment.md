# Lumax Industries: products, lamp manufacturing process and equipment (as of October 2026)

Labels used throughout: **[LUMAX]** means the fact is specific to Lumax Industries Limited (LIL) or its plants. **[INDUSTRY]** means it describes automotive lighting manufacturing in general (another maker, a machine vendor, a coating supplier, a patent or an OEM bulletin), not Lumax. Most Lumax primary documents are PDFs. I extracted their text with pdftotext, and the citations point to the original URLs.

Key primary sources:
- LIL Q2 & H1 FY27 Investor Presentation, Oct 2026 (https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)
- LIL Integrated Annual Report 2025-26 (https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)
- JIPM TPM award company profiles for the Bawal plant (https://jipmglobal.com/tpm/wp-content/uploads/25031CO-COMPANY-PROFILE.pdf) and the Dharuhera plant (https://jipmglobal.com/tpm/wp-content/uploads/25037-Company-profile.pdf). These hold plant-level OEE, MTTR, scrap and capacity data, the most useful material here for a simulation.

---

## 1. Lumax product lines, segments, technologies and named vehicle programmes

### Takeaway
LIL makes the full exterior and interior automotive lamp range for passenger vehicles (PV), two-wheelers (2W) and commercial vehicles (CV): headlamps, rear combination and tail lamps, fog lamps, signal and turn lamps, DRLs, high-mount stop lamps (HMSL), reflex reflectors, interior and mood lighting, plus LED PCBs, driver electronics and HVAC control panels. In FY26 front lighting was 69% of revenue, LED 61% and PVs 65%. LED is 88% of the order book. Programmes run from halogen sets to the ADB (adaptive driving beam) headlamp on the Maruti/Suzuki e Vitara.

### Cited Findings
**Portfolio and segments**
- [LUMAX] Business is reported as one segment, "Automotive Lighting and Electronics", covering "headlamps, tail lamps, fog lamps, turn indicators, daytime running lamps (DRLs), LED modules, HVAC control panels, and associated electronic sub-assemblies" for PV, 2W, CV and EV OEMs. — [LIL Annual Report 2025-26](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)
- [LUMAX] LIL is described as offering "end-to-end exterior lighting, interior cabin lighting and new-technology lighting (AFS, ADB, Matrix)". It serves 2W, 4W, CV and farm equipment. — [LIL Q2FY27 Investor Presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)
- [LUMAX] MarkLines lists the product range as headlamps, tail and fog lamps, high-mount stop lights, auxiliary lamps, indicators, DRL, ADB systems, LED side indicators, interior/mood lighting, HVAC panels and electronic components. — [MarkLines Lumax profile](https://www.marklines.com/en/top500/lumax-industries)
- [LUMAX] The Dharuhera plant makes "Head Lamps, Tail Lamps, Side Turn Lamps, Day Running Lamps, High Mount Stop Lamps & Reflex Reflectors". — [JIPM Dharuhera profile](https://jipmglobal.com/tpm/wp-content/uploads/25037-Company-profile.pdf)
- [LUMAX] The Bawal plant makes "Head Lamps, Tail Lamps, Fog Lamps with latest process Triple LED function technology", mainly for Maruti Suzuki and Honda Cars India. — [JIPM Bawal profile](https://jipmglobal.com/tpm/wp-content/uploads/25031CO-COMPANY-PROFILE.pdf)
- [LUMAX] Life-cycle assessments were done for PV OEM programmes covering "head lamps, tail lamps, side indicator lamps (SILs), blinker lamps and fog lamps". — [LIL Annual Report 2025-26](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)
- [LUMAX] Electronics: the Bawal Electronics Facility makes PCBs. SMT assembly is "100%" localised and PCB bare boards are 60–70% localised. Overall LED electronic component localisation is 30–35%, with a target of 50–60%. LED driver modules are the next item to localise. HVAC control panels are made at Bawal under the extended Stanley partnership. — [LIL Annual Report 2025-26](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)
- [LUMAX] Separately moulded plastic parts are mainly a business of the sister company Lumax Auto Technologies (LATL: "Advanced Plastics & Interiors"), not LIL. LATL is also an LIL customer. — [LIL Q2FY27 Investor Presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)

**Revenue mix**
- [LUMAX] FY26 revenue was INR 4,184 Cr, with EBITDA of INR 412 Cr (9.8%) and capex of INR 410+ Cr.
  - By product: front lighting 69%, rear lighting 22%, others 9%.
  - By vehicle: PV 65%, 2W 29%, CV 6%.
  - By technology: LED 61%, conventional 39%.
- [LUMAX] H1 FY27 mix:
  - LED 63%, conventional 37%.
  - PV 63%, 2W and 3W 31%, CV and others 6%.
  - Front 68%, rear 22%, others 10%.
- [LUMAX] Order book (Q2 FY27) is INR 2,580 Cr: about 88% LED, about 11% EV, PV 63%, 2W and 3W 37%.
- [LUMAX] Indicative content per vehicle: a base LED headlamp is INR 8–12K and an LED tail lamp about INR 3K.
- Source for the four items above: [LIL Q2FY27 Investor Presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)
- [LUMAX] Revenue includes "Moulds Revenue" (tooling sold to customers), shown separately from manufacturing revenue: INR 104.9 Cr in H1 FY27 against INR 2,460.2 Cr manufacturing revenue. — [LIL Q2FY27 Investor Presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)
- [LUMAX] Customers in the customer-wise sales chart: MSIL/SMG, M&M, HMSI, Tata, LATL, Hero MotoCorp, TVS, Toyota, SMIPL, MG and others. — [LIL Q2FY27 Investor Presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)

**Technologies (current and roadmap)** [LUMAX]
- The technology path runs from halogen headlamps and bulb-based rear and signal lamps (FY18), to LED projector headlamps, LED DRLs and LED tail lamps (FY24–25), to ADB, animated and sequential LED signatures (FY26 onward). — [LIL Q2FY27 Investor Presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)
- In-house developments include OLED rear lamps with animation, low-cost LED headlamp modules, "Ultra Homogenous Lux-LED Signal Lamps", low-profile headlamp projector modules, Matrix (ADB) headlamp module and controls, grille lighting with animation and charging indication, image projection modules, and interior and mood lighting. Patents (as of 30 Sep 2026): 6 awarded, 50 filed, 37 designs filed. — [LIL Q2FY27 Investor Presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)
- The roadmap for 2024–2032 covers:
  - slim line modules and super slim line modules (5–10 mm)
  - illuminated logos and grilles
  - micro-optics foils and MLA (micro-lens array)
  - ADB + AFS
  - mLED for AFS/ADB
  - MEMS or DLP road projection
  - ADAS sensor integration
  - Source: [LIL Q2FY27 Investor Presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)
- Development work also includes BiLED, ADB and intelligent modules with welcome and farewell animations, light blades, laser ablation, microstructure surface lighting, RGB mini-LED and micro-LED, thermally conductive polymers replacing metal heat sinks, and thin-wall honeycomb moulding. — [LIL Annual Report 2025-26](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)
- Exhibited items include a 2W ADB headlamp, a micro-chip LED with 6-line ADB, a 12-segment LED unit with light guide, an animated tail lamp with open/short LED monitoring, and a fog lamp with cornering function certified to UN-ECE F3. — [MarkLines Lumax profile](https://www.marklines.com/en/top500/lumax-industries)

**Named vehicle programmes** [LUMAX]
- **Maruti Suzuki**
  - Conventional lamp sets for its "high-volume hatchback and sedan models" (FY18).
  - Complete lighting system for the new Swift and spot lamps for the Grand Vitara (FY24–25).
  - Lighting for the e Vitara, "Maruti's first EV – ADB launch" (FY26 onward).
  - Source: [LIL Q2FY27 Investor Presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)
- **Exhibited parts**: Mahindra BE 6 Bi-LED headlamp with micro-projector high-beam booster, Suzuki e VITARA ADB headlamp, Maruti Victoris top DRL with rectangular projector, Tata Nexon front fog lamp, Nissan Magnite rear lamp and Honda Activa e headlamp with logo illumination (all 2025 exhibits). Mahindra Bolero headlamp with DRL (2020). — [MarkLines Lumax profile](https://www.marklines.com/en/top500/lumax-industries)
- **Mahindra Scorpio-N**: headlamp, rear lamp, fog lamp, reverse lamp and HMSL (business win reported Aug 2022). — [MarkLines news 16 Aug 2022](https://www.marklines.com/en/news/274204)
- **LED headlamps**: for TVS Jupiter and Hero Xtreme 160, plus a tail lamp for the Citroën Basalt (launches reported Aug 2024). — [MarkLines news 12 Aug 2024](https://www.marklines.com/en/news/312816)
- **Honda 2W**: single-source win for the Honda Activa and Shine models in FY26, "driven by LED specification". — [LIL Annual Report 2025-26](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)
- **Q1 FY27 launches**: Tata Tiago head lamp, Skoda/VW Taigun rear lamp, Suzuki Burgman Street front turn signal lamp and Force Traveller 2 head lamp. — [LIL Q1FY27 Investor Release, 8 Aug 2026](https://www.lumaxworld.in/lumaxindustries/pdf/pressrelease.pdf)
- **Mahindra supplier awards 2026**: Special Appreciation Awards for the XUV 7XO and for the UDO Electric 3W. — [LIL Q2FY27 Investor Presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)

**Plants (product and customer focus where public)** [LUMAX]
- There are 12 plants, including the SL Lumax associate:
  - Haryana: Dharuhera, Bawal, Bawal Electronics Facility
  - Maharashtra: Chakan II, Chakan III, Chinchwad
  - Uttarakhand: Pantnagar, Haridwar
  - Gujarat: Sanand, Sanand II
  - Karnataka: Bengaluru
  - Tamil Nadu: Sriperumbudur (SL Lumax, mainly for Hyundai India)
  - R&D is at Gurugram and Pune. Design centres are in Taiwan and the Czech Republic (LETC).
  - Source: [LIL Q2FY27 Investor Presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)
- New capacity:
  - Chakan Phase 2 was commercialised in FY26 and "adds highly automated capacity for advanced LED assemblies" for Tata Motors and SAVW.
  - Sanand 2 was operational from Q1 FY26 for Maruti Suzuki's Sanand operations.
  - A new Bengaluru (Bidadi) greenfield plant costs INR 140 Cr, is due to be commissioned by Q4 FY2026-27, and will serve MSIL and Toyota Kirloskar orders.
  - Capacity utilisation is 70–80%.
  - Source: [LIL Annual Report 2025-26](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)
- Plant founding customers: Pantnagar was set up in 2008 for Tata Motors, Haridwar in 2010 for Hero MotoCorp, and Gurgaon began in 1985–87 for Maruti Suzuki. — [MarkLines Lumax profile](https://www.marklines.com/en/top500/lumax-industries)
- The Gurgaon plant's specialty (2008) was 2W headlamps, "mainly for Hero Honda motorcycles". — [ABB case study, Nov 2008](https://library.e.abb.com/public/a265c301709c4135ad81f25edac6c82c/Lumax_casestudy_en_lr.pdf)
- Plant counts disagree between sources:
  - The investor presentation (Oct 2026) and the annual report both say 12 plants, including SL Lumax.
  - The JIPM Dharuhera profile says "15 manufacturing plants", apparently including Bhiwadi and extra Pune and Uttarakhand units.
  - The JIPM Bawal profile says 12 and still lists Gurugram.
  - The business-overview web page lists 9 units, including Gurgaon.
  - Sources: [JIPM Dharuhera](https://jipmglobal.com/tpm/wp-content/uploads/25037-Company-profile.pdf); [JIPM Bawal](https://jipmglobal.com/tpm/wp-content/uploads/25031CO-COMPANY-PROFILE.pdf); [Lumax business overview page](https://www.lumaxworld.in/lumaxindustries/business-overview.html)

**Scale** [LUMAX]
- FY26 workforce: permanent 3,236 and contract 5,084. — [LIL Annual Report 2025-26](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)
- The website claims a market share above 60% in Indian auto lighting and a workforce of "over 7,000". — [Lumax Industries website](https://www.lumaxworld.in/lumaxindustries/)
- Stanley Electric holds 37.5% of LIL. SL Corporation holds 21.28% of SL Lumax (FY26 revenue INR 2,933 Cr). — [LIL Q2FY27 Investor Presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)

### Inferences
- About two-thirds of value is front lighting and most new business is LED. A realistic 2026 plant model should therefore make LED headlamps (projector or reflector modules on PCBs) and LED rear combination lamps the main products, with halogen and conventional lamps as a shrinking legacy stream. That stream is still about 37–39% of revenue, so it is not negligible.
- 2W lamps are high-volume, smaller units, mostly Hero, Honda 2W, TVS and Suzuki Motorcycle. A 2W stream should have much shorter takts than 4W (see Section 2).
- "Moulds revenue" suggests customer-funded tooling is a material, separately billed activity. This is inferred from the P&L line, not from a stated in-house tool shop.

### Gaps
- I found no public list of number-plate lamps or auxiliary/work lamps by model. They appear only as generic categories ("auxiliary lamps" on MarkLines).
- I found no plant-by-plant mapping of products and customers for Chakan II/III, Chinchwad, Sanand, Pantnagar or Haridwar beyond the founding customers above.
- Lumax's own website has no dedicated product catalogue pages. The product range comes from annual reports, presentations and MarkLines.

---

## 2. End-to-end manufacturing process for headlamps and tail lamps (halogen and LED), with cycle times

### Takeaway
LIL plants run three core process blocks: moulding (including 2K/3K), surface treatment (vacuum metallising, plus painting, annealing and coating), and assembly (hot plate, vibration or ultrasonic welding, hot-melt sealing and gluing, automatic bead laying). A separate SMT electronics plant at Bawal makes LED PCBs. Public Lumax cycle-time data is thin. One older benchmark is a 2W headlamp assembly cycle of about 12–16 s, or 300–345 lamps per hour. Industry sources give the other step times:
- hot plate welding 40–60 s against 20–25 s for laser
- batch metallising 20–25 min, or under 35 s on inline sputter machines
- thermal hard-coat cure 30 min at about 130 °C
- thick projector-lens moulding up to 15–20 min
- leak test about 30 s hold at up to 30 mbar

### Cited Findings
**Lumax process blocks and plant metrics (Lumax-specific)**
- [LUMAX] Dharuhera's "Key Manufacturing Processes" are moulding, surface treatment (metalizing) and assembly. Its equipment includes "automatic bead laying, ultrasonic welding, hot melt sealing and hot plate sealing". — [JIPM Dharuhera profile](https://jipmglobal.com/tpm/wp-content/uploads/25037-Company-profile.pdf)
- [LUMAX] Lumax facilities have "Electic [electric] machine, 2K molding machines, metallising facility along with vibration, hot plate & ultrasonic welding, hot melt sealing etc." — [JIPM Bawal profile](https://jipmglobal.com/tpm/wp-content/uploads/25031CO-COMPANY-PROFILE.pdf)
- [LUMAX] During FY26 LIL "expanded its advanced 2k/3k injection moulding capabilities" for larger and more complex lamps. — [LIL Annual Report 2025-26](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)
- [LUMAX] FY26 energy and waste initiatives show which processes are in use:
  - "IE-4 class motors in annealing ovens"
  - "Servo motors in moulding machines" and hydraulic systems converted to servo motors
  - "BMC waste reduction through material substitution", which shows BMC (bulk moulding compound) parts such as reflectors are moulded
  - "Reduction of paint sludge generation", which shows a paint shop
  - Source: [LIL Annual Report 2025-26](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)
- [LUMAX] In 2010 Lumax used "multiple shots – multiple colours" moulding for tail-lamp lenses without joints and was investing in "1,300 tonne and 1,500 tonne injection moulding machines" and surface treatment. — [Autocar Professional, 28 Oct 2010](https://www.autocarpro.in/news-national/lumax-technology-drive-growth-711)
- [LUMAX] Assembly cycle benchmark (Gurgaon, 2008):
  - An ABB IRB 140 hot-melt glues "the lens and the reflector" of 2W headlamps, and the rest of the unit is assembled manually.
  - Manual output is 300 headlamps per hour against 345 per hour with the robot.
  - The manual cycle is "about 16 seconds – four seconds slower than with robotic production".
  - One operator oversees the cell. ROI payback is 39 months per robot.
  - Source: [ABB case study, Nov 2008](https://library.e.abb.com/public/a265c301709c4135ad81f25edac6c82c/Lumax_casestudy_en_lr.pdf)
- [LUMAX] A light-blade part (clear PC Makrolon LED2245, about 448 × 225 × 27 mm, 1.5–7.0 mm wall) showed weld lines and air traps with two gates. Moldflow simulation led to a single-gate design that removed them and reduced material and mould size. — [Autodesk case study, 2022](https://damassets.autodesk.net/content/dam/autodesk/www/pdfs/autodesk-lumax-industries-ltd-case-study-ver-1.pdf)
- [LUMAX] Dharuhera has an "ESD Head lamp synchronous process with a reduced manufacturing lead time", and its JIPM manufacturing principles include "100% Poka Yoke", "100% FIFO in all storage systems" and "100% automated material handling system". — [JIPM Dharuhera profile](https://jipmglobal.com/tpm/wp-content/uploads/25037-Company-profile.pdf)
- [LUMAX] The Bawal Electronics plant runs "SMT lines of imported machines", is about 90% automated, and (in 2022) planned to add one SMT line each year for four years. Its PCBs are shipped to other Lumax plants for integration. — [Mobility Outlook, 11 Apr 2022](https://www.mobilityoutlook.com/features/inr-100-crore-investment-lumax-groups-bet-on-manufacturing-electronic-components/)
- [LUMAX] An MES has been implemented at the Bawal SMT Electronics plant for end-to-end traceability and real-time monitoring. — [LIL Annual Report 2025-26](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)

**Plant capacity, OEE and stop data (Lumax-specific, for simulation calibration)**

| Metric | Bawal (4W) | Dharuhera (4W + 2W) |
|---|---|---|
| Capacity | 0.75M vehicle sets/yr at start (2012), now 1.2M vehicle lamp sets/yr (FY25-26), 80% utilised | 1.4M 4W sets/yr and 4.2M 2W sets/yr |
| Employees | 858 | 1,390 |
| Area | 42,900 m² (30,300 m² covered) | 44,000 m² (26,163 m² covered) |
| Sales | not stated | INR 5,360 million (FY24-25) |
| Production start | 2012 | April 1998 |
| OEE | 86.2% (2024-25 actual) | 85.5% (2025) |
| Availability | 97.2% | 93.5% |
| Performance rate | 95.9% | 93.8% |
| Quality rate | 92.5% | 97.5% |
| Breakdowns per year | 52 | 420 |
| MTBF | 536.6 days | 245 days |
| MTTR | 59 (unit given as "Hour") | 27 minutes |
| In-line scrap | 2.8% of sales | 1.65% |
| Productivity | 10.5 parts per operator-hour | 24.3 parts per operator-hour (assembly) |
| Production lead time | 3.18 days | 2.5 days (headlamp) |
| Delivery performance | 100% | 100% |
| Customer complaints per year | 11 | 2 |
| Conversion cost | not stated | 11.1% of sales |
| New models | not stated | 28 added since TPM began |

- Bawal source: [JIPM Bawal profile](https://jipmglobal.com/tpm/wp-content/uploads/25031CO-COMPANY-PROFILE.pdf). Dharuhera source: [JIPM Dharuhera profile](https://jipmglobal.com/tpm/wp-content/uploads/25037-Company-profile.pdf)
- [LUMAX] Group-level capacity utilisation across plants is 70–80%. — [LIL Annual Report 2025-26](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)

**Injection moulding of lenses, housings, reflectors and multi-colour lenses (industry-typical)**
- [INDUSTRY] Headlamp collimator and projector lenses usually have walls "between 15 and 30 mm (or more)".
  - Cooling time "increases by the square of the wall thickness".
  - Single-layer moulding gives "cycle times of up to 15 or even 20 minutes".
  - Sink marks must be under 20 µm.
  - Covestro promotes multi-layer moulding to cut this time.
  - Source: [Covestro optics article](https://solutions.covestro.com/en/highlights/articles/theme/processing-technology/optics)
- [INDUSTRY] Tail-lamp optics are mainly "amorphous transparent plastics of the PMMA or PC type". — [US7722196 patent](https://patents.google.com/patent/US7722196)
- [INDUSTRY] Multi-colour tail-lamp lenses are made either by transferring a first shot between tools or machines, or by multi-shot moulding with a rotary platen. A dual-shot vendor notes that a servo rotary platen improves colour-boundary accuracy and that an extra injection unit allows three-colour moulding. — [Huarong dual-shot lamp lens line](https://www.huarong.com.tw/page/news/en/company_news/detail/187/)
- [INDUSTRY] Indian peer Fiem Industries runs "over 450 injection moulding machines across six plants", about 50–1,400 t. — [Machinist, 3 Jun 2025](https://machinist.in/?p=3982)
- [INDUSTRY] A US Tier-2 lens moulder (Hardcoat Technologies) runs 10 Haitian machines (ZE, JU and MA series) for PC headlamp, driving and fog lenses with thermal-cure silicone hardcoat, and reports "less than 2% scrap". — [Haitian newsroom](https://eu.newsroom.haitian.com/?p=77208)

**Hard coating of PC lenses (industry-typical)**
- [INDUSTRY] Thermal siloxane hardcoat (Momentive SilFORT PHC587):
  - applied by spray, flow or dip at 25–55% relative humidity
  - flash-off 5–30 min at 20–30 °C
  - cure 126–130 °C for 30 minutes
  - film 6–12 µm
  - the cure temperature must stay below the PC grade's annealing limit
  - Source: [Momentive SilFORT PHC587 TDS](https://www.momentive.com/docs/default-source/tds/silfort/silfort-phc587_tds.pdf) (figures from search-result extract; the TDS was not opened directly)
- [INDUSTRY] UV-cure hardcoats (for example Momentive UVHC5000K1, solvent-borne for PC headlamp lenses) are applied by spray, flow, dip or roller. — [Momentive UVHC5000K1](https://www.momentive.com/en-us/product-categories/formulated-products/coatings/protective-and-functional-coatings/uv-cured-hardcoats/silfort-UVHC5000K1)
- [INDUSTRY] UV clearcoats held "over 80% of the lens market" (2003–04).
  - Typical film build is "10µm or less".
  - The sequence is application, ambient flash, heated flash, then UV cure.
  - Coatings need "1µm absolute" filtration and particulate-free air.
  - Validation uses Xenon-arc and 3-year Florida/Arizona weathering, steel-wool scratch and hot water soak.
  - Source: [Red Spot / Products Finishing, Apr 2004](https://www.pfonline.com/articles/uv-curable-basecoats-and-clearcoats-for-automotive-lighting)
- [INDUSTRY] Whelen's hardcoat line uses robotic spray, an IR oven (to 160 °F) and a UV lamp oven, about "15 minutes per lens" end to end. — [Whelen hard-coating process](https://www.whelen.com/newsroom/article/how-the-whelen-hard-coating-process-works) (from search-result extract)
- [INDUSTRY] UK lamp maker Wipac hard-coats outer lenses "in our clean room facility with annealing, robot handling and UV-curing directly linked to the injection moulding plant". It also vacuum metallises in-house, and its bonding options include laser, vibration, ultrasonic and IR welding plus adhesive. — [BPF directory: Wipac](https://www.bpf.co.uk/directory/wipac_102484.aspx) (from search-result extract)

**Vacuum metallisation of reflectors and bezels (industry-typical)**
- [INDUSTRY] UV basecoats hold "over 90% of the reflector/extension market". A basecoat is applied to BMC or PET/PBT reflectors to give a smooth, high-gloss surface for vacuum aluminium, and a protective topcoat follows (a "sandwich"). Flowcoat basecoats reach good coverage at 15–20 µm. — [Red Spot / Products Finishing, Apr 2004](https://www.pfonline.com/articles/uv-curable-basecoats-and-clearcoats-for-automotive-lighting)
- [INDUSTRY] The Bühler AluMet batch evaporation metallizer deposits "a highly reflective aluminum layer, plus a protective top coat" on a typical car-lamp reflector in 20–25 minutes. — [Bühler AluMet](https://buhlergroup.com/global/en/products/alumet_vacuum_evaporationmetalizer.html)
- [INDUSTRY] The Bühler Leybold Optics DynaMet 4V (vertical inline, rotary carrier, magnetron sputter plus PECVD top coat) is claimed to coat a car-lamp reflector with aluminium and top coat in "less than 35 s". This is a vendor claim. The page returned 403 when fetched, so the figure comes from a search extract and the exact page ID is unverified. — [DirectIndustry: Bühler Leybold Optics](https://www.directindustry.com/prod/buehler-leybold-optics/product-36157-567585.html)
- [INDUSTRY] A University of Ljubljana thesis describes metallising as the second stage of headlamp manufacture (vapour deposition or sputtering). It says poor adhesion usually traces to "poor plasma activation process or bad preparation of the workpiece surface". — [Univ. of Ljubljana repository](https://repozitorij.uni-lj.si/IzpisGradiva.php?id=82769) (from search-result extract)

**SMT assembly of LED PCBs (industry-typical)**
- [INDUSTRY] Vendor descriptions of automotive LED metal-core PCB (MCPCB) lines give the sequence:
  - stencil print (0.12–0.15 mm stencils on MCPCB pads)
  - 3D SPI
  - high-speed pick-and-place
  - nitrogen reflow (below 1000 ppm O₂)
  - AOI, with X-ray for hidden or power-LED joints (void target 5% or less)
  - IATF 16949 / IPC-A-610 practice
  - These are marketing sources, not benchmarks. — [BestPCBs automotive lighting PCB posts](https://www.bestpcbs.com/blog/tag/automotive-lighting-pcb-manufacturing/)

**Lens-to-housing joining (industry-typical)**
- [INDUSTRY] Typical lamp welding cycles are "20 to 25 sec." for laser and "40 sec. to 1 min., depending on the shape of the lamp" for hot plate, so hot plate needs about twice the equipment for the same volume.
  - Hot-plate weld depth is "typically 1.5 mm and more", against about 0.5 mm for laser.
  - Hot-plate defects are excessive flash, fuming from the platens and stringing as the part retracts.
  - A laser setup has a transparent lens and an absorptive housing. Hot-plate machines move on 3 axes; laser machines on 1.
  - Source: [Machine Design / Emerson, 22 May 2024](https://www.machinedesign.com/fastening-joining/article/55041926/emerson-technology-comparison-laser-welding-vs-hot-plate-welding-in-automotive-lighting)

**Leak test, aiming, photometry and end-of-line test (industry-typical)**
- [INDUSTRY] A Mercedes-Benz headlamp leak-test bulletin (service, not production EOL) applies "a maximum of 30 mbar overpressure". Above 50 mbar the seal is damaged. A drop of more than 10 mbar within 30 seconds means the lamp is leaky; less means natural fogging. — [Mercedes-Benz TSB via NHTSA, Sep 2024](https://static.nhtsa.gov/odi/tsbs/2024/MC-11007974-0001.pdf)
- [INDUSTRY] Headlamp EOL test platforms include module photometric EOL stations, headlamp photometric EOL stations and aiming/pre-aiming stations. They fit "at various stages" from light source to finished lamp and measure intensity, low-beam cutoff sharpness, relative colour and beam angle. — [Averna headlamp test platform](https://www.averna.com/en/products/platforms/headlamp-test-platform)
- [INDUSTRY] FMVSS 108 defines the aiming reference plane (tangent to the forwardmost aiming pad) and the lamp axis of reference (H=0°, V=0°) used for photometric angles. — [49 CFR 571.108 (2017)](https://www.govinfo.gov/content/pkg/CFR-2017-title49-vol6/pdf/CFR-2017-title49-vol6-sec571-108.pdf)

### Inferences
**Suggested simulation routing.** This combines the Lumax process blocks above with industry step times. Numbers are indicative, not Lumax-measured.

1. **Moulding cells (one per part family)**
   - Lens: PC for headlamps, PMMA or PC 2K/3K for tail lamps.
   - Housing.
   - BMC reflector (thermoset).
   - Bezel and extension (thermoplastic).
   - Thick projector/collimator lens: very long cycles, up to 15–20 min in single layer, needing multi-cavity or multi-layer tools.
   - Use the Lumax 1,300–1,500 t presses for large 4W lenses and housings, and Fiem's 50–1,400 t range as an Indian sizing reference.
2. **Annealing oven**: Lumax has annealing ovens. Lenses are likely annealed before hard coat.
3. **Hard-coat line**: clean room, flow or spray, flash, then cure. Thermal cure is about 30 min at about 130 °C plus 5–30 min flash; UV cure takes seconds after a heated flash. Model it as a continuous conveyor with a rack or jig pitch, with a WIP time of about 15–60 min.
4. **Basecoat (UV) and vacuum metallizer (batch, 20–25 min per load) with top coat** for reflectors, extensions and bezels. Optionally a paint booth (Lumax has paint sludge), for example for black-out masks or coloured bezels.
5. **SMT line at Bawal Electronics** (print, SPI, place, reflow, AOI, then depanel and ICT/functional test). It feeds LED modules to the assembly plants with days of transit buffer, because PCBs are shipped between plants.
6. **Lamp assembly line** (manual or semi-automatic):
   - bulb holder or LED module and heat sink
   - wiring and connector
   - reflector or projector fit
   - inner lens and light guides
   - hot-melt bead or gluing (robot), or hot plate, vibration or ultrasonic welding of lens to housing
   - Use a 2W takt of about 10–16 s per lamp (ABB 2008 benchmark). For 4W, the 40–60 s hot-plate cycle points to parallel welders or multi-lamp fixtures.
7. **Leak test station**: about 30 s pressure-decay hold at 30 mbar or less, a pass/fail threshold, and rework (re-seal) or scrap on a leak.
8. **Aiming / pre-aim and photometric EOL**, then electrical function test (LED open/short, DRL/turn/animation sequence), visual inspection and packing.

**Calibrating stops and losses from the Lumax plant data**
- OEE about 85–86%.
- Availability 93.5–97.2%: about 3–6.5% time lost to breakdowns and setups.
- MTTR about 27 min (Dharuhera). The Bawal "59 hours" figure looks like a unit error, or downtime totals rather than per event.
- Dharuhera's 420 breakdowns per year across the plant equals about 1.2 per day.
- Scrap 1.65–2.8%.
- Quality rate 92.5–97.5% (first pass, including rework).
- WIP lead time 2.5–3.2 days.

**Daily volumes**
- Assuming about 300 working days per year (my assumption), Dharuhera's capacity equals about 4,700 4W lamp sets and about 14,000 2W sets per day.
- Bawal's 1.2M sets at 80% utilisation equals about 3,200 sets per day.

### Gaps
- No Lumax-published cycle times for moulding (by part), metallising, hard coating, welding, leak test, aiming or EOL test. Only the 2008 ABB 2W assembly cycle (12–16 s) is public.
- No public count of injection moulding machines, metallizers, hard-coat lines or SMT lines per Lumax plant. The 2022 plan was one new SMT line per year at Bawal, with no line count.
- No source fetched for typical housing resins (PP-talc, ABS, PC-ABS, PBT-ASA) or bezel materials, or for typical 4W headlamp line takt or EOL test times. Production leak-test setpoints were not found either; the Mercedes figures are for service diagnosis.
- I did not find a reliable independent source for hard-coat and metallizer line layouts such as rack density, chamber size or loads per hour.

---

## 3. Machines and brands used by Lumax (and what is typical in Indian lamp plants)

### Takeaway
Few brands are public for Lumax. The documented ones are ABB robots (28 IRB 140 and IRB 1410 by 2008, for hot-melt gluing), earlier robots from Stanley Electric and Vaccutek Automation (Taiwan), and Autodesk Moldflow, Dassault 3DEXPERIENCE PLM, SAP MRP and an MES at Bawal SMT. No public source names Lumax's injection moulding machine, metallizer, hard-coat, welder, SMT, aiming or goniophotometer brands. Only machine types are public: electric, servo and 2K/3K presses, metallising, vibration, hot plate and ultrasonic welders, hot-melt sealing, automatic bead laying, imported SMT lines.

### Cited Findings
- [LUMAX] Robots:
  - Lumax's first robots came in the 1990s: "six robots from its Japanese joint venture partner, Stanley Electric".
  - Between 1998 and 2005 it bought "six robots from Vaccutek Automation Inc, Taiwan".
  - From about 2006 it bought from ABB, a "total of 28 robots, both IRB 140 and IRB1410", with three more 6-axis robots under discussion in 2008.
  - The main application was hot-melt gluing of headlamp parts. ABB service came from Faridabad.
  - Source: [ABB case study, Nov 2008](https://library.e.abb.com/public/a265c301709c4135ad81f25edac6c82c/Lumax_casestudy_en_lr.pdf)
- [LUMAX] Machine types (no brands): "Electic machine, 2K molding machines, metallising facility along with vibration, hot plate & ultrasonic welding, hot melt sealing". — [JIPM Bawal profile](https://jipmglobal.com/tpm/wp-content/uploads/25031CO-COMPANY-PROFILE.pdf)
- [LUMAX] Dharuhera equipment: "automatic bead laying, ultrasonic welding, hot melt sealing and hot plate sealing". — [JIPM Dharuhera profile](https://jipmglobal.com/tpm/wp-content/uploads/25037-Company-profile.pdf)
- [LUMAX] Moulding machines have been retrofitted with servo motors and hydraulic systems converted to servo. Annealing ovens use IE-4 motors. 2K/3K moulding capability was expanded in FY26. — [LIL Annual Report 2025-26](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)
- [LUMAX] 1,300 t and 1,500 t injection moulding machines (2010 investment). — [Autocar Professional, 28 Oct 2010](https://www.autocarpro.in/news-national/lumax-technology-drive-growth-711)
- [LUMAX] Bawal Electronics: "SMT lines of imported machines", about 90% automated, INR 100 Cr investment (2022). Workers are diploma holders trained at the in-house "Gurukul" school. — [Mobility Outlook, 11 Apr 2022](https://www.mobilityoutlook.com/features/inr-100-crore-investment-lumax-groups-bet-on-manufacturing-electronic-components/)
- [LUMAX] Software and systems:
  - MES at the Bawal SMT plant
  - SAP MRP for imported material
  - Dassault Systèmes 3DEXPERIENCE PLM
  - an iLEDX digital twin framework
  - a DOJO 2.0 operator-training pilot on select machines
  - Source: [LIL Annual Report 2025-26](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)
- [LUMAX] Autodesk Moldflow is used for gate and runner optimisation of clear parts. — [Autodesk case study, 2022](https://damassets.autodesk.net/content/dam/autodesk/www/pdfs/autodesk-lumax-industries-ltd-case-study-ver-1.pdf)
- [LUMAX] LETC (Czech Republic) is being equipped for "PCB assembly, electronic driver production, and EMI/EMC pre-compliance testing". — [LIL Annual Report 2025-26](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)
- [LUMAX] Visible job postings name processes and materials but no machine brands:
  - "Senior Engineer - Moulding" at Bawal
  - "Senior Engineer - Tool Room" at Bengaluru (injection mould maintenance; lathe, milling, drilling and surface grinding)
  - "Tool Development" manager at Dharuhera (develop and review mould designs)
  - "Vendor Development" for "SMT consumables" and "PCBs, PCBAs"
  - Source: [beBee Lumax Industries jobs](https://bebee.com/in/companies/lumax-industries/jobs)
- [INDUSTRY] Indian peer context:
  - Fiem runs 450+ moulding machines of 50–1,400 t across six plants, with no brands disclosed. — [Machinist, 3 Jun 2025](https://machinist.in/?p=3982)
  - Varroc lists "High Vacuum Metallizing, Hard Coating and UV curing, and 2k and 3k Moulding" as lighting capabilities, but at its non-India plants (Italy, Romania, Vietnam). — [Varroc presentation](https://www.varroc.com/upload/financial_results/176423732944033479.pdf) (from search-result extract)
- [INDUSTRY] Vendor examples:
  - Metallizers: Bühler (Leybold Optics) AluMet batch and DynaMet inline. — [Bühler AluMet](https://buhlergroup.com/global/en/products/alumet_vacuum_evaporationmetalizer.html)
  - Welding: Emerson/Branson laser and hot-plate lamp welders. — [Machine Design / Emerson](https://www.machinedesign.com/fastening-joining/article/55041926/emerson-technology-comparison-laser-welding-vs-hot-plate-welding-in-automotive-lighting)
  - EOL test: Averna photometric and aiming stations. — [Averna](https://www.averna.com/en/products/platforms/headlamp-test-platform)
  - Moulding: Haitian lens-moulding machines. — [Haitian newsroom](https://eu.newsroom.haitian.com/?p=77208)
  - None of these is confirmed at Lumax.

### Inferences
- Stanley Electric is Lumax's technology partner and owns 37.5%. Robots from Stanley and Japanese process know-how suggest Japanese equipment practice, but no document confirms Japanese moulding-machine brands at Lumax, so a simulation should label machine brands as generic ("IMM 1,300 t", "batch metallizer").
- A mix of hot plate, vibration and ultrasonic welding, hot-melt sealing and robotic bead laying (rather than laser welding) suggests the older, longer-cycle joining methods are still widespread at Lumax. No laser welding is mentioned in any Lumax source found.

### Gaps
- No public evidence of Lumax's brands for injection moulding machines (Engel, KraussMaffei, Toshiba, JSW, Milacron/Ferromatik, Haitian), metallizers (Leybold/Bühler or others), hard-coat lines, welders (Bielomatik, Branson, Frimo), SMT lines (Fuji, Panasonic, Yamaha, ASM), aiming machines or goniophotometers. Targeted searches turned up nothing.
- No Lumax factory-tour video or plant-visit article with equipment detail was found. The 2017 Pantnagar industrial training report on SlideShare would not load.

---

## 4. Tool room and mould manufacturing

### Takeaway
Lumax clearly does mould development and engineering and sells moulds to customers (INR 104.9 Cr of mould revenue in H1 FY27). Its plants have tool rooms for mould maintenance and trials. I found no public evidence of an in-house mould-making shop with CNC, EDM or wire-cut, and no published mould size or tonnage list beyond the 1,300–1,500 t presses.

### Cited Findings
- [LUMAX] Standalone P&L shows "Moulds Revenue" separately: INR 41.5 Cr in Q2 FY27 and INR 104.9 Cr in H1 FY27. Customer-wise sales charts "exclude mould sales". — [LIL Q2FY27 Investor Presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)
- [LUMAX] Job roles:
  - Bengaluru "Senior Engineer - Tool Room": injection mould maintenance; "convention machining process Lathe, Milling, Drilling/Surface Grinding"; mould assembly and disassembly.
  - Dharuhera "Asst. Manager/Deputy Manager (Tool Development)": "Develop and review mould designs" and "own the mould development process".
  - Source: [beBee Lumax Industries jobs](https://bebee.com/in/companies/lumax-industries/jobs)
- [LUMAX] A Naukri-sourced Lumax tool room engineer listing covers mould troubleshooting, maintenance and tool trials, and prefers candidates from automotive lighting. The location is not confirmed. — [beBee Lumax Industries jobs](https://bebee.com/in/companies/lumax-industries/jobs) (from search-result extract)
- [LUMAX] A Lumax "Mould flow Engineer" uses Moldflow in "product design and toolmaking to process engineering". — [Autodesk case study, 2022](https://damassets.autodesk.net/content/dam/autodesk/www/pdfs/autodesk-lumax-industries-ltd-case-study-ver-1.pdf)
- [LUMAX] Largest presses publicly mentioned: 1,300 t and 1,500 t (2010). — [Autocar Professional, 28 Oct 2010](https://www.autocarpro.in/news-national/lumax-technology-drive-growth-711)

### Inferences
- The pattern of mould design and development in-house (Dharuhera tool development, Moldflow, mould revenue billed to OEMs) alongside maintenance tool rooms with conventional machining suggests mould cavities are mostly built by outside toolmakers, possibly in Taiwan, China or Japan through the design centre and partners. This is an inference, not confirmed.
- For a simulation, model tool room activity as mould maintenance and tool change support with downtime events (part of the MTTR above), not as a mould-building shop.

### Gaps
- No source confirms or rules out in-house CNC, EDM or wire-cut mould making at LIL.
- No mould size, weight, cavity count or press-tonnage distribution per plant was found.

---

## 5. Quality: certifications, common lamp defects and causes, test labs

### Takeaway
The Lumax plants profiled (Bawal, Dharuhera) hold IATF 16949:2016, ISO 14001:2015 and ISO 45001:2018, and Bawal also holds ISO 50001. All plants are ISO 45001 certified and ISO 14001/45001 cover the major plants. Lumax runs TPM (14 JIPM awards across 8 plants), 100% poka-yoke and QCC. Key defects for a simulation are moulding defects on clear parts, metallising adhesion and iridescence, condensation and water ingress, and weld flash and stringing. No NABL-accredited Lumax photometry lab is publicly documented. Indian homologation photometry is done at ICAT, GARC and CIRT.

### Cited Findings
**Certifications and quality systems**
- [LUMAX] Bawal plant: "ISO-14001:2015, IATF 16949:2016, ISO 45001:2018, ISO 50001:2018 certified". — [JIPM Bawal profile](https://jipmglobal.com/tpm/wp-content/uploads/25031CO-COMPANY-PROFILE.pdf)
- [LUMAX] Dharuhera plant: "ISO-14001:2015, IATF 16949:2016, ISO 45001:2018 certified". — [JIPM Dharuhera profile](https://jipmglobal.com/tpm/wp-content/uploads/25037-Company-profile.pdf)
- [LUMAX] "All plants are ISO 45001 certified." ISO 50001 is held at the Bawal, Chakan II and Pantnagar units. The ESG roadmap targets ISO 14001 and 45001 in all plants and ISO 27001 at R&D. — [LIL Annual Report 2025-26](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf); [LIL Q2FY27 Investor Presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)
- [LUMAX] TPM: "a total of 14 JIPM Awards were achieved in 8 Plants". JIPM TPM awards have gone to Bawal, Dharuhera, Pantnagar, Bengaluru and Chakan III. — [JIPM Bawal profile](https://jipmglobal.com/tpm/wp-content/uploads/25031CO-COMPANY-PROFILE.pdf); [LIL Q2FY27 Investor Presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf)
- [LUMAX] Quality-related customer awards include Toyota Kirloskar "Zero Defect Supplies" (Bengaluru, 2020), Maruti and Tata supplier awards, and (Dharuhera) SMG "1000/1000 marks" and an HMSI smooth launch award (2024). — [Lumax overview page](https://www.lumaxworld.in/lumaxindustries/overview.html); [JIPM Dharuhera profile](https://jipmglobal.com/tpm/wp-content/uploads/25037-Company-profile.pdf)
- [LUMAX] An older stock-information profile (search extract) says Lumax obtained ISO/TS 16949:2002 and ISO 14001 in 2003. — [Investyadnya Lumax profile](https://investyadnya.in/stock-o-meter/lumax-industries)

**Common defects and causes**
- [LUMAX] Clear-part moulding defects named by Lumax's Moldflow engineer: "Weld lines, Air traps, yellowing, and Air Bubble". Wrong gating causes "diminished appearance, subpar weld line, elevated shear stress, and air traps". — [Autodesk case study, 2022](https://damassets.autodesk.net/content/dam/autodesk/www/pdfs/autodesk-lumax-industries-ltd-case-study-ver-1.pdf)
- [LUMAX] Customer complaints per year: Bawal 11 (2024-25), Dharuhera 2 (2025). Scrap: Bawal 2.8%, Dharuhera 1.65%. — [JIPM Bawal](https://jipmglobal.com/tpm/wp-content/uploads/25031CO-COMPANY-PROFILE.pdf); [JIPM Dharuhera](https://jipmglobal.com/tpm/wp-content/uploads/25037-Company-profile.pdf)
- [INDUSTRY] Hot-plate welding defects: excessive flash, fuming and stringing. Material sticking to the hot tool causes cosmetic issues. — [Machine Design / Emerson, 2024](https://www.machinedesign.com/fastening-joining/article/55041926/emerson-technology-comparison-laser-welding-vs-hot-plate-welding-in-automotive-lighting)
- [INDUSTRY] Metallising and basecoat defects on BMC reflectors:
  - Iridescence is prevented by "avoiding microfine gas emissions from the paint film".
  - Resin outgassing can cause "pin holes, delaminations, wrinkles".
  - "Mapping" is a flow-coat defect.
  - Basecoats must survive heat without hazing, blistering or adhesion loss (for example 350 °F for 2 h in one formulation).
  - Sources: [US5256446](https://patents.google.com/patent/US5256446); [US5493483](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5493483); [US6146002](https://patents.google.com/patent/US6146002) (from search-result extracts; which defect statement belongs to which patent is not verified)
- [INDUSTRY] Metallising adhesion failures usually come from poor plasma activation or bad surface preparation. — [Univ. of Ljubljana repository](https://repozitorij.uni-lj.si/IzpisGradiva.php?id=82769)
- [INDUSTRY] Coating defects include runs and sags in spray, haze, and cracking under heat or cycling for chrome finishes. Moulding defects and airborne dirt are visible on optics. — [Red Spot / Products Finishing, 2004](https://www.pfonline.com/articles/uv-curable-basecoats-and-clearcoats-for-automotive-lighting)
- [INDUSTRY] Fogging and condensation:
  - Moisture enters through the vent, and condensation forms at the coldest spot as the dew point rises.
  - Hydrophobic membrane vents let vapour diffuse while blocking liquid water, dust and insects.
  - Source: [Gore venting white paper](https://www.gore.com/system/files/2021-08/whitepaper-venting-solutions-for-clear-visibility.pdf)
- [INDUSTRY] OEMs distinguish "natural physical fogging" (acceptable) from leaks. The 30 mbar / 10 mbar-in-30 s pressure-decay check separates them. — [Mercedes-Benz TSB via NHTSA, 2024](https://static.nhtsa.gov/odi/tsbs/2024/MC-11007974-0001.pdf)

**Test labs**
- [LUMAX] LIL has "Two R&D centres in Gurugram and Pune". The Q2 FY27 presentation has a slide titled "In-house R&D and Validation Facility" (image only, no detail). FY26 R&D facility spending was INR 16.09 Cr at Chakan and Gurugram. LETC is adding EMI/EMC pre-compliance testing. — [LIL Q2FY27 Investor Presentation](https://www.lumaxworld.in/lumaxindustries/pdf/LIL-Q2FY27-investorPresentation.pdf); [LIL Annual Report 2025-26](https://www.lumaxworld.in/lumaxindustries/pdf/LIL_integrated_annual_report_2025_26.pdf)
- [LUMAX] In 2010 Lumax reported "upgraded labs with new equipment for testing lighting products". — [Autocar Professional, 2010](https://www.autocarpro.in/news-national/lumax-technology-drive-growth-711)
- [INDUSTRY] ICAT's photometry lab (Gurugram) is NABL-accredited to ISO/IEC 17025. CIRT (Pune) tests headlights, tail lights, indicators, reflectors, stop lights and plastic lenses. — [ICAT PHL manual](https://icat.in/wp-content/uploads/2022/12/PHL-MANUAL.pdf); [CIRT photometric lab](https://cirtindia.com/Lab_Photometric.html) (both from search-result extracts)

### Inferences
- For a simulation defect model, three groups of stations matter:
  - Moulding: weld lines, air traps and bubbles, sink marks, flash, scratches on clear PC/PMMA, yellowing. Scrap at source or after inspection.
  - Surface treatment: metallising iridescence, pinholes and peel, which trace back to basecoat and outgassing. Hard-coat runs, haze and dirt inclusions. These cause batch-level rejects.
  - Assembly: weld flash and stringing, leak-test failure (re-seal and retest loop), LED open/short at EOL, aim or photometry out of tolerance (re-aim loop), colour mismatch.
- Calibrate the overall loss to Lumax's 1.65–2.8% scrap and 92.5–97.5% quality rate.

### Gaps
- No public evidence that Lumax holds a NABL-accredited in-house photometry lab, or of its goniophotometer, environmental chamber, vibration, dust or water-spray test equipment.
- No public IATF certificates for plants other than Bawal and Dharuhera. Status at the others is likely but not confirmed in the sources found.
- No Lumax-specific defect Pareto (for example a share of water-ingress against metallising failures). I found no published production leak-test setpoints or aiming tolerances. ECE R112/R149, FMVSS 108 photometric tables and OEM specs would have them, but I did not extract them.
