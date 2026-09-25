# GeoSentinel — Source & Connector Registry

> **Compliance Requirement**: Section 3.1 & Section 8 of the Master Autonomous Development Prompt.  
> **Rule**: Zero Paid Data Resources. Every enabled connector must have verified free-access conditions, permitted research/AI use, documented attribution, and active health checks. Any source with ambiguous terms is set to `LICENSE_CHECK` and disabled.

---

## Connector Registry Status Matrix

| Connector ID | Category | Provider Name | Official Base URL | Auth / Key | License / Terms URL | Permitted AI / Research | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CONN_WORLDBANK` | Economic & Financial | World Bank Indicators | `https://api.worldbank.org/v2` | None (Free Open API) | CC-BY 4.0 / [World Bank Terms](https://data.worldbank.org/summary-terms-of-use) | Yes | **ACTIVE** |
| `CONN_USGS` | Scientific & Disaster | USGS Earthquake Hazards Program | `https://earthquake.usgs.gov/fdsnws/event/1/` | None (Public Domain) | US Govt Public Domain / [USGS Terms](https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits) | Yes | **ACTIVE** |
| `CONN_NASA_EONET` | Scientific & Disaster | NASA Earth Observatory Natural Events | `https://eonet.gsfc.nasa.gov/api/v3` | None (Open Access) | NASA Open Data Policy / [NASA Terms](https://www.nasa.gov/open/data.html) | Yes | **ACTIVE** |
| `CONN_GDELT` | News Sources | GDELT Project (DOC 2.0 API) | `https://api.gdeltproject.org/api/v2` | None (Free Public API) | Free for academic & open research / [GDELT Terms](https://www.gdeltproject.org/data.html) | Yes | **ACTIVE** |
| `CONN_OONI` | Internet & Infrastructure | Open Observatory of Network Interference | `https://api.ooni.io/api/v1` | None (Open Data API) | CC0 1.0 Public Domain / [OONI Data Policy](https://ooni.org/about/data-policy/) | Yes | **ACTIVE** |
| `CONN_IODA` | Internet & Infrastructure | Internet Outage Detection & Analysis | `https://api.ioda.inetintel.cc.gatech.edu/v2` | None (Free Academic API) | Academic Non-Commercial Research / [IODA Terms](https://ioda.inetintel.cc.gatech.edu/) | Yes | **ACTIVE** |
| `CONN_WIKIDATA` | Geographic & Entities | Wikimedia Foundation | `https://query.wikidata.org/sparql` | User-Agent Header | CC0 1.0 / [Wikidata Terms](https://www.wikidata.org/wiki/Wikidata:Data_reuse) | Yes | **ACTIVE** |
| `CONN_RELIEFWEB` | International Orgs | UN OCHA ReliefWeb | `https://api.reliefweb.int/v1` | Free App Name in UA | CC-BY 4.0 / [ReliefWeb Terms](https://reliefweb.int/terms-conditions) | Yes | **ACTIVE** |
| `CONN_ACLED` | Conflict & Political | ACLED | `https://api.acleddata.com/` | Paid / Restricted registration | Requires commercial license for AI / [ACLED Terms](https://acleddata.com/terms-of-use/) | **Unclear / Restricted** | **DISABLED** (`LICENSE_CHECK`) |
| `CONN_TWITTER_X` | Public Social Signals | X Corp | `https://api.twitter.com` | Paid Enterprise Tier ($100+/mo) | Prohibits AI use without enterprise tier | **Prohibited** | **DISABLED** (`PAID_RESTRICTED`) |

---

## Connector Execution Safeguards

1. **Timeout Bounds**: Max 5000ms connection timeout, 10000ms read timeout.
2. **Backoff & Jitter**: Exponential backoff with jitter on HTTP 429 and 503 errors (max 3 retries).
3. **Circuit Breakers**: Tripped after 5 consecutive failures, opening for 60 seconds before half-open probe.
4. **Rate Limiting**: Strictly throttled in accordance with provider guidance (e.g., GDELT max 1 req/sec; World Bank max 5 req/sec).
5. **Payload Size Guard**: Responses capped at 5 MB to prevent memory exhaustion and DoS.
6. **Provenance Tagging**: Every record returned is stamped with `connectorId`, `retrievalTimestamp`, `sourceRecordId`, `contentHash`, and `termsReviewedDate`.
