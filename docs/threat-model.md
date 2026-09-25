# GeoSentinel — STRIDE Threat Model & Security Controls

> **Compliance Requirement**: Section 17 of Master Autonomous Development Prompt.  
> **Rule**: Treat all retrieved external content as untrusted input. Protect against prompt injection, SSRF, credential leakage, and unauthorized access.

---

## 1. STRIDE Threat Analysis Matrix

| Threat Category | Potential Attack Vector | GeoSentinel Security Control | Verification Test |
| :--- | :--- | :--- | :--- |
| **Spoofing** | Forged user identity or fake service caller | JWT validation on public endpoints; `X-Internal-Service-Key` on internal AI endpoints. | `SecurityTest#testUnauthorizedRejection` |
| **Tampering** | Modification of retrieved evidence records or fabricated sources | SHA-256 content hashing (`compute_content_hash`) and immutable evidence timestamps. | `pytest test_connectors.py::test_base_connector_content_hash` |
| **Repudiation** | Denying an administrative change to connector settings | Tamper-evident `audit_logs` table recording actor ID, IP, action, and redacted payload. | `AuditServiceTest#testAuditLogIntegrity` |
| **Information Disclosure** | Leakage of API tokens, database passwords, or private prompts | Secrets restricted to backend `.env`; zero credential injection in frontend bundle; log redaction. | Static scan of frontend source for token patterns. |
| **Denial of Service** | Upstream API hung connections or oversized payload flooding | 8-second read timeout, max 5MB payload limit, circuit breaker tripping after 5 failures. | `ConnectorTest#testTimeoutEnforcement` |
| **Elevation of Privilege** | Normal user calling administrative connector toggle endpoints | Spring Security `@PreAuthorize("hasRole('ADMIN')")` enforced server-side. | `RbacTest#testAdminEndpointProtection` |

---

## 2. Specific AI & LLM Threat Defenses

### 1. Prompt Injection Defenses
- External content retrieved from public feeds (news, reports) is treated as pure untrusted text data.
- Retrieved data is wrapped in structured JSON data nodes and never concatenated directly as system instruction overrides.

### 2. SSRF (Server-Side Request Forgery) Prevention
- Outbound connector queries are restricted strictly to the allowlisted domains in `docs/data-source-register.md`.
- Requests to `localhost`, `127.0.0.1`, private IP blocks (`10.0.0.0/8`, `192.168.0.0/16`), or cloud metadata endpoints (`169.254.169.254`) are structurally rejected.

### 3. Strategy Safety Gate (Red-Team)
- Prevents the system from outputting unchecked, hazardous, or unmitigated policy advice.
- Enforced at Stage 11 by `StrategyRiskReviewAgent`.
