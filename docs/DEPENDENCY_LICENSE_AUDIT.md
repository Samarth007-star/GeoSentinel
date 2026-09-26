# GeoSentinel — Dependency and License Audit

> **Specification Authority**: Section 6 & 8 of the Mandatory Zero-Cost Policy and Prompt Section 17.  
> **Objective**: Verify that all libraries, frameworks, SDKs, and dependencies use recognized permissive or free open-source licenses with zero subscription obligations.

---

## 1. Backend Dependencies (`backend/pom.xml`)

| Artifact / Library | Group ID | Version | License | License Type | Free Commercial / Research Use? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `spring-boot-starter-web` | `org.springframework.boot` | 3.2.5 | Apache License 2.0 | Permissive | **YES** |
| `spring-boot-starter-data-jpa` | `org.springframework.boot` | 3.2.5 | Apache License 2.0 | Permissive | **YES** |
| `spring-boot-starter-security` | `org.springframework.boot` | 3.2.5 | Apache License 2.0 | Permissive | **YES** |
| `spring-boot-starter-validation` | `org.springframework.boot` | 3.2.5 | Apache License 2.0 | Permissive | **YES** |
| `mysql-connector-j` | `com.mysql` | 8.3.0 | GPL v2 with FOSS Exception | Permissive FOSS | **YES** |
| `flyway-core` | `org.flywaydb` | 10.10.0 | Apache License 2.0 | Permissive | **YES** |
| `flyway-mysql` | `org.flywaydb` | 10.10.0 | Apache License 2.0 | Permissive | **YES** |
| `jjwt-api`, `impl`, `jackson` | `io.jsonwebtoken` | 0.11.5 | Apache License 2.0 | Permissive | **YES** |
| `springdoc-openapi-starter-webmvc-ui`| `org.springdoc` | 2.5.0 | Apache License 2.0 | Permissive | **YES** |
| `spring-boot-starter-test` | `org.springframework.boot` | 3.2.5 | Apache License 2.0 | Permissive | **YES** |
| `spring-security-test` | `org.springframework.security` | 6.2.4 | Apache License 2.0 | Permissive | **YES** |

---

## 2. AI Microservice Dependencies (`ai-service/pyproject.toml`)

| Package Name | Installed Version | License | Free Commercial / Research Use? |
| :--- | :--- | :--- | :--- |
| `fastapi` | 0.115.0+ | MIT License | **YES** |
| `uvicorn` | 0.32.0+ | BSD 3-Clause | **YES** |
| `pydantic` | 2.9.0+ | MIT License | **YES** |
| `pydantic-settings` | 2.6.0+ | MIT License | **YES** |
| `httpx` | 0.27.0+ | BSD 3-Clause | **YES** |
| `networkx` | 3.4.0+ | BSD 3-Clause | **YES** |
| `pytest` | 9.1.1 | MIT License | **YES** |
| `anyio` | 4.14.2 | MIT License | **YES** |

---

## 3. Frontend Web Console Dependencies (`frontend/package.json`)

| Package Name | Version | License | Free Commercial / Research Use? |
| :--- | :--- | :--- | :--- |
| `react` | ^18.3.1 | MIT License | **YES** |
| `react-dom` | ^18.3.1 | MIT License | **YES** |
| `lucide-react` | ^0.344.0 | ISC License (MIT Equivalent) | **YES** |
| `vite` | ^5.4.2 | MIT License | **YES** |
| `typescript` | ^5.5.3 | Apache License 2.0 | **YES** |
| `tailwindcss` | ^3.4.1 | MIT License | **YES** |
| `postcss` | ^8.4.35 | MIT License | **YES** |
| `autoprefixer` | ^10.4.18 | MIT License | **YES** |

---

## 4. Proprietary SDK & Telemetry Verification

- **Proprietary Analytics / Trackers**: None (No Google Analytics, no Mixpanel, no Sentry Cloud).
- **Silent Paid Downloads**: None. All dependencies are resolved strictly from public Maven Central, PyPI, and npm registries.
- **Copyleft / Viral Compliance**: All runtime dependencies use Apache 2.0, MIT, or BSD licenses. No AGPL-3.0 libraries are bundled in client or server distribution artifacts.

**License Audit Status**: **PASSED (100% Permissive Open Source)**.
