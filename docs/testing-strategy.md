# GeoSentinel — Testing & Research Validation Strategy

> **Compliance Requirement**: Section 19, 21, and 27 of Master Autonomous Development Prompt.  
> **Rule**: Software correctness and research validity are distinct. Never fabricate benchmark metrics or test outcomes.

---

## 1. Testing Pyramid

```text
               ▲
              / \
             /E2E\       End-to-End Pipeline & UI Workflows
            /-----\
           / Integ \     FastAPI RPC, Spring Boot JPA, DB Migrations
          /---------\
         /   Unit    \   Evidence DNA, Connectors, Risk Gate, Schemas
        /─────────────\
```

---

## 2. Test Suites & Execution Commands

| Suite Name | Scope | Execution Command | Criteria |
| :--- | :--- | :--- | :--- |
| **Suite 0: Environment** | Runtimes & local DB discovery | `powershell` commands | Java, Python, Node, MySQL detected |
| **Suite 1: AI Pipeline** | 12 stages, Evidence DNA, Risk Gate | `python -m pytest ai-service/tests/ -v` | All 4 tests pass, zero warnings |
| **Suite 2: Connectors** | Open connector contracts & hashing | `python -m pytest ai-service/tests/test_connectors.py` | Validated terms and SHA-256 |
| **Suite 3: Risk Gate** | Mandatory Strategy Review Gate | `python -m pytest ai-service/tests/test_strategy_risk_gate.py` | Unreviewed strategies withheld |
| **Suite 4: Frontend** | TypeScript compilation & Vite build | `npm run build` in `frontend/` | Zero compilation errors |

---

## 3. Four Canonical Scenario Validations

The system evaluates four canonical scenario families:
1. **Scenario A**: Geopolitical escalation affecting India energy imports (Strait of Hormuz).
2. **Scenario B**: Infrastructure or internet disruption (OONI/IODA signals).
3. **Scenario C**: Natural disaster & geophysical shock (USGS/NASA EONET).
4. **Scenario D**: Commodity & international food supply friction (World Bank / ReliefWeb).
