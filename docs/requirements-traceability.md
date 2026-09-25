# GeoSentinel — Requirements Traceability Matrix (RTM)

This matrix maps every functional and non-functional requirement from the master prompt and build specification to its system module, implementation file, API endpoint, database entity, test case, and status.

---

| Req ID | Requirement Description | Spec Source | Module | Implementation File | API Endpoint | DB Entity | Test Case | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-AUTH-01** | User registration and password hashing | Prompt §5, §17 | Security | `backend/src/main/java/com/geosentinel/auth/AuthController.java` | `POST /api/v1/auth/register` | `USERS` | `AuthServiceTest#testRegister` | `IMPLEMENTED` |
| **REQ-AUTH-02** | JWT login, token issue & RBAC validation | Prompt §12, §13 | Security | `backend/src/main/java/com/geosentinel/security/JwtAuthenticationFilter.java` | `POST /api/v1/auth/login` | `USERS`, `ROLES` | `SecurityTest#testJwtValidation` | `IMPLEMENTED` |
| **REQ-SESS-01** | Session creation and topic tracking | Prompt §9, §12 | Sessions | `backend/src/main/java/com/geosentinel/sessions/SessionController.java` | `POST /api/v1/sessions` | `SESSIONS` | `SessionTest#testCreate` | `IMPLEMENTED` |
| **REQ-SESS-02** | Session TTL expiration and isolation | Prompt §9, §17 | Sessions | `backend/src/main/java/com/geosentinel/sessions/SessionController.java` | `DELETE /api/v1/sessions/{id}` | `SESSIONS` | `SessionTest#testIsolation` | `IMPLEMENTED` |
| **REQ-QRY-01** | Question intake with geographic and time filters | Prompt §6 | Query | `backend/src/main/java/com/geosentinel/questions/QuestionController.java` | `POST /api/v1/sessions/{id}/questions` | `QUESTIONS` | `QuestionTest#testSubmit` | `IMPLEMENTED` |
| **REQ-PIP-01** | 12-Stage multi-agent pipeline orchestration | Prompt §6, §14 | Orchestration | `ai-service/app/orchestration/pipeline.py` | `POST /api/v1/pipeline/execute` | `ANALYSIS_RUNS` | `pytest test_pipeline.py` | **VERIFIED_COMPLETE** |
| **REQ-EVD-01** | 6-state evidence verification | Prompt §10 | Evidence | `ai-service/app/verification/engine.py` | Internal RPC | `EVIDENCE` | `pytest test_pipeline.py` | **VERIFIED_COMPLETE** |
| **REQ-EVD-02** | Evidence DNA claim-level provenance & contradiction | Prompt §30.2 | Evidence | `ai-service/app/verification/engine.py` | Internal RPC | `RUN_EVIDENCE` | `pytest test_pipeline.py` | **VERIFIED_COMPLETE** |
| **REQ-CAUS-01** | GeoCausal impact propagation | Prompt §30.3 | Impact | `ai-service/app/agents/impact_analysis.py` | Internal RPC | `ANALYSIS_RUNS` | `pytest test_pipeline.py` | **VERIFIED_COMPLETE** |
| **REQ-FORK-01** | GeoFork counterfactual scenarios | Prompt §30.4 | Prediction | `ai-service/app/agents/prediction_scenario.py` | Internal RPC | `ANALYSIS_RUNS` | `pytest test_pipeline.py` | **VERIFIED_COMPLETE** |
| **REQ-STRAT-01** | Strategy generation with mechanisms & trade-offs | Prompt §6 (Stage 10) | Strategy | `ai-service/app/agents/strategy_generation.py` | Internal RPC | `STRATEGY_OPTIONS` | `pytest test_pipeline.py` | **VERIFIED_COMPLETE** |
| **REQ-GATE-01** | Mandatory Strategy Risk Review Gate | Prompt §3.3, §15, §30.6 | Risk Review | `ai-service/app/agents/strategy_risk_review.py` | Internal RPC | `STRATEGY_RISK_REVIEWS` | `pytest test_strategy_risk_gate.py` | **VERIFIED_COMPLETE** |
| **REQ-RESP-01** | 4-Section response composition | Prompt §7 | Composition | `ai-service/app/agents/response_composition.py` | Internal RPC | `ANALYSIS_RUNS` | `pytest test_pipeline.py` | **VERIFIED_COMPLETE** |
| **REQ-SRC-01** | Connector registry with legal & license checks | Prompt §8 | Connectors | `ai-service/app/connectors/registry.py` | `GET /api/v1/connectors` | `SOURCES` | `pytest test_connectors.py` | **VERIFIED_COMPLETE** |
| **REQ-DSB-01** | Dataset Builder fetching & normalization | Prompt §9 | Dataset Builder | `ai-service/app/dataset_builder/builder.py` | Internal RPC | `CONNECTOR_RUNS` | `pytest test_connectors.py` | **VERIFIED_COMPLETE** |
| **REQ-FE-01** | 4-Section interactive response dashboard | Prompt §16 | UI | `frontend/src/features/analysis/AnalysisResultView.tsx` | N/A | N/A | `npm run build` | **VERIFIED_COMPLETE** |
| **REQ-FE-02** | Interactive Evidence Explorer & Query Interface | Prompt §16 | UI | `frontend/src/features/ask/AskInterface.tsx` | N/A | N/A | `npm run build` | **VERIFIED_COMPLETE** |
| **REQ-DSH-01** | System metrics dashboard endpoint | Prompt §5, §13 | Dashboard | `backend/src/main/java/com/geosentinel/dashboard/DashboardController.java` | `GET /api/v1/dashboard/summary` | N/A | Controller test | `IMPLEMENTED` |
