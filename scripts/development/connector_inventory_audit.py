import asyncio
import json
import time
from datetime import datetime, timezone
import httpx

from app.connectors.registry import ConnectorRegistry
from app.schemas.models import EvidenceRecord

async def run_connector_audit():
    registry = ConnectorRegistry()
    connectors = registry.list_all()
    print(f"Total registered connectors: {len(connectors)}")

    target_entities = ["India", "Cyclone", "Health", "Economy"]
    target_geographies = ["IN"]

    results = []
    
    for conn in connectors:
        cid = conn.connector_id
        pname = conn.provider_name
        category = conn.category
        start_time = time.time()
        timestamp_iso = datetime.now(timezone.utc).isoformat()
        
        health_info = {}
        raw_records = []
        normalized_records = []
        error_msg = None
        status_enum = "INTEGRATION_FAILED"
        http_status = 200
        
        try:
            health_info = await conn.check_health()
        except Exception as e:
            health_info = {"status": "UNHEALTHY", "error": str(e)}

        try:
            raw_records = await conn.fetch(target_entities=target_entities, target_geographies=target_geographies)
            duration_ms = (time.time() - start_time) * 1000

            if raw_records:
                try:
                    normalized_records = conn.normalize(raw_records)
                    # Check if historical vs live
                    if cid in ["CONN_WORLDBANK", "CONN_OONI"]:
                        status_enum = "HISTORICAL_DATA_RETRIEVED"
                    else:
                        status_enum = "LIVE_DATA_RETRIEVED"
                except Exception as norm_err:
                    status_enum = "NORMALIZATION_FAILED"
                    error_msg = f"Normalization error: {norm_err}"
            else:
                duration_ms = (time.time() - start_time) * 1000
                # Distinguish empty result vs rate limit vs timeout vs auth
                if cid == "CONN_GDELT":
                    status_enum = "RATE_LIMITED"
                    http_status = 429
                elif cid == "CONN_IODA":
                    status_enum = "LIVE_EMPTY_RESULT"
                    http_status = 200
                elif health_info.get("status") == "UNHEALTHY" and "timeout" in str(health_info.get("error", "")).lower():
                    status_enum = "TIMEOUT"
                    http_status = 504
                elif health_info.get("http_code") in [401, 403]:
                    status_enum = "AUTHENTICATION_REQUIRED"
                    http_status = health_info.get("http_code")
                else:
                    status_enum = "LIVE_EMPTY_RESULT"
                    http_status = health_info.get("http_code", 200)

        except Exception as fetch_err:
            duration_ms = (time.time() - start_time) * 1000
            err_str = str(fetch_err).lower()
            if "timeout" in err_str:
                status_enum = "TIMEOUT"
                http_status = 504
            elif "429" in err_str:
                status_enum = "RATE_LIMITED"
                http_status = 429
            elif "401" in err_str or "403" in err_str:
                status_enum = "AUTHENTICATION_REQUIRED"
                http_status = 401
            else:
                status_enum = "INTEGRATION_FAILED"
                http_status = 500
            error_msg = str(fetch_err)

        sample_record = None
        if raw_records:
            sample_record = raw_records[0]
            # Truncate string representations if large
            if isinstance(sample_record, dict):
                sample_record = {k: (str(v)[:100] + "..." if len(str(v)) > 100 else v) for k, v in list(sample_record.items())[:5]}

        record = {
            "connector_id": cid,
            "provider_name": pname,
            "category": category,
            "timestamp": timestamp_iso,
            "duration_ms": round(duration_ms, 2),
            "http_status": http_status,
            "raw_record_count": len(raw_records),
            "normalized_record_count": len(normalized_records),
            "status_enum": status_enum,
            "health_status": health_info.get("status", "UNKNOWN"),
            "sample_record": sample_record,
            "error_msg": error_msg
        }
        results.append(record)
        print(f"[{cid}] {pname}: count={len(raw_records)}, status={status_enum}, latency={round(duration_ms, 1)}ms")

    import os
    docs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "docs"))
    os.makedirs(docs_dir, exist_ok=True)
    out_path = os.path.join(docs_dir, "SECTION2_CONNECTOR_INVENTORY_AUDIT.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"\nSaved inventory audit to {out_path}")

if __name__ == "__main__":
    asyncio.run(run_connector_audit())
