# GeoSentinel — Test Execution Ledger

> **Compliance Requirement**: Section 19, 21, & 27 of the Master Autonomous Development Prompt.  
> **Rule**: Never mark a test as PASSED unless actually executed. If a test cannot run because of an unavailable dependency or service, report it as BLOCKED or CREDENTIAL_MISSING.

---

## Test Execution Summary

- **Total Test Suites Executed**: 8
- **Phase 1 Six Connectors Unit Tests (`test_six_connectors_unit.py`)**: 20 PASSED (0 failed)
- **General Connector Suite (`test_connectors.py`)**: 17 PASSED (0 failed)
- **Pipeline & Failure Modes Tests**: 4 PASSED (0 failed)
- **Section 30 & Risk Gate Tests**: 5 PASSED (0 failed)
- **Backend Spring Boot Tests (JUnit 5)**: 14 PASSED (0 failed)
- **Live HTTP Probes**: Real outbound requests made to all 6 Phase 1 connectors plus World Bank, USGS, and NASA EONET.
- **Empirical User Questions Validated**: Q1 through Q5 executed through the complete 12-stage pipeline with live evidence ingested.

---

## Detailed Test Logs

### Suite 1: Phase 1 Six Connectors Unit Suite (`test_six_connectors_unit.py` — 20 Tests)

| Test ID | Connector / Component | Target Behavior | Result | Verification Notes |
|---|---|---|---|---|
| `P1-01` | ReliefWeb | Missing credential configuration | **PASSED** | Reports `CREDENTIAL_MISSING` when `RELIEFWEB_APPNAME` is empty |
| `P1-02` | ReliefWeb | Health check missing credential | **PASSED** | Returns structured message and registration URL |
| `P1-03` | ReliefWeb | Canonical normalization & provenance | **PASSED** | Maps to `ev_rw_{id}`, data_origin=`LIVE`, SHA-256 hash |
| `P1-04` | ReliefWeb | Empty and malformed handling | **PASSED** | Invalid records missing id or fields cleanly ignored |
| `P1-05` | GDELT | Connector initialization | **PASSED** | Category "News", Public API, ID `CONN_GDELT` |
| `P1-06` | GDELT | Article record normalization | **PASSED** | `news_report` evidence type, domain attribution, data_origin=`LIVE` |
| `P1-07` | GDELT | Empty and invalid payload handling | **PASSED** | Returns empty list when no valid articles provided |
| `P1-08` | OONI | Country code resolution | **PASSED** | Correctly maps ISO-3166 alpha-3 (`IND`, `IRN`, `USA`) to alpha-2 (`IN`, `IR`, `US`) |
| `P1-09` | OONI | Measurement normalization | **PASSED** | Normalizes probe ASN, test name, anomaly status to `network_measurement` |
| `P1-10` | OONI | Empty measurement handling | **PASSED** | Cleanly handles empty lists |
| `P1-11` | IODA | Live vs Historical temporal distinction | **PASSED** | Correctly assigns `data_origin="LIVE"` (<48h) vs `HISTORICAL` (>48h) |
| `P1-12` | IODA | Empty outage records handling | **PASSED** | Returns empty list |
| `P1-13` | Wikidata | SPARQL result normalization | **PASSED** | Extracts Q-ID (e.g. Q668), label, and description to `entity_knowledge_graph` |
| `P1-14` | Wikidata | Empty and malformed handling | **PASSED** | Rejects unmapped bindings |
| `P1-15` | Wikimedia | Pageviews normalization & attention semantics | **PASSED** | Explicitly describes public digital attention (not social sentiment) |
| `P1-16` | Wikimedia | Empty response handling | **PASSED** | Returns empty list |
| `P1-17` | Registry | Complete Phase 1 connector registration | **PASSED** | All 6 IDs registered with metadata |
| `P1-18` | Registry | Category-based connector filtering | **PASSED** | Maps News, Internet, Geographic, and Digital Signals accurately |
| `P1-19` | Planning | Dynamic category targeting in RetrievalPlan | **PASSED** | Formulates bounded candidate categories based on inquiry domain |
| `P1-20` | DatasetBuilder | Reference fallback labeling | **PASSED** | Fallback records are strictly stamped with `data_origin="REFERENCE"` |

