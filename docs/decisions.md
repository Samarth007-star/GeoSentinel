# GeoSentinel Architecture Decision Records (ADRs)

This document records the foundational architectural decisions resolved for the GeoSentinel system.

---

## ADR-001: Relational Database Engine Selection

- **Status**: ACCEPTED
- **Context**: The master prompt identifies MySQL 8.0.40 and PostgreSQL as potential databases, requiring that one single engine be chosen consistently throughout the application without mixing dialects or migration scripts. In `GeoSentinel_Database_KG_Design_Specification.docx`, ADR-DB-01 explicitly locks MySQL 8.x as the primary relational database. Both MySQL 8.0 and PostgreSQL 18 are running on the local host.
- **Decision**: Select **MySQL 8.x** as the primary relational system of record, managed via standard Flyway migrations and Spring Data JPA. Additionally, maintain JPA portability so that dialect configurations can be adapted to PostgreSQL if requested.
- **Consequences**:
  - Relational schemas, indexing, foreign keys, and unique constraints are defined in MySQL 8 syntax (`utf8mb4`, JSON columns, foreign key constraints).
  - All migrations will be maintained under `backend/src/main/resources/db/migration/`.
  - Spring Boot uses `com.mysql:mysql-connector-j`.

---

## ADR-002: Knowledge Graph Architecture for Research MVP

- **Status**: ACCEPTED
- **Context**: GeoSentinel requires an event-centric, evidence-linked knowledge graph for tracking entities, events, evidence citations, and causal impact pathways. Full Neo4j requires dedicated JVM memory and Docker hosting which may not always be running during local tests.
- **Decision**: Implement a **Graph Repository Abstraction** (`KnowledgeGraphRepository`) backed primarily by a relational/in-memory adjacency index (`RelationalGraphRepository` / `NetworkXGraphService`) that provides node/edge traversal, path finding, and session isolation. Define a pluggable `Neo4jGraphRepository` adapter that can be activated via configuration when Neo4j is available.
- **Consequences**:
  - Zero mandatory requirement for external Neo4j instances to execute unit, integration, and E2E pipeline tests.
  - Full support for session-scoped temporary graphs with TTL-based eviction.

---

## ADR-003: AI Model Inference & Fallback Strategy

- **Status**: ACCEPTED
- **Context**: Principle 3.1 prohibits dependencies on paid LLM APIs (OpenAI, Anthropic, etc.). The system must run locally, reproduce scientific evaluations, and support open-source local models (e.g., via Ollama, llama.cpp, or Hugging Face Transformers) without breaking when GPU or local LLM server is offline.
- **Decision**: Implement a modular **Model Adapter Interface** (`ModelAdapter`) with:
  1. `LocalOllamaAdapter` for local open-source LLMs (e.g., Llama-3, Mistral, Qwen).
  2. `DeterministicRuleBasedFallback` for offline testing, CI environments, and reliable schema-validated fallback execution.
  3. Strict Pydantic schema validation on all agent outputs, ensuring that fallback responses strictly adhere to the 4-section response specification.
- **Consequences**:
  - The application is 100% runnable and testable out-of-the-box without requiring API keys or heavy GPU downloads.

---

## ADR-004: Authentication and Deployment Mode

- **Status**: ACCEPTED
- **Context**: Research environments require simple local onboarding while supporting multi-user role-based access control (RBAC) for analysts and administrators.
- **Decision**: Implement **Spring Security with JWT authentication** and BCrypt password hashing. Provide pre-seeded administrative and analyst roles:
  - `ROLE_ADMIN`: Connector management, source approval, audit logs, user management.
  - `ROLE_ANALYST`: Question execution, dataset exploration, strategy analysis, export.
  - `ROLE_VIEWER`: Read-only access to published reports and verified evidence.
  Include an optional anonymous research demo mode where a transient session ID is generated for zero-friction evaluation.
- **Consequences**:
  - Strong security boundaries at `/api/v1/admin/**` and user endpoints.
  - Passwords and tokens are never exposed to logs or the frontend.

---

## ADR-005: Backend-to-AI-Service Internal Communication

- **Status**: ACCEPTED
- **Context**: The Python FastAPI AI service contains the 12-stage multi-agent orchestration and must remain an internal service, inaccessible directly from the browser.
- **Decision**: Spring Boot communicates with FastAPI over an authenticated internal HTTP interface (`http://localhost:8000` or `http://ai-service:8000`) protected by an internal shared token (`X-Internal-Service-Key`).
- **Consequences**:
  - Frontend only talks to Spring Boot `/api/v1/**`.
  - Python agent endpoints are completely hidden from public access.

---

## ADR-006: Session-Scoped Temporary Datasets and Graph Isolation

- **Status**: ACCEPTED
- **Context**: Users submit questions that generate intermediate retrieval data, raw API payloads, and temporary graph nodes. Cross-session leakage must be prevented.
- **Decision**: Temporary datasets and graph projections are tagged with a unique `session_id`. Each session maintains a configurable Time-To-Live (`SESSION_TTL_MINUTES=120`). An explicit `DELETE /api/v1/sessions/{id}` cleans up all session-scoped temporary records.
- **Consequences**:
  - Zero cross-talk between user sessions.
  - Storage is bounded and clean.

---

## ADR-007: Mandatory Strategy Risk Review Gate

- **Status**: ACCEPTED
- **Context**: Prompt requirement 3.3 and Section 15 mandate that no strategy option can be presented as implementation-ready without an independent, blocking risk review for unintended consequences, escalation, and second-order harm.
- **Decision**: Implement `StrategyRiskReviewAgent` as an independent blocking pipeline stage (Stage 11) between Stage 10 (Strategy Generation) and Stage 12 (Response Composition). The Response Composer is structurally barred from publishing an unreviewed or failed strategy as approved.
- **Consequences**:
  - If review status is `REQUIRES_REVISION` or `REJECTED`, the strategy is either withheld or prominently qualified with clear warnings and missing mitigations.
  - Automated tests enforce that bypassing this gate causes pipeline failure.
