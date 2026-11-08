# GeoSentinel — Source & Connector Registry

> **Compliance Requirement**: Section 3.1, Section 8, & Section 10 of the Master Autonomous Development Prompt.  
> **Rule**: Zero Paid Data Resources. Every enabled connector must have verified free-access conditions, permitted research/AI use, documented attribution, and active health checks. Any source with ambiguous or commercial-only restrictions is set to `DISABLED` (`LICENSE_CHECK` or `PAID_RESTRICTED`).

---

## Canonical Categories & Complete Connector Inventory (All 16 Implementations Reconciled)

| # | Canonical Category | Connector ID | Provider Name | Official API / Feed | Auth / Credential | Rate Limit & Policy | License / Terms | Live Status | Data Nature & Provenance |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **International Organizations** | `CONN_RELIEFWEB` | UN OCHA ReliefWeb API v2 | `https://api.reliefweb.int/v2/reports` | AppName parameter (`RELIEFWEB_APPNAME`) | 1000 req/day | CC-BY 4.0 / UN Open Access | **LIVE_DATA_VERIFIED** | Live & archived crisis reports; publication dates distinguish historical from current developments |
| 2 | **International Organizations** | `CONN_UN_SDG` | UN Statistics Division SDG API | `https://unstats.un.org/SDGAPI/v1` | None (Public Domain) | Throttled | Open Government / UN License | **LIVE_DATA_VERIFIED** | Multilateral development metrics & SDG targets |
| 3 | **News Intelligence** | `CONN_GDELT` | GDELT Project 2.0 DOC API | `https://api.gdeltproject.org/api/v2/doc/doc` | None (Public API) | Min 5s inter-request sleep (HTTP 429 backoff) | Open Research Use | **RATE_LIMITED / LIVE_DATA_VERIFIED** | Real-time news article intelligence with automated 5s throttle |
| 4 | **News Intelligence** | `CONN_NEWS` | United Nations News RSS Feed | `https://news.un.org/feed/subscribe/en/news/all/rss.xml` | None (Public RSS) | Standard web polling | Public Domain | **LIVE_DATA_VERIFIED** | Official UN humanitarian and diplomatic reporting |
| 5 | **Internet & Infrastructure** | `CONN_OONI` | Open Observatory of Network Interference (OONI) | `https://api.ooni.io/api/v1/measurements` | Custom User-Agent | Fair use | Open Data / CC0 | **LIVE_DATA_VERIFIED** | Network interference & censorship telemetry; measurements distinguish historical from active |
| 6 | **Internet & Infrastructure** | `CONN_IODA` | CAIDA / Georgia Tech IODA v2 | `https://api.ioda.inetintel.cc.gatech.edu/v2/outages/events` | None (Academic API) | Fair use | Academic Open Access | **LIVE_API + HISTORICAL_DATA** | Macro BGP & active ping outage events (>48h historical window) |
| 7 | **Geographic & Entities** | `CONN_WIKIDATA` | Wikidata Knowledge Base (SPARQL) | `https://query.wikidata.org/sparql` | Custom User-Agent Header | SPARQL server limits | CC0 Public Domain | **LIVE_DATA_VERIFIED** | Semantic entity graph & administrative hierarchies |
| 8 | **Geographic & Entities** | `CONN_NOMINATIM` | OpenStreetMap Nominatim Spatial API | `https://nominatim.openstreetmap.org/search` | Custom User-Agent Header | Strictly max 1 req/sec enforced | ODbL / OpenStreetMap | **LIVE_DATA_VERIFIED** | Geospatial bounding boxes & location coordinates |
| 9 | **Public Digital Signals** | `CONN_WIKIMEDIA` | Wikimedia Foundation REST API | `https://wikimedia.org/api/rest_v1/metrics/pageviews/` | Custom User-Agent Header | 100 req/sec | CC-BY-SA 3.0 | **LIVE_DATA_VERIFIED** | Daily aggregated digital attention volume (strictly non-sentiment) |
| 10 | **Economic & Financial Data** | `CONN_WORLDBANK` | World Bank Indicators API | `https://api.worldbank.org/v2/country/{iso}/indicator/{code}` | None (CC-BY 4.0) | Standard API rate limit | CC-BY 4.0 | **LIVE_DATA_VERIFIED** | Macro indicators; observation years preserved without artificial tick precision |
| 11 | **Economic & Financial Data** | `CONN_IMF` | International Monetary Fund Data API | `https://www.imf.org/external/datamapper/api/v1` | None (Public Access) | Fair use | Research with Attribution | **LIVE_DATA_VERIFIED** | WEO macroeconomic series; indicator vintage preserved |
| 12 | **Scientific & Disaster Data** | `CONN_USGS` | USGS Earthquake Hazards Program | `https://earthquake.usgs.gov/fdsnws/event/1/` | None (Public Domain) | Public Domain | US Public Domain | **LIVE_DATA_VERIFIED** | Real-time global seismic telemetry |
| 13 | **Scientific & Disaster Data** | `CONN_NASA_EONET` | NASA Earth Observatory Natural Events | `https://eonet.gsfc.nasa.gov/api/v3/events` | None (NASA Open Access) | Standard NASA rate | Public Domain | **LIVE_DATA_VERIFIED** | Active wildfires, severe storms, and volcanoes |
| 14 | **Scientific & Disaster Data** | `CONN_NOAA` | NOAA NCEI / Weather.gov | `https://api.weather.gov/alerts/active` | Optional CDO token / Free Alerts | Fair use | US Public Domain | **LIVE_DATA_VERIFIED** | Severe weather warnings & climate telemetry |
| 15 | **Government Open Data** | `CONN_USASPENDING` | USASpending.gov Open API v2 | `https://api.usaspending.gov/api/v2/spending_by_award/` | None (Public API) | Standard federal limits | US Public Domain | **LIVE_DATA_VERIFIED** | Foreign military and humanitarian award allocations |
| 16 | **Conflict & Political Events** | `CONN_GDELT_EVENTS` | GDELT 2.0 Real-Time Event Stream | `http://data.gdeltproject.org/gdeltv2/lastupdate.txt` | None (Public Stream) | 15-minute file cycle | Open Research Use | **LIVE_DATA_VERIFIED** | Conflict and event stream tabular telemetry |

