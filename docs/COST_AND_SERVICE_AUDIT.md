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
| `CONN_USASPENDING` | US Treasury / USAspending | 1. Government Open Data | `https://api.usaspending.gov/api/v2` | US Federal Open Data | **NO** | None (Public open access) | US Public Domain | **LIVE_DATA_VERIFIED** |
| `CONN_UN_SDG` | United Nations DESA SDG API | 2. International Organizations | `https://unstats.un.org/sdgapi/v1` | UN Official Statistics | **NO** | None (Public open access) | Open Access / UN Terms | **LIVE_DATA_VERIFIED** |
| `CONN_RELIEFWEB` | UN OCHA ReliefWeb | 2. International Organizations | `https://api.reliefweb.int/v2` | Humanitarian Public API | **NO** | Free Appname Parameter Required | CC-BY 4.0 | **CREDENTIAL_MISSING** (Free appname not configured) |
| `CONN_WORLDBANK` | The World Bank Group | 3. Economic & Financial Data | `https://api.worldbank.org/v2` | Genuinely Free Public Open Data | **NO** | None (Open access) | CC-BY 4.0 | **LIVE_DATA_VERIFIED** |
| `CONN_NEWS` | United Nations News RSS Feed | 4. News Sources | `https://news.un.org/feed/subscribe/en/news/all/rss.xml` | Public UN RSS News Service | **NO** | None (Public XML feed) | UN Copyright / Open Reading | **LIVE_DATA_VERIFIED** |
| `CONN_USGS` | United States Geological Survey | 5. Scientific & Disaster Data | `https://earthquake.usgs.gov/fdsnws/event/1` | US Federal Public Domain | **NO** | None (Open access) | US Public Domain | **LIVE_DATA_VERIFIED** |
| `CONN_NASA_EONET` | NASA Earth Observatory | 5. Scientific & Disaster Data | `https://eonet.gsfc.nasa.gov/api/v3` | US Federal Public Open Data | **NO** | None (Open access) | NASA Open Data Policy | **LIVE_DATA_VERIFIED** |
| `CONN_NOMINATIM` | OpenStreetMap / Nominatim | 6. Geographic Data | `https://nominatim.openstreetmap.org` | OpenStreetMap Open Data | **NO** | User-Agent Header Required | ODbL (Open Database License) | **LIVE_DATA_VERIFIED** |
| `CONN_WIKIMEDIA` | Wikimedia Foundation | 7. Public Social Signals | `https://wikimedia.org/api/rest_v1` | Public Wikimedia REST API | **NO** | Descriptive User-Agent Required | CC-BY-SA 3.0 / Wikimedia Terms | **LIVE_DATA_VERIFIED** |
| `CONN_GDELT_EVENTS` | The GDELT Project | 8. Conflict & Political Events | `http://data.gdeltproject.org/gdeltv2` | Open Academic Conflict Feed | **NO** | None (15-min Public CSV Stream) | Open Access / Research Use | **LIVE_DATA_VERIFIED** |

### Safe Failure & Quota Protection:
1. **No Automatic Overage**: BaseConnector (`ai-service/app/connectors/base.py`) has hardcoded max timeout (10s), rate-limit backoff, and circuit-breaker threshold (3 failures).
2. **Deterministic Offline Fallbacks**: If internet connectivity is disconnected or an API returns HTTP 429/500, the connector falls back to pre-seeded local research reference fixtures (`data/reference/`).
3. **No Commercial Paywalls**: No connectors for commercial Twitter/X API, paid ACLED subscription tiers, or paid Bloomberg/Reuters feeds are present.
4. **Zero Billing Hooks**: No credit cards, banking info, or financial accounts are used anywhere in the architecture. All 10 audited providers are 100% cost-free.

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

### 3.1 Local Ollama & Local Model Endpoint Audit
- **Default Mode**: Operates out-of-the-box via `DeterministicRuleBasedFallback` requiring zero external services or model downloads.
- **Ollama Endpoint**: Configured to `http://localhost:11434` (`LOCAL_MODEL_BASE_URL`).
- **Cloud Fallback Policy**: If local Ollama is offline or uninstalled, the system falls back strictly to the local deterministic engine. It **never** falls back to a paid or cloud-hosted endpoint.
- **Data Transmission**: User queries, prompts, and session contexts are processed 100% on localhost. Zero analytical data or prompt tokens are transmitted across external networks.

---

## 4. Local Infrastructure & Hosting Audit

| Tier | Technology | Hosting Location | Licensing | Cloud Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS | Localhost (Port 5173) | MIT / Open Source | $0.00 |
| **Backend** | Java 21 / 26, Spring Boot 3.2.5 | Localhost (Port 8080) | Apache 2.0 / Open Source | $0.00 |
| **AI Service** | Python 3.14, FastAPI, Pydantic v2 | Localhost (Port 8000) | MIT / Open Source | $0.00 |
| **Database** | MySQL Community Server 8.0 | Local Windows Service (Port 3306) | GPL v2 / FOSS Community Edition | $0.00 |

### 4.1 Secrets & Credential Management
- **JWT Secret**: Configured locally via `JWT_SECRET` environment variable or local default.
- **Internal Service Key**: Configured locally via `INTERNAL_SERVICE_KEY` (`geosentinel-internal-secret-token-2026`) protecting backend-to-AI communication.
- **Zero Cloud Key Managers**: No AWS Secrets Manager, GCP Secret Manager, or HashiCorp Vault cloud services are utilized.
- **Zero Telemetry**: No third-party tracking, Google Analytics, PostHog, or Sentry tokens exist.

---

## 5. Verification Certification

I hereby certify that an exhaustive code scan has been conducted across all project files:
- Zero references to payment gateways (Stripe, PayPal, Razorpay).
- Zero credit-card or billing prompts.
- Zero mandatory cloud dependencies.
- Zero paid API keys in source code, configuration files, or test suites.

**Audit Status**: **PASSED (100% Zero-Cost Compliant)**.
