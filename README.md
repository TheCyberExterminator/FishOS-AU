# FishOS-AU

A **free, single-file, offline-friendly fishing prediction app** for Australian anglers.
No backend. No paid APIs. No signup. Drop it on GitHub Pages and go.

**Live data:** Open-Meteo (weather + marine tides) with a **MET Norway backup** · OpenStreetMap (Leaflet tiles + Overpass spots) · moon, solunar & a fallback tide model computed locally in JavaScript.

---

## Files in this folder

| File | What it is |
|---|---|
| **`index.html`** | The entire app — one self-contained file. Open it or host it. |
| **`sw.js`** | Service worker for full offline / installable PWA (cache `v2`). |
| **`REVIEW.md`** | Brutal 4-persona product review (CEO / Customer / Investor / Founder) + ROI-ranked roadmap. |
| **`FISHING-SPOTS.md`** | Deep research: best spots Illawarra → Newcastle, with warm-water & current intel, cited sources. |
| **`RIG-GUIDE.md`** | Rig & knot setups by species and by location type. |

## Deploy to GitHub Pages
1. Put `index.html` and `sw.js` in a repo.
2. Settings → Pages → deploy from branch (root).
3. Open `https://<you>.github.io/<repo>/` — installable on mobile.

## Features
- Live fishing **score (0–100)** from solunar, wind, barometer, moon, weather & swell — *explained*, not a black box.
- Current conditions: wind (km/h **or knots**), weather, swell, moon, pressure, **live tide**, water temp, UV.
- **Today / dashboard** now carries the headline stuff up front: live **tide times + 48-hour tide chart**, a **5-day weather forecast** (icon, hi/lo, wind, rain %, bite score), best bite times and nearby spots.
- **Tides — live where there's coastal coverage** (Open-Meteo Marine `sea_level_height_msl`, FES2014): real High/Low **times + heights**, a 48-hour curve, and a lunar-model fallback inland (clearly labelled *live* vs *modelled*).
- **Best bite times** (solunar majors/minors + dawn/dusk) and **best day this week**.
- **10-species predictor** with live probability, bait, rig & tips.
- **113 curated NSW spots, Illawarra → Newcastle** with target species, *why it fires*, **top NSW baits** (pilchard, squid, prawns, worms, nippers…) and 🔥 warm-water / 🌊 current tags — plotted on the map alongside live OpenStreetMap ramps/jetties/beaches. **Search by name or species** ("Bundeena", "kingfish") and filter by region, with a live result count.
- **Catch log** (local, private) with auto conditions snapshot, PBs, stats, JSON export & share.
- **Resilient data layer:** every request has a timeout + retries; **automatic MET Norway backup** for weather/wind; **manual "Fetch now"** button and a **vendor switch** (Auto / Open-Meteo / MET) in Settings.
- **Dark / light / auto theme**, **back button** (works with Android/browser back), **saved spots**, **share**, **GPS**, **offline cache**, **PWA install**.

## Data sources & resilience
Each concern is its own independent module (fetched in parallel — one failing doesn't break the others):

| Module | Primary | Backup | Last resort |
|---|---|---|---|
| **Weather + wind** (`getForecast`) | Open-Meteo (free, no key) | **MET Norway** (free, no key) | cached last-good |
| **Tides** (`getTides`) | Open-Meteo Marine `sea_level_height_msl` (FES2014), dedicated request | — | **local lunar model** (always works, even fully offline) |
| **Swell / sea temp** (`getSwell`) | Open-Meteo Marine | — | omit (app still works) |
| Maps / spots | OpenStreetMap tiles + Overpass | curated 113-spot DB (offline) | — |

**Modular & parallel (v1.7):** the three concerns — **weather/wind**, **tides**, **swell** — are fetched as **independent modules in parallel** (`getForecast` / `getTides` / `getSwell`). Only weather/wind is a hard dependency (the score needs it); tides and swell fail independently, and tides always fall back to the local lunar model. Every request: 12 s timeout (AbortController) + 2 retries. A failed refresh shows an honest message with a **Retry** link; the **Fetch now** button forces a refresh any time; **Settings → Weather source** switches vendor; **Settings → Connection test** pings every endpoint and reports ✓/✗ + latency so you can spot a corporate-firewall block. *(Note: WillyWeather-style tide tables are paid/key-gated, so FishOS uses free, no-key sources plus the local model — tides therefore always render.)*

## Changelog
- **v1.7** — **Decoupled data layer:** weather+wind, **tides**, and swell are now **independent modules fetched in parallel** — one failing no longer breaks the others (tides have their own dedicated request + guaranteed lunar-model fallback). Added a **Connection test** (Settings) that pings every source so you can see exactly what a firewall/network is blocking, and a per-source status line ("· tide live / modelled · no swell").
- **v1.6** — **Spot search** on the Spots tab: filter 113 spots by name or species (e.g. "Bundeena", "kingfish") — combines with the region filter, shows a live result count, and a friendly empty state.
- **v1.5** — Manual **Fetch now** button + **vendor switch** (Auto / Open-Meteo / MET Norway); always-visible "updated / source" status bar.
- **v1.4** — **Resilience overhaul:** request timeouts + retries, automatic **MET Norway** weather/wind backup, marine sea-level fallback, out-of-order-response guard, honest failure UI (fixes the "stuck refreshing" hang).
- **v1.3** — **Spot database expanded 29 → 113** (Illawarra & South Coast, Royal NP & Port Hacking incl. Bundeena, Botany Bay & Georges River, Parramatta River incl. Meadowbank, Eastern Beaches, plus filled-out existing regions); **top NSW baits per spot**; **5-day weather forecast** + **48-hour tide times/chart** moved onto the main page; mobile layout tightened.
- **v1.2** — Light/dark/auto theme (follows system, pre-paint, no flash); **live tide predictions** via Open-Meteo Marine (FES2014) with real High/Low times + true tide curve, lunar-model fallback inland; in-app **back button** with full history/hardware-back support.
- **v1.1** — Top-10 ROI improvements: catch log, curated spot DB, saved spots, best-day planner, knots/units, offline cache, share, per-spot rigs, tide disclosure, onboarding. (See `REVIEW.md`.)
- **v1.0** — Initial release: weather/moon/solunar engine, dashboard, species, map, forecast.

## Honest limitations
- **Tides are predictions** (astronomical model) and don't include wind setup or storm surge — use for bite *timing*; check the **Bureau of Meteorology** before any low-tide rock/breakwall session. Inland/no-coverage spots fall back to a lunar model (labelled *modelled*).
- Curated spot **coordinates are approximate access points** for the weather marker, not exact fishing marks.
- **Parramatta River** (west of the Harbour Bridge) carries a dioxin dietary advisory — those spots are flagged **release only**.
- Power-station **warm-water canals are closed to fishing 6 pm–6 am, 1 May–31 Aug** — and these outlets are being decommissioned. Fish the open bays, obey signage.
- The **MET Norway backup** depends on the browser allowing the request (CORS); if it's ever blocked, the Open-Meteo retries + local tide model keep the app working.

*Safety beats the catch. Wear a PFD on rocks and in boats. Never turn your back on the sea.*
