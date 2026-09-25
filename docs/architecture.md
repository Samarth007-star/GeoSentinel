# GeoSentinel — System Architecture Specification

> **Classification**: Multi-Tier Decoupled AI Decision-Support System  
> **Reference**: Approved System Build Specification v1.0 & Master Prompt

---

## 1. High-Level Component Topology

```text
┌────────────────────────────────────────────────────────┐
│                   React 18 + Vite UI                   │
│   (4-Section Answer, Evidence Explorer, Strategy View) │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / JWT (/api/v1)
┌───────────────────────────▼────────────────────────────┐
│              Spring Boot 3.x Backend API                │
│    (Security, RBAC, Sessions, CRUD, Audit Logging)     │
└─────────────┬────────────────────────────┬─────────────┘
              │ JDBC                       │ Internal REST (X-Internal-Service-Key)
┌─────────────▼──────────────┐ ┌───────────▼─────────────┐
│    MySQL 8.x Database      │ │ Python FastAPI AI Service│
│ (System of Record & Graph) │ │ (12-Stage Agent Pipeline)│
└────────────────────────────┘ └───────────┬─────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │ Free Public APIs (No Paid Services) │
                        │  - World Bank Indicators            │
                        │  - USGS Earthquakes / Hazards       │
                        │  - NASA EONET Disaster Feeds        │
                        │  - GDELT Global Events & News       │
                        │  - OONI & IODA Network Signals      │
                        │  - UN OCHA ReliefWeb                │
                        └─────────────────────────────────────┘
```

---

## 2. Tier Responsibilities & Service Contracts

### Tier 1: Presentation (React 18 + TypeScript + Vite + Tailwind CSS)
- **Role**: Rich, responsive, dark-mode analytical console.
- **Visual Design**: Curated dark blue/slate palette (`#070b14`), glassmorphism, Google Fonts (`Inter` & `Outfit`), and clear badge taxonomy for evidence and risk reviews.
- **Security Boundary**: Never handles private database credentials, LLM keys, or internal shared keys. All traffic routes through `/api/v1`.

### Tier 2: Application System of Record (Spring Boot 3.x / Java 21)
- **Role**: Secure gateway, authentication, role-based authorization (`ROLE_ADMIN`, `ROLE_ANALYST`, `ROLE_VIEWER`), session management, relational CRUD, and audit logging.
- **Database Migrations**: Versioned Flyway migrations (`V1__initial_schema.sql`).
- **Data Protection**: BCrypt password hashing, stateless JWT verification with strict expiry, session-scoped data isolation, and log redaction.

### Tier 3: Multi-Agent AI Orchestration (Python 3.11+ / FastAPI / Pydantic v2)
- **Role**: Executes the canonical 12-stage analytical pipeline.
- **Internal Interface**: Private HTTP port 8000 authenticated via `X-Internal-Service-Key`.
- **Pipeline Components**:
  - `QuestionUnderstandingAgent` (Stages 1-3)
  - `RetrievalPlanningAgent` (Stage 4)
  - `DatasetBuilder` (Stage 5)
  - `EvidenceVerificationEngine` & Evidence DNA (Stage 6)
  - `ContextBuilderAgent` (Stage 7)
  - `ImpactAnalysisAgent` & GeoCausal Engine (Stage 8)
  - `PredictionScenarioAgent` & GeoFork Laboratory (Stage 9)
  - `StrategyGenerationAgent` (Stage 10)
  - `StrategyRiskReviewAgent` & Mandatory Red-Team Gate (Stage 11)
  - `ResponseCompositionAgent` (Stage 12)

---

## 3. Data Flow & Provenance Lifecycle

1. **Intake**: User submits question with target geographies and time horizon.
2. **Planning**: Retrieval plan identifies required data categories and bounds.
3. **Execution**: Eligible public connectors fetch open telemetry with exponential backoff and timeouts.
4. **DNA Stamping**: Every record receives SHA-256 content hash, timestamp, provider license, and canonical verification state.
5. **Causal Graphing**: GeoCausal constructs causal chains from external events to domestic sectors.
6. **Scenario Branching**: GeoFork generates comparative conditional branches without fake probabilities.
7. **Mandatory Red-Team Gate**: Strategy options are audited for second-order harm, escalation, and equity. Unreviewed options are withheld.
8. **Composition**: The verified 4-section answer is composed and returned to the client.
