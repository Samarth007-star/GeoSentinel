# GeoSentinel — Source & Connector Registry

> **Compliance Requirement**: Section 3.1, Section 8, & Section 10 of the Master Autonomous Development Prompt.  
> **Rule**: Zero Paid Data Resources. Every enabled connector must have verified free-access conditions, permitted research/AI use, documented attribution, and active health checks. Any source with ambiguous or commercial-only restrictions is set to `DISABLED` (`LICENSE_CHECK` or `PAID_RESTRICTED`).

---

## Canonical Eight Categories — Real Provider Matrix (Empirically Verified)

| # | Canonical Category | Connector ID | Provider Name | Official API / Feed | Auth / Credential | Free Access | Implementation | Live Status | Data Nature & Freshness |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Government Open Data** | `CONN_USASPENDING` | US Federal Government (USAspending) | `https://api.usaspending.gov/api/v2/references/toptier_agencies/` | None (Public Domain) | Free | Implemented (`usaspending.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Live / Official Federal Registry |
| 2 | **International Organizations** | `CONN_UN_SDG` | UN Statistics Division SDG Open API | `https://unstats.un.org/SDGAPI/v1/sdg/Target/List` | None (CC-BY 3.0 IGO) | Free | Implemented (`un_sdg.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Multilateral Standard Targets |
| 2 | **International Organizations** | `CONN_RELIEFWEB` | UN OCHA ReliefWeb API v2 | `https://api.reliefweb.int/v2/reports` | AppName parameter (`RELIEFWEB_APPNAME`) | Free with approval | Implemented (`reliefweb.py`) | **CREDENTIAL_MISSING** (HTTP 403 without approved appname) | Humanitarian Situation Reports |
| 3 | **Economic & Financial Data** | `CONN_WORLDBANK` | World Bank Indicators API | `https://api.worldbank.org/v2/country/{iso}/indicator/{code}` | None (CC-BY 4.0) | Free | Implemented (`world_bank.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Historical Annual Indicators |
| 4 | **News Sources** | `CONN_NEWS` | UN News Service Global Public Feed | `https://news.un.org/feed/subscribe/en/news/all/rss.xml` | None (Open Access) | Free | Implemented (`news.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Live News Dispatches (Hourly) |
| 5 | **Scientific & Disaster Data** | `CONN_USGS` | USGS Earthquake Hazards Program | `https://earthquake.usgs.gov/fdsnws/event/1/` | None (Public Domain) | Free | Implemented (`usgs.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Real-time Seismic Events |
| 5 | **Scientific & Disaster Data** | `CONN_NASA_EONET` | NASA Earth Observatory Natural Events | `https://eonet.gsfc.nasa.gov/api/v3/events` | None (NASA Open Access) | Free | Implemented (`nasa_eonet.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Real-time Natural Events (Active) |
| 6 | **Geographic Data** | `CONN_NOMINATIM` | OpenStreetMap Nominatim Spatial API | `https://nominatim.openstreetmap.org/search` | User-Agent (ODbL 1.0) | Free | Implemented (`nominatim.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Real-time Geocoding & Boundaries |
| 7 | **Public Social Signals** | `CONN_WIKIMEDIA` | Wikimedia Foundation Pageviews API | `https://wikimedia.org/api/rest_v1/metrics/pageviews/` | User-Agent (CC0 1.0) | Free | Implemented (`wikimedia.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Daily Aggregated Attention Metrics |
| 8 | **Conflict & Political Events** | `CONN_GDELT_EVENTS` | GDELT 2.0 Global Event Stream | `http://data.gdeltproject.org/gdeltv2/lastupdate.txt` | None (Open Research) | Free | Implemented (`gdelt_events.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Real-time 15-Minute Event Sync |

---

## Restricted & Credential-Gated Providers (Honest Audit Disclosure)

| Provider | Category | Official Portal | Required Credential | Env Variable | Status | Rationale |
|---|---|---|---|---|---|---|
| **UN OCHA ReliefWeb** | International Organizations | [ReliefWeb AppName Registration](https://apidoc.reliefweb.int/parameters#appname) | Approved AppName | `RELIEFWEB_APPNAME` | **CREDENTIAL_MISSING** | API v1 was retired (HTTP 410); API v2 enforces approved application name registration. UN SDG provides active live international organization telemetry while ReliefWeb credential is created by user. |
| **Uppsala Conflict Data (UCDP)** | Conflict & Political | [UCDP API Registration](https://ucdp.uu.se/apidocs/) | Access Token | `UCDP_ACCESS_TOKEN` | **CREDENTIAL_MISSING** | Free registration for research/academic use; returns HTTP 401 without token. GDELT Real-Time Event Stream provides active live conflict coverage. |
| **ACLED** | Conflict & Political | [ACLED Terms of Use](https://acleddata.com/terms-of-use/) | Paid / Restricted License | N/A | **DISABLED** (`LICENSE_CHECK`) | Prohibits automated AI scraping and commercial research without paid enterprise subscription. |
| **Twitter / X** | Public Social Signals | [X Developer Platform](https://developer.twitter.com) | Enterprise API Token ($100+/mo) | N/A | **DISABLED** (`PAID_RESTRICTED`) | Prohibits AI ingestion without commercial enterprise subscription. Wikimedia Pageviews and OONI provide zero-cost public attention metrics. |

---

## Distinction: Eight External Categories vs. Reference Datasets

The repository maintains two strictly separated data tiers:
1. **The Eight Canonical External Data Categories** (Live external HTTP APIs tested above):
   - Government Open Data
   - International Organizations
   - Economic & Financial Data
   - News Sources
   - Scientific & Disaster Data
   - Geographic Data
   - Public Social Signals
   - Conflict & Political Events
2. **Internal Reference Datasets** (Stored in `data/reference/` and hydrated into MySQL 8.0 `geosentinel` database):
   - `countries.csv` (258 rows)
   - `economic_indicators.csv` (265 rows)
   - `events.xlsx` (120 rows)
   - `news.xlsx` (226 rows)
   - `organizations.xlsx` (50 rows)
   - `evidence.xlsx` (1,687 rows)
   - `event_sources.xlsx` (1,687 rows)
   - `entity_relationships.xlsx` (587 rows)
   - `users_demo.xlsx` (Demo accounts)

---

## Connector Execution Safeguards

1. **Timeout Bounds**: Max 8000ms connection timeout, 10000ms read timeout.
2. **Backoff & Jitter**: Exponential backoff with jitter on HTTP 429 and 503 errors (max 3 retries).
3. **Circuit Breakers**: Tripped after 5 consecutive failures, opening for 60 seconds before half-open probe.
4. **Rate Limiting**: Strictly throttled in accordance with provider guidance (e.g., Nominatim max 1 req/sec; GDELT max 1 req/5sec).
5. **Payload Size Guard**: Responses capped at 5 MB to prevent memory exhaustion and DoS.
6. **Provenance Tagging**: Every record returned is stamped with `connectorId`, `retrievalTimestamp`, `sourceRecordId`, `contentHash`, and `license_id`.
