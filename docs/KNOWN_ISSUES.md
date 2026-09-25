# GeoSentinel — Known Limitations & Blocked Items

> **Compliance Requirement**: Section 20 & 28 of the Master Autonomous Development Prompt.  
> **Rule**: Report negative, inconclusive, and failed results honestly. Never conceal limitations.

---

## Active Limitations & Mitigations

1. **System Maven (`mvn`) CLI**:
   - *Status*: SYSTEM CLI ABSENT
   - *Detail*: Global `mvn` executable is not in system PATH.
   - *Mitigation*: The backend will include the Maven Wrapper (`mvnw` / `mvnw.cmd`) and the standard `pom.xml` so builds can execute portably without requiring manual installation of Maven.

2. **Docker CLI**:
   - *Status*: SYSTEM CLI ABSENT
   - *Detail*: Docker daemon/CLI is not running in the current Windows environment.
   - *Mitigation*: All services (FastAPI AI service, Spring Boot backend, Vite frontend, and MySQL database) are designed to run directly on the host system without requiring Docker containers, while providing `docker-compose.yml` for containerized environments.

3. **Restricted Social & Conflict Data Feeds (e.g., ACLED, Twitter API)**:
   - *Status*: COMPLIANCE RESTRICTION
   - *Detail*: ACLED and X/Twitter APIs require paid tiers or prohibit automated AI extraction under free terms.
   - *Mitigation*: Strictly omitted. Open feeds (GDELT, ReliefWeb, OONI, IODA, World Bank, USGS, NASA EONET) are used instead, and development fixtures are provided for offline test repeatability.