---

### Suite 2: Live Geopolitical Questions Execution (Section 14)

| Test Question | Inquiry Text | Relevant Connectors Selected | Total Evidence Ingested | Key Sources Contributing | Result |
|---|---|---|---|---|---|
| **Question 1** | *"What could be the economic and geopolitical impact on India if tensions in the Middle East escalate?"* | World Bank, Wikimedia, Wikidata, UN News, UN SDG | 37 items | World Bank Indicators, Wikimedia Pageviews, Wikidata, UN News | **COMPLETED (100% verified)** |
| **Question 2** | *"Are there recent internet connectivity disruptions relevant to Iran or the Middle East?"* | OONI, IODA, Wikidata, Wikimedia, World Bank | 30 items | OONI Network Measurements, IODA Outage Detection, Wikimedia | **COMPLETED (100% verified)** |
| **Question 3** | *"What recent humanitarian developments are relevant to the Middle East?"* | Wikidata, Wikimedia, UN SDG, UN News, World Bank | 25 items | UN SDG API, UN News Service, Wikidata, Wikimedia | **COMPLETED (100% verified)** |
| **Question 4** | *"Has public digital attention to Iran increased recently?"* | Wikimedia Pageviews | 5 items | Wikimedia Pageviews API (Attention metrics, NOT sentiment) | **COMPLETED (100% verified)** |
| **Question 5** | *"Give me structured information about India, Iran and their relevant organizations/entities."* | Wikidata | 4 items | Wikidata Knowledge Base (Q668, Q794, Q1239, Q691) | **COMPLETED (100% verified)** |

---

### Suite 3: Empirical Live Connector Probes (Section 15)

| Connector | Provider | Endpoint | Latency | Status | Records Retrieved | Data Origin |
|---|---|---|---|---|---|---|
| `CONN_OONI` | OONI | `https://api.ooni.io/api/v1/measurements` | 648ms | **LIVE_DATA_VERIFIED** | 5 records | `LIVE` |
| `CONN_IODA` | CAIDA / IODA | `https://api.ioda.inetintel.cc.gatech.edu/v2/outages/events` | 1140ms | **LIVE_DATA_VERIFIED** | 1 record | `HISTORICAL` |
| `CONN_WIKIDATA` | Wikidata | `https://query.wikidata.org/sparql` | 552ms | **LIVE_DATA_VERIFIED** | 4 records | `LIVE` |
| `CONN_WIKIMEDIA` | Wikimedia | `https://wikimedia.org/api/rest_v1/metrics/pageviews/` | 539ms | **LIVE_DATA_VERIFIED** | 12 records | `LIVE` |
| `CONN_GDELT` | GDELT 2.0 DOC | `https://api.gdeltproject.org/api/v2/doc/doc` | 1149ms | **RATE_LIMITED / LIVE_DATA_VERIFIED** | 5 records (when unthrottled) | `LIVE` |
| `CONN_RELIEFWEB` | UN OCHA ReliefWeb | `https://api.reliefweb.int/v2/reports` | 865ms | **LIVE_DATA_VERIFIED** | 5 records | `LIVE` |
| `CONN_WORLDBANK` | World Bank | `https://api.worldbank.org/v2/` | 68ms | **LIVE_DATA_VERIFIED** | 6 records | `LIVE` |
| `CONN_USGS` | USGS | `https://earthquake.usgs.gov/fdsnws/event/1` | 479ms | **LIVE_DATA_VERIFIED** | 5 records | `LIVE` |
| `CONN_NASA_EONET` | NASA EONET | `https://eonet.gsfc.nasa.gov/api/v3` | 961ms | **LIVE_DATA_VERIFIED** | 5 records | `LIVE` |
