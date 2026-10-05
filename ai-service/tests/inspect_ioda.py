import httpx
import json
import time

def inspect_ioda_timestamps():
    now = int(time.time())
    from_ts = now - 86400
    url = f"https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/country/IR?from={from_ts}&until={now}"
    r = httpx.get(url, timeout=15.0)
    print("IODA status with integer timestamps:", r.status_code)
    if r.status_code == 200:
        res = r.json()
        data = res.get("data", [])
        print("Data length:", len(data))
        if data and len(data) > 0 and len(data[0]) > 0:
            print("Series 0 meta:", res.get("metadata", {}))
            print("Series 0 points count:", len(data[0]))
            print("Series 0 first 3 points:", data[0][:3])
            
    # Also test IODA outages / events endpoint
    url_outages = f"https://api.ioda.inetintel.cc.gatech.edu/v2/outages/events?from={from_ts}&until={now}&limit=5"
    r_out = httpx.get(url_outages, timeout=15.0)
    print("IODA outages/events status:", r_out.status_code)
    if r_out.status_code == 200:
        out_res = r_out.json()
        print("Outages events keys:", out_res.keys() if isinstance(out_res, dict) else type(out_res))
        events = out_res.get("data", [])
        print("Events count:", len(events))
        if events:
            print("Sample event:", json.dumps(events[0], indent=2)[:400])

if __name__ == "__main__":
    inspect_ioda_timestamps()