---

## Reconciliation of 17 Probes vs 16 Connectors

The comprehensive audit report previously recorded 17 test probes. This occurred because:
- The connector registry contains **exactly 16 distinct connector implementations** (`app/connectors/`).
- The 17th probe was an independent endpoint probe testing the external **Uppsala Conflict Data Program (UCDP)** authentication endpoint (`https://ucdp.uu.se/apidocs/`) during credential audit.
- UCDP requires a free user registration token (`UCDP_ACCESS_TOKEN`); when unconfigured, the pipeline relies on GDELT Real-Time Event Stream for conflict telemetry.
- All 16 registered connectors are actively probed, normalized, verified, and integrated into the Dataset Builder.

---

## Restricted & Commercial Providers (Zero-Cost Compliance Safeguards)

| Provider | Category | Required Credential | Env Variable | Status | Rationale |
|---|---|---|---|---|---|
| **UN OCHA ReliefWeb** | International Organizations | Approved AppName | `RELIEFWEB_APPNAME` | **LIVE_DATA_VERIFIED** | Free registration AppName configured and verified; live reports ingested. |
| **Uppsala Conflict Data (UCDP)** | Conflict & Political | Research Access Token | `UCDP_ACCESS_TOKEN` | **CREDENTIAL_OPTIONAL** | Free registration token for research; returns HTTP 401 without token. GDELT Real-Time Stream covers conflict events. |
| **ACLED** | Conflict & Political | Paid Enterprise License | N/A | **DISABLED** (`LICENSE_CHECK`) | Prohibits automated AI scraping and commercial research without paid subscription. |
| **Twitter / X** | Public Social Signals | Enterprise API Token ($100+/mo) | N/A | **DISABLED** (`PAID_RESTRICTED`) | Prohibits AI ingestion without commercial enterprise subscription. Wikimedia Pageviews and OONI provide zero-cost public attention metrics. |

---

## Provenance and Temporal Integrity Guarantees

1. **GDELT HTTP 429 Throttle**: Built-in 5-second sleep and exponential backoff retry loop prevents IP bans while providing honest fallback logging when rate limits are breached.
2. **ReliefWeb Publication Timestamping**: Every report is stamped with `published_at` vs. `retrieved_at` so historical context is never conflated with live events.
3. **IODA / OONI Telemetry**: Clearly flags measurements as historical telemetry (>48h window) versus active incident monitoring.
4. **Wikimedia Digital Attention**: Strictly interpreted as query volume / public attention, never misconstrued as sentiment or qualitative opinion.
5. **Macroeconomic Indicators (World Bank / IMF)**: Preserves indicator observation vintage (e.g., 2023 annual report) rather than fabricating real-time tick precision.
6. **Nominatim Fair Use**: Enforces strict 1 req/sec throttle with custom User-Agent to respect OpenStreetMap operational policies.
