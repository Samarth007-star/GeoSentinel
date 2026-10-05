# GeoSentinel — Cost and Service Audit

> **Policy Requirement**: Mandatory Zero-Cost Policy — Absolute Financial Restrictions.  
> **Rule**: The system must operate without requiring the user to pay any fees, subscribe to any service, activate billing, purchase credits, or provide payment details.

---

## 1. Executive Summary

| Category | Policy Compliance | Verified Status |
| :--- | :--- | :--- |
| **Paid Data APIs** | Strictly Prohibited | **0 Paid APIs Detected (100% Compliant)** |
| **Paid LLM Services** | Strictly Prohibited | **0 Paid LLMs Configured (100% Compliant)** |
| **Cloud Hosting / VPS** | Strictly Prohibited | **100% Native Localhost Execution** |
| **Paid Developer Tools** | Strictly Prohibited | **100% Open Source / Free Software** |
| **Payment Credentials** | Strictly Prohibited | **Zero Credit Card / Billing Hooks in Code** |

---

## 2. Data Connector Audit

Every data connector utilized by the GeoSentinel Dataset Builder has been audited for pricing, billing requirements, authentication, and licensing terms:

| Connector ID | Data Provider | Canonical Category | Endpoint URL | Pricing / Fee Structure | Billing / Payment Required? | Authentication / Key Required? | License / Terms of Use | Current Operational Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CONN_RELIEFWEB` | UN OCHA ReliefWeb | International Organizations | `https://api.reliefweb.int/v2` | Humanitarian Public API | **NO** | Free Appname Parameter Required | CC-BY 4.0 | **LIVE_DATA_VERIFIED** |
| `CONN_GDELT` | The GDELT Project (DOC 2.0 API) | News | `https://api.gdeltproject.org/api/v2/doc/doc` | Open Research Access | **NO** | None (Public API, 5s rate limit) | Open Research Access | **RATE_LIMITED / LIVE_DATA_VERIFIED** |
| `CONN_OONI` | Open Observatory of Network Interference | Internet & Infrastructure | `https://api.ooni.io/api/v1` | Open Censorship Telemetry | **NO** | None (Open Data API) | CC0 1.0 Public Domain | **LIVE_DATA_VERIFIED** |
| `CONN_IODA` | CAIDA / Georgia Tech IODA | Internet & Infrastructure | `https://api.ioda.inetintel.cc.gatech.edu/v2` | Macro Outage Telemetry | **NO** | None (Academic Research API) | Academic Non-Commercial | **LIVE_DATA_VERIFIED** |
| `CONN_WIKIDATA` | Wikimedia / Wikidata | Geographic & Entities | `https://query.wikidata.org/sparql` | Open Semantic Knowledge Graph | **NO** | Descriptive User-Agent Required | CC0 1.0 Public Domain | **LIVE_DATA_VERIFIED** |
| `CONN_WIKIMEDIA` | Wikimedia Foundation | Public Digital Signals | `https://wikimedia.org/api/rest_v1` | Public Pageview Aggregates | **NO** | Descriptive User-Agent Required | CC-BY-SA 3.0 / Terms of Use | **LIVE_DATA_VERIFIED** |
| `CONN_WORLDBANK` | The World Bank Group | Economic & Financial Data | `https://api.worldbank.org/v2` | Genuinely Free Public Open Data | **NO** | None (Open access) | CC-BY 4.0 | **LIVE_DATA_VERIFIED** |
| `CONN_USGS` | United States Geological Survey | Scientific & Disaster Data | `https://earthquake.usgs.gov/fdsnws/event/1` | US Federal Public Domain | **NO** | None (Open access) | US Public Domain | **LIVE_DATA_VERIFIED** |
| `CONN_NASA_EONET` | NASA Earth Observatory | Scientific & Disaster Data | `https://eonet.gsfc.nasa.gov/api/v3` | US Federal Public Open Data | **NO** | None (Open access) | NASA Open Data Policy | **LIVE_DATA_VERIFIED** |

### Safe Failure & Quota Protection:
1. **No Automatic Overage**: BaseConnector (`ai-service/app/connectors/base.py`) has hardcoded max timeout (8s), rate-limit backoff, and circuit-breaker threshold (5 failures).
2. **Deterministic Offline Fallbacks**: If internet connectivity is disconnected or an API returns HTTP 429/500, the connector falls back to pre-seeded local research reference fixtures (`data/reference/`), marking records with `data_origin="REFERENCE"`.
3. **No Commercial Paywalls**: No connectors for commercial Twitter/X API, paid ACLED subscription tiers, or paid Bloomberg/Reuters feeds are present.
4. **Zero Billing Hooks**: No credit cards, banking info, or financial accounts are used anywhere in the architecture. All providers are 100% cost-free.

---

## 3. AI / LLM Inference Cost Audit

| Component | Architecture | Paid API Dependencies | Fallback Mechanism | Financial Obligation |
| :--- | :--- | :--- | :--- | :--- |
| **Question Understanding Agent** | Local Rule-based / Regex & NLP | None | Deterministic intent parsing | $0.00 |
| **Retrieval Planning Agent** | Local Schema Generator | None | Deterministic plan generation | $0.00 |
| **Evidence Verification Agent** | Deterministic SHA-256 & Provenance Engine | None | Local 6-state state-machine | $0.00 |
| **GeoCausal Engine** | In-Memory Causal Graph Propagation | None | Relational domain adjacency rules | $0.00 |
| **GeoFork Scenario Lab** | Branching Parameter Perturbation | None | Deterministic branch logic | $0.00 |
| **Strategy Generation Agent** | Local Domain Templates & Heuristics | None | Verified policy mechanisms | $0.00 |
| **Strategy Risk Review Gate** | Independent Red Team Challenge Filter | None | Deterministic structural blocker | $0.00 |
| **ForecastLab Evaluation** | Local Brier / Log Loss Scoring Engine | None | Offline mathematical computation | $0.00 |

*Zero external paid LLM calls (e.g., OpenAI `gpt-4`, Anthropic `claude-3`, Google Cloud Vertex AI) are made. All inference runs locally and deterministically.*
