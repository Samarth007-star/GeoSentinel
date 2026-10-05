import httpx
import time

print("Waiting 10 seconds to clear GDELT IP throttle window...")
time.sleep(10)

url = "https://api.gdeltproject.org/api/v2/doc/doc?query=India%20oil&mode=artlist&maxrecords=5&format=json"
headers = {
    "User-Agent": "GeoSentinel/1.0 (Academic Research; contact@geosentinel.org)",
    "Accept": "*/*"
}
try:
    r = httpx.get(url, headers=headers, timeout=20.0)
    print("GDELT Status:", r.status_code)
    if r.status_code == 200:
        data = r.json()
        articles = data.get("articles", [])
        print("Total articles returned:", len(articles))
        for i, a in enumerate(articles[:3]):
            title = a.get("title", "").encode("ascii", "replace").decode("ascii")
            print(f"[{i+1}] {title} | {a.get('domain')} | {a.get('url')}")
    else:
        print("Response body snippet:", r.text[:200])
except Exception as e:
    print("Error:", str(e))
