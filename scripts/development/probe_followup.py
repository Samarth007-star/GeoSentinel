import httpx
import time

def test_followup():
    client = httpx.Client(timeout=10.0, follow_redirects=True)
    
    # 1. Test RestCountries with redirect
    try:
        r = client.get("https://restcountries.com/v3.1/alpha/IND", headers={"User-Agent": "GeoSentinel/1.0"})
        print(f"RestCountries: HTTP {r.status_code}, name: {r.json()[0]['name']['common'] if r.status_code == 200 else 'N/A'}")
    except Exception as e:
        print("RestCountries error:", e)

    # 2. Wait 6 seconds for GDELT rate limit
    print("Waiting 6 seconds for GDELT rate limit...")
    time.sleep(6)

    # 3. Test GDELT DOC 2.0 for News
    try:
        r = client.get("https://api.gdeltproject.org/api/v2/doc/doc?query=India%20trade&mode=artlist&format=json&maxrecords=3", headers={"User-Agent": "GeoSentinel/1.0"})
        print(f"GDELT DOC News: HTTP {r.status_code}, length: {len(r.text)}")
        if r.status_code == 200:
            data = r.json()
            articles = data.get("articles", [])
            print(f"GDELT DOC returned {len(articles)} articles. Sample title: {articles[0].get('title') if articles else 'None'}")
    except Exception as e:
        print("GDELT DOC News error:", e)

    # 4. Wait 6 seconds
    print("Waiting 6 seconds...")
    time.sleep(6)

    # 5. Test GDELT DOC for Conflict & Political Events
    try:
        r = client.get("https://api.gdeltproject.org/api/v2/doc/doc?query=conflict%20OR%20military%20OR%20sanctions&mode=artlist&format=json&maxrecords=3", headers={"User-Agent": "GeoSentinel/1.0"})
        print(f"GDELT Conflict/Political: HTTP {r.status_code}, length: {len(r.text)}")
        if r.status_code == 200:
            data = r.json()
            articles = data.get("articles", [])
            print(f"GDELT Conflict returned {len(articles)} articles. Sample title: {articles[0].get('title') if articles else 'None'}")
    except Exception as e:
        print("GDELT Conflict error:", e)

    # 6. Test GDELT 15-minute event stream update feed
    try:
        r = client.get("http://data.gdeltproject.org/gdeltv2/lastupdate.txt", headers={"User-Agent": "GeoSentinel/1.0"})
        print(f"GDELT Event Stream lastupdate.txt: HTTP {r.status_code}, sample: {r.text[:120].replace(chr(10), ' ')}")
    except Exception as e:
        print("GDELT Event Stream error:", e)

    # 7. Test OONI API for Public Social / Internet signals
    try:
        r = client.get("https://api.ooni.io/api/v1/aggregation?probe_cc=IN&since=2024-01-01&until=2024-01-05", headers={"User-Agent": "GeoSentinel/1.0"})
        print(f"OONI Aggregation: HTTP {r.status_code}, length: {len(r.text)}")
    except Exception as e:
        print("OONI error:", e)

if __name__ == "__main__":
    test_followup()
