# GeoSentinel — Implementation Backlog

This backlog tracks every discrete implementation task in accordance with Section 20 of the master prompt.

---

## Status Legend
- `NOT_STARTED`
- `IN_PROGRESS`
- `IMPLEMENTED`
- `TESTING`
- `PASSED`
- `BLOCKED`
- `NEEDS_REVIEW`

---

## Phase 0: Foundations & Architecture Decisions

| Task ID | Requirement Ref | Description | Priority | Dependencies | Status | Files Involved |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-001** | REQ-DOC-01 | Read & extract authoritative specifications (DOCX & Prompt.md) | P0 | None | **PASSED** | `Prompt.md`, `docs/system-build-spec.md` |
| **TSK-002** | REQ-ENV-01 | Validate local environment runtimes (Java, Python, Node, MySQL, Postgres) | P0 | None | **PASSED** | Local CLI probes |
| **TSK-003** | REQ-ADR-01 | Formulate and document ADRs (MySQL 8, Graph Abstraction, Local AI, RBAC) | P0 | TSK-001 | **PASSED** | `docs/decisions.md` |
| **TSK-004** | REQ-RTM-01 | Create Requirements Traceability Matrix connecting requirements to code & tests | P0 | TSK-001 | **PASSED** | `docs/requirements-traceability.md` |
| **TSK-005** | REQ-API-01 | Specify unified REST API Contract (`/api/v1`) across frontend, backend, AI | P0 | TSK-001 | **PASSED** | `docs/api-contract.md` |
| **TSK-006** | REQ-SRC-01 | Define Source & Connector Registry with legal review and license criteria | P0 | TSK-001 | **PASSED** | `docs/data-source-register.md` |
| **TSK-007** | REQ-DIR-01 | Scaffold project directory layout (backend, frontend, ai-service, data, docs) | P0 | TSK-003 | **PASSED** | Full repo tree |

---

## Phase 1: Backend Foundations (Spring Boot 3.x)

| Task ID | Requirement Ref | Description | Priority | Dependencies | Status | Files Involved |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-010** | REQ-BE-01 | Scaffold Spring Boot 3.x project with Maven wrapper, dependencies, config | P0 | TSK-007 | **PASSED** | `backend/pom.xml`, `mvnw.cmd` |
| **TSK-011** | REQ-DB-01 | Create Flyway migrations for all relational entities (Users, Evidence, etc.) | P0 | TSK-010 | **PASSED** | `backend/src/main/resources/db/migration/V1__initial_schema.sql` |
| **TSK-012** | REQ-SEC-01 | Implement Spring Security, JWT authentication, and RBAC filters | P0 | TSK-011 | **PASSED** | `backend/src/main/java/com/geosentinel/security/` |
| **TSK-013** | REQ-API-02 | Implement CRUD REST controllers with validation envelopes and error handling | P1 | TSK-012 | **PASSED** | `backend/src/main/java/com/geosentinel/.../` |
| **TSK-014** | REQ-SVC-01 | Implement internal AI service client with HMAC/token authentication | P0 | TSK-012 | **PASSED** | `backend/src/main/java/com/geosentinel/client/AiServiceClient.java` |

---

## Phase 2: AI Service Foundations (FastAPI & Agent Framework)

| Task ID | Requirement Ref | Description | Priority | Dependencies | Status | Files Involved |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-020** | REQ-AI-01 | Scaffold FastAPI application with Pydantic v2 schemas and health endpoints | P0 | TSK-007 | **PASSED** | `ai-service/app/main.py`, `ai-service/app/schemas/models.py` |
| **TSK-021** | REQ-AI-02 | Implement Model Adapter interface and Deterministic Fallback generator | P0 | TSK-020 | **PASSED** | `ai-service/app/orchestration/pipeline.py` |
| **TSK-022** | REQ-AI-03 | Build Graph Service abstraction with session-isolated in-memory traversal | P1 | TSK-020 | **PASSED** | `ai-service/app/agents/impact_analysis.py` |

---

## Phase 3: Data Connectors & Dataset Builder

| Task ID | Requirement Ref | Description | Priority | Dependencies | Status | Files Involved |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-030** | REQ-CONN-01 | Implement BaseConnector interface with circuit breaker, rate limit, timeout | P0 | TSK-020 | **PASSED** | `ai-service/app/connectors/base.py` |
| **TSK-031** | REQ-CONN-02 | Implement World Bank Indicators connector with schema validation & terms check | P1 | TSK-030 | **PASSED** | `ai-service/app/connectors/world_bank.py` |
| **TSK-032** | REQ-CONN-03 | Implement USGS Earthquake / Hazard connector | P1 | TSK-030 | **PASSED** | `ai-service/app/connectors/usgs.py` |
| **TSK-033** | REQ-CONN-04 | Implement NASA EONET natural disaster connector | P1 | TSK-030 | **PASSED** | `ai-service/app/connectors/nasa_eonet.py` |
| **TSK-034** | REQ-CONN-05 | Implement UN OCHA ReliefWeb crisis connector | P1 | TSK-030 | **PASSED** | `ai-service/app/connectors/reliefweb.py` |
| **TSK-035** | REQ-DSB-01 | Implement Dataset Builder with entity resolution and provenance preservation | P0 | TSK-031 | **PASSED** | `ai-service/app/dataset_builder/builder.py` |

