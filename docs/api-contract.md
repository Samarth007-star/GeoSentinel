# GeoSentinel — REST API Contract

> **Base Path**: `/api/v1`  
> **Protocol**: HTTPS / JSON  
> **Authentication**: `Authorization: Bearer <jwt_token>` (Optional on open research endpoints)  
> **Service-to-Service Header**: `X-Internal-Service-Key: <secret>` (Backend <-> AI Service)

---

## 1. Authentication & Identity (`/auth`, `/me`)

### `POST /api/v1/auth/register`
- **Request**:
  ```json
  {
    "email": "analyst@geosentinel.org",
    "password": "StrongPassword123!",
    "displayName": "Lead Geopolitical Analyst"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "userId": "usr_9b1deb4d",
    "email": "analyst@geosentinel.org",
    "displayName": "Lead Geopolitical Analyst",
    "roles": ["ROLE_ANALYST"],
    "createdAt": "2026-09-25T12:00:00Z"
  }
  ```

### `POST /api/v1/auth/login`
- **Request**:
  ```json
  {
    "email": "analyst@geosentinel.org",
    "password": "StrongPassword123!"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "userId": "usr_9b1deb4d",
      "email": "analyst@geosentinel.org",
      "displayName": "Lead Geopolitical Analyst",
      "roles": ["ROLE_ANALYST"]
    }
  }
  ```

### `GET /api/v1/me`
- **Response** `200 OK`: Current authenticated user profile and roles.

---

## 2. Sessions (`/sessions`)

### `POST /api/v1/sessions`
- **Request**:
  ```json
  {
    "title": "US-Iran Escalation Assessment",
    "initialGeographies": ["IND", "IRN", "USA"]
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "sessionId": "ses_4a2c89f1",
    "title": "US-Iran Escalation Assessment",
    "status": "ACTIVE",
    "createdAt": "2026-09-25T12:05:00Z",
    "expiresAt": "2026-09-25T14:05:00Z"
  }
  ```

### `DELETE /api/v1/sessions/{id}`
- **Response** `204 No Content`: Immediately cleans up and deletes all session-scoped temporary datasets, graphs, and cached evidence.

---

## 3. Analysis Questions & Pipeline Runs (`/sessions/{id}/questions`, `/analysis-runs/{id}`)

### `POST /api/v1/sessions/{sessionId}/questions`
- **Request**:
  ```json
  {
    "question": "What could be the effects on India if US-Iran tensions escalate?",
    "timeHorizon": "30d",
    "geographies": ["IND", "IRN", "USA"],
    "includeCategories": ["government", "international", "economic", "news", "conflict"],
    "refreshEvidence": false
  }
  ```
- **Response** `202 Accepted` or `200 OK`:
  ```json
  {
    "questionId": "q_7f81b3e0",
    "sessionId": "ses_4a2c89f1",
    "analysisRunId": "run_0c94da82",
    "status": "COMPLETED",
    "answer": {
      "currentSituation": {
        "summary": "Recent military and diplomatic posturing between the US and Iran in the Persian Gulf has increased shipping risk premiums in the Strait of Hormuz.",
        "asOf": "2026-09-25T12:00:00Z",
        "verifiedFacts": [
          "Crude oil shipping insurance premiums through Strait of Hormuz rose by 14% over the past 14 days."
        ],
        "unverifiedClaims": [
          "Unconfirmed reports of commercial vessel harassment in regional waters."
        ]
      },
      "relevantEvidence": [
        {
          "evidenceId": "ev_10283",
          "sourceName": "World Bank Energy Indicators",
          "sourceUrl": "https://api.worldbank.org/v2/country/IND/indicator/EG.IMP.CONS.ZS",
          "publishedDate": "2026-01-15T00:00:00Z",
          "retrievalDate": "2026-09-25T10:00:00Z",
          "verificationStatus": "VERIFIED",
          "relevance": "India imports >80% of crude requirements, with ~60% transiting the Strait of Hormuz.",
          "conflictsOrLimitations": "Annual indicator reporting lag of 6 months."
        }
      ],
      "impactAnalysis": [
        {
          "sector": "Energy & Inflation",
          "pathway": "Strait of Hormuz disruption -> Crude Brent increase -> Indian OMCs pass through costs -> WPI/CPI uptick.",
          "horizon": "15-45 days",
          "directImpact": "Increased import bill, pressure on Indian Rupee (INR).",
          "indirectImpact": "Fertilizer subsidy burden increases, domestic logistics tariffs escalate.",
          "affectedPopulations": ["Domestic consumers", "Commercial freight operators", "Fertilizer manufacturers"],
          "uncertainty": "HIGH (dependent on duration of naval friction)"
        }
      ],
      "strategyRecommendations": [
        {
          "optionId": "opt_01",
          "title": "Strategic Petroleum Reserve (SPR) Diversification & Currency Bilaterals",
          "objective": "Buffer short-term supply crunch and mitigate USD exchange rate volatility.",
          "mechanism": "Tap existing commercial/strategic reserves in Padur and Mangalore while settling non-Hormuz cargoes in local currencies.",
          "prerequisites": ["Emergency drawdown protocol activation", "Bilateral rupee settlement agreement with non-Gulf supplier"],
          "benefits": ["Secures 21-day domestic oil cushion", "Dampens sudden retail fuel spike"],
          "tradeoffs": ["Depletes strategic reserves intended for severe military crisis", "Carries inventory replacement price risk"],
          "riskReview": {
            "reviewStatus": "APPROVED_WITH_LIMITATIONS",
            "findings": "Feasible for 30-day horizon; requires immediate pre-positioning of replacement contracts.",
            "unintendedConsequences": ["Depletion leaves zero buffer if conflict expands into second quarter."],
            "requiredMitigations": ["Cap SPR drawdown at 30% of stored volume.", "Simultaneously hedge future delivery via West African suppliers."],
            "residualRisk": "Persistent high oil prices over 90 days cannot be solved by SPR alone."
          },
          "fallbackOption": "Mandatory industrial fuel rationing and subsidy reallocation."
        }
      ],
      "confidenceRationale": "High confidence on India energy dependency ratios based on World Bank data; medium confidence on conflict escalation timeline.",
      "limitations": [
        "Real-time Gulf naval movements rely on public AIS signals and news wires.",
        "ACLED real-time conflict data excluded under zero-paid-API compliance."
      ]
    },
    "completedAt": "2026-09-25T12:05:08Z"
  }
  ```

---

## 4. Source & Connector Registry (`/sources`, `/admin/sources`)

### `GET /api/v1/sources`
- Lists all registered connectors, their categories, terms review status (`APPROVED`, `LICENSE_CHECK`, `DISABLED`), and operational health.

### `POST /api/v1/admin/sources/{id}/health-check`
- Triggers a live latency, status, and schema validation ping for the selected connector.

---

## 5. Master Data CRUD (`/countries`, `/events`, `/news`, `/organizations`, `/evidence`)

Full standard REST operations (`GET`, `POST`, `PUT`, `DELETE`) with pagination parameters (`page`, `size`, `sort`) and search filters (`q`, `category`, `country`).
