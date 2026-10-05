import httpx
import json

def inspect_ooni():
    url = "https://api.ooni.io/api/v1/measurements?probe_cc=IR&limit=3"
    r = httpx.get(url, timeout=15.0)
    print("OONI status:", r.status_code)
    if r.status_code == 200:
        data = r.json()
        results = data.get("results", [])
        if results:
            print("OONI Sample Item:", json.dumps(results[0], indent=2))

if __name__ == "__main__":
    inspect_ooni()