---

## Phase 4: Evidence DNA & Verification

| Task ID | Requirement Ref | Description | Priority | Dependencies | Status | Files Involved |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-040** | REQ-EVD-01 | Implement Evidence Verification Agent (canonical 6 verification states) | P0 | TSK-035 | **PASSED** | `ai-service/app/verification/engine.py` |
| **TSK-041** | REQ-EVD-02 | Implement Evidence DNA (claim-level provenance, contradiction engine) | P0 | TSK-040 | **PASSED** | `ai-service/app/verification/engine.py` |

---

## Phase 5: Canonical 12-Stage Pipeline & GeoCausal

| Task ID | Requirement Ref | Description | Priority | Dependencies | Status | Files Involved |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-050** | REQ-PIP-01 | Implement Pipeline Orchestrator executing Stages 1 through 12 sequentially | P0 | TSK-021 | **PASSED** | `ai-service/app/orchestration/pipeline.py` |
| **TSK-051** | REQ-PIP-02 | Implement Question Understanding & Intent Agent (Stages 1-3) | P0 | TSK-050 | **PASSED** | `ai-service/app/agents/question_understanding.py` |
| **TSK-052** | REQ-PIP-03 | Implement Retrieval Planning & Context Builder (Stages 4, 7) | P0 | TSK-050 | **PASSED** | `ai-service/app/agents/retrieval_planning.py`, `context_builder.py` |
| **TSK-053** | REQ-CAUS-01 | Implement GeoCausal Impact Propagation Engine (Stage 8) | P0 | TSK-052 | **PASSED** | `ai-service/app/agents/impact_analysis.py` |
| **TSK-054** | REQ-FORK-01 | Implement GeoFork Conditional Scenario Engine (Stage 9) | P1 | TSK-053 | **PASSED** | `ai-service/app/agents/prediction_scenario.py` |

---

## Phase 6: Strategy Generation & Mandatory Risk Gate

| Task ID | Requirement Ref | Description | Priority | Dependencies | Status | Files Involved |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-060** | REQ-STRAT-01 | Implement Strategy Recommendation Agent (Stage 10) | P0 | TSK-053 | **PASSED** | `ai-service/app/agents/strategy_generation.py` |
| **TSK-061** | REQ-GATE-01 | Implement Mandatory Independent Strategy Risk Review Gate (Stage 11 Red Team) | P0 | TSK-060 | **PASSED** | `ai-service/app/agents/strategy_risk_review.py` |
| **TSK-062** | REQ-RESP-01 | Implement Response Composition enforcing mandatory 4-section schema (Stage 12) | P0 | TSK-061 | **PASSED** | `ai-service/app/agents/response_composition.py` |

---

## Phase 7: Frontend Application (React + Vite + Tailwind)

| Task ID | Requirement Ref | Description | Priority | Dependencies | Status | Files Involved |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-070** | REQ-FE-01 | Scaffold React + Vite + Tailwind CSS frontend with TypeScript and Lucide | P0 | TSK-007 | **PASSED** | `frontend/package.json`, `frontend/vite.config.ts` |
| **TSK-071** | REQ-FE-02 | Implement Design System, Theme Tokens, Navigation, Layout | P0 | TSK-070 | **PASSED** | `frontend/src/components/layout/Navbar.tsx` |
| **TSK-072** | REQ-FE-03 | Implement Ask GeoSentinel Interactive Query Interface with filters & session | P0 | TSK-071 | **PASSED** | `frontend/src/features/ask/AskInterface.tsx` |
| **TSK-073** | REQ-FE-04 | Implement 4-Section Answer View (Situation, Evidence, Impact, Strategy Matrix) | P0 | TSK-072 | **PASSED** | `frontend/src/features/analysis/AnalysisResultView.tsx` |
| **TSK-074** | REQ-FE-05 | Implement Evidence Explorer and Provenance Tree | P1 | TSK-073 | **PASSED** | `frontend/src/features/analysis/AnalysisResultView.tsx` |
| **TSK-075** | REQ-FE-06 | Implement Source Registry, Connector Health, and Status Views | P1 | TSK-071 | **PASSED** | `frontend/src/features/connectors/ConnectorStatusView.tsx` |
