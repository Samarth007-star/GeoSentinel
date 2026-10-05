import httpx
import json

def test_gdelt_success():
    url = "https://api.gdeltproject.org/api/v2/doc/doc?query=India%20oil&mode=artlist&maxrecords=5&format=json"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*"
    }
    r = httpx.get(url, headers=headers, timeout=15.0)
    print("GDELT Status:", r.status_code)
    if r.status_code == 200:
        data = r.json()
        articles = data.get("articles", [])
        print("Total articles returned:", len(articles))
        for i, a in enumerate(articles[:3]):
            title_clean = a.get("title", "").encode("ascii", "replace").decode("ascii")
            print(f"[{i+1}] Title: {title_clean}")
            print(f"    URL: {a.get('url')}")
            print(f"    Domain: {a.get('domain')}")
            print(f"    SeenDate: {a.get('seendate')}")
            print(f"    Language: {a.get('language')}")

if __name__ == "__main__":
    test_gdelt_success()
