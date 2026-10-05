# GeoSentinel — Source & Connector Registry

> **Compliance Requirement**: Section 3.1, Section 8, & Section 10 of the Master Autonomous Development Prompt.  
> **Rule**: Zero Paid Data Resources. Every enabled connector must have verified free-access conditions, permitted research/AI use, documented attribution, and active health checks. Any source with ambiguous or commercial-only restrictions is set to `DISABLED` (`LICENSE_CHECK` or `PAID_RESTRICTED`).

---

## Canonical Categories & Active Connectors Matrix (Empirically Verified)

| # | Canonical Category | Connector ID | Provider Name | Official API / Feed | Auth / Credential | Free Access | Implementation | Live Status | Data Nature & Freshness |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **International Organizations** | `CONN_RELIEFWEB` | UN OCHA ReliefWeb API v2 | `https://api.reliefweb.int/v2/reports` | AppName parameter (`RELIEFWEB_APPNAME`) | Free with pre-registration | Implemented (`reliefweb.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Live Humanitarian Situation Reports |
| 2 | **News Intelligence** | `CONN_GDELT` | GDELT Project 2.0 DOC API | `https://api.gdeltproject.org/api/v2/doc/doc` | None (Public API) | Free | Implemented (`gdelt.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Live Global Media Telemetry (5s throttled) |
| 3 | **Internet & Infrastructure** | `CONN_OONI` | Open Observatory of Network Interference (OONI) | `https://api.ooni.io/api/v1/measurements` | None (Open Data API) | Free | Implemented (`ooni.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Censorship & Network Interference Signals |
| 4 | **Internet & Infrastructure** | `CONN_IODA` | CAIDA / Georgia Tech IODA v2 | `https://api.ioda.inetintel.cc.gatech.edu/v2/outages/events` | None (Academic API) | Free | Implemented (`ioda.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Macro BGP & Active Ping Outage Signals |
| 5 | **Geographic & Entities** | `CONN_WIKIDATA` | Wikidata Knowledge Base (SPARQL) | `https://query.wikidata.org/sparql` | Custom User-Agent Header | Free | Implemented (`wikidata.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Semantic Graph & Administrative Entities |
| 6 | **Public Digital Signals** | `CONN_WIKIMEDIA` | Wikimedia Foundation REST API | `https://wikimedia.org/api/rest_v1/metrics/pageviews/` | Custom User-Agent Header | Free | Implemented (`wikimedia.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Daily Aggregated Digital Attention Signals |
| 7 | **Economic & Financial Data** | `CONN_WORLDBANK` | World Bank Indicators API | `https://api.worldbank.org/v2/country/{iso}/indicator/{code}` | None (CC-BY 4.0) | Free | Implemented (`world_bank.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Historical Macro Indicators |
| 8 | **Scientific & Disaster Data** | `CONN_USGS` | USGS Earthquake Hazards Program | `https://earthquake.usgs.gov/fdsnws/event/1/` | None (Public Domain) | Free | Implemented (`usgs.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Real-time Seismic Events |
| 9 | **Scientific & Disaster Data** | `CONN_NASA_EONET` | NASA Earth Observatory Natural Events | `https://eonet.gsfc.nasa.gov/api/v3/events` | None (NASA Open Access) | Free | Implemented (`nasa_eonet.py`) | **LIVE_DATA_VERIFIED** (HTTP 200) | Active Natural Hazard Events |

---

## Restricted & Credential-Gated Providers (Honest Audit Disclosure)

| Provider | Category | Official Portal | Required Credential | Env Variable | Status | Rationale |
|---|---|---|---|---|---|---|
| **UN OCHA ReliefWeb** | International Organizations | [ReliefWeb AppName Registration](https://apidoc.reliefweb.int/parameters#appname) | Approved AppName | `RELIEFWEB_APPNAME` | **LIVE_DATA_VERIFIED** | User-configured `RELIEFWEB_APPNAME` validated; live HTTP 200 connectivity confirmed with real report records. |
| **Uppsala Conflict Data (UCDP)** | Conflict & Political | [UCDP API Registration](https://ucdp.uu.se/apidocs/) | Access Token | `UCDP_ACCESS_TOKEN` | **CREDENTIAL_MISSING** | Free registration for research/academic use; returns HTTP 401 without token. GDELT Real-Time Event Stream provides active live conflict coverage. |
| **ACLED** | Conflict & Political | [ACLED Terms of Use](https://acleddata.com/terms-of-use/) | Paid / Restricted License | N/A | **DISABLED** (`LICENSE_CHECK`) | Prohibits automated AI scraping and commercial research without paid enterprise subscription. |
| **Twitter / X** | Public Social Signals | [X Developer Platform](https://developer.twitter.com) | Enterprise API Token ($100+/mo) | N/A | **DISABLED** (`PAID_RESTRICTED`) | Prohibits AI ingestion without commercial enterprise subscription. Wikimedia Pageviews and OONI provide zero-cost public attention metrics. |

---

## Distinction: External Data Connectors vs. Reference Datasets

The repository maintains two strictly separated data tiers:
1. **External Data Connectors** (Live external HTTP APIs tested above):
   - ReliefWeb (`CONN_RELIEFWEB`)
   - GDELT (`CONN_GDELT`)
   - OONI (`CONN_OONI`)
   - IODA (`CONN_IODA`)
   - Wikidata (`CONN_WIKIDATA`)
   - Wikimedia Pageviews (`CONN_WIKIMEDIA`)
   - World Bank (`CONN_WORLDBANK`)
   - USGS (`CONN_USGS`)
   - NASA EONET (`CONN_NASA_EONET`)
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
4. **Rate Limiting**: Strictly throttled in accordance with provider guidance (e.g., GDELT enforced min 5s throttle; Nominatim max 1 req/sec).
5. **Payload Size Guard**: Responses capped at 5 MB to prevent memory exhaustion and DoS.
6. **Provenance Tagging**: Every record returned is stamped with `connector_id`, `retrieved_at`, `source_url`, `content_hash`, `license_id`, and `data_origin` (`LIVE` vs `HISTORICAL` vs `REFERENCE`).
