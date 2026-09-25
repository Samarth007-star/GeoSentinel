# GeoSentinel Data Repository

> **Compliance Requirement**: Section 3.2 of Master Autonomous Development Prompt.  
> **Rule**: Strict separation between real verified research evidence and synthetic development fixtures. Never present mock or synthetic data as verified live research findings.

---

## Directory Organization

```text
data/
├── README.md
├── reference/        # Immutable reference datasets verified from official sources
│   ├── countries.csv
│   ├── economic_indicators.csv
│   ├── events.xlsx
│   ├── news.xlsx
│   ├── organizations.xlsx
│   ├── evidence.xlsx
│   ├── event_sources.xlsx
│   ├── entity_relationships.xlsx
│   └── users_demo.xlsx
├── raw/              # Raw payloads fetched from external APIs (temporary / cached)
├── processed/        # Normalized, deduplicated, and entity-resolved records
└── synthetic_demo/   # Strictly labeled fixtures for unit tests and offline demos
```

---

## Provenance Standard

Every record stored in `data/processed/` must contain:
1. `record_id`: Unique identifier (e.g., `ev_wb_ind_gdp_2026`).
2. `source_id`: Source identifier corresponding to `docs/data-source-register.md`.
3. `source_url`: Verifiable URL or official publication identifier.
4. `retrieval_timestamp`: ISO 8601 UTC timestamp of retrieval.
5. `verification_status`: Canonical state (`VERIFIED`, `CROSS_CHECKED`, `SOURCE_REFERENCED`, `UNVERIFIED`, `CONFLICTING`, `REJECTED`).
6. `content_hash`: SHA-256 hash of raw payload content.
