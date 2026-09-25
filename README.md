# GeoSentinel: Multi-Agent AI Global Event Intelligence & Impact Prediction

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Spring Boot 3.x](https://img.shields.io/badge/Spring%20Boot-3.x-green.svg)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python%203.11+-teal.svg)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18%20TypeScript-blue.svg)](https://react.dev)

GeoSentinel is an evidence-grounded AI decision-support research application that retrieves authorized public global event data, verifies source provenance, evaluates geopolitical/economic/infrastructure impacts through causal graphs, explores conditional scenarios, and produces explainable strategy options with mandatory, independent risk review.

---

## 🏛️ System Architecture

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

## 🚀 Canonical 12-Stage Question Pipeline

1. **Question Intake**: Validates scope, requested time horizon, and target geographies.
2. **Intent Understanding**: Classifies intent (situational summary, impact pathway, scenario, option comparison).
3. **Entity Extraction**: Resolves countries, organizations, sectors, and platforms.
4. **Retrieval Planning**: Produces a bounded Data Requirement Plan.
5. **Dataset Builder**: Queries eligible, free public connectors and caches session artifacts.
6. **Evidence Verification**: Categorizes into 6 canonical states (`VERIFIED`, `CROSS_CHECKED`, `SOURCE_REFERENCED`, `UNVERIFIED`, `CONFLICTING`, `REJECTED`).
7. **Context Builder**: Isolates session-scoped factual claims and evidence pointers.
8. **Impact Analysis (GeoCausal)**: Constructs evidence-backed impact propagation chains.
9. **Conditional Prediction (GeoFork)**: Simulates assumptions and alternative branch scenarios.
10. **Strategy Generation**: Proposes mitigation and decision-support options.
11. **Mandatory Strategy Risk Review**: Independent red-team gate checking second-order harm, escalation, and equity.
12. **Explainability & 4-Section Composition**: Generates validated 4-section answer.

---

## 🛡️ Non-Negotiable Project Principles

- **Zero Paid Data APIs**: No subscriptions, no paid keys, no premium tiers.
- **No Fabricated Evidence**: Every material claim references verifiable records with timestamps.
- **Mandatory Strategy Review Gate**: Unreviewed strategies are structurally withheld.
- **Session Isolation**: Bounded 120-minute TTL with explicit cleanup.

---

## 💻 Quick Start & Local Execution (Native Windows)

No Docker required. Run services directly using installed runtimes:

### 1. Launch Everything via PowerShell
```powershell
./scripts/development/run_all_local.ps1
```

### 2. Or Run Services Manually:
- **Python AI Microservice**:
  ```powershell
  cd ai-service
  python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  ```
- **Spring Boot Backend**:
  ```powershell
  cd backend
  java -jar target\geosentinel-backend-1.0.0.jar
  # Or: .\mvnw.cmd spring-boot:run
  ```
- **React Frontend**:
  ```powershell
  cd frontend
  npm run dev
  ```
- Access Frontend UI at `http://localhost:5173`.
- Access Backend API & Swagger at `http://localhost:8080/swagger-ui.html`.
- Access AI Service docs at `http://localhost:8000/docs`.
