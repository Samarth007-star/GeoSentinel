import time
import httpx

def test_wikidata_and_gdelt():
    print("Testing Wikidata SPARQL query...")
    # Country entity query in Wikidata
    sparql = """
    SELECT ?country ?countryLabel ?capitalLabel WHERE {
      VALUES ?country { wd:Q668 wd:Q794 wd:Q30 }
      OPTIONAL { ?country wdt:P36 ?capital. }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    """
    headers = {"User-Agent": "GeoSentinel/1.0 (Research AI Platform; contact@geosentinel.org)"}
    r = httpx.get("https://query.wikidata.org/sparql", params={"query": sparql, "format": "json"}, headers=headers, timeout=12.0)
    print("Wikidata status:", r.status_code)
    if r.status_code == 200:
        bindings = r.json().get("results", {}).get("bindings", [])
        print("Wikidata bindings count:", len(bindings))
        for b in bindings:
            print("Row:", {k: v.get("value") for k, v in b.items()})

    print("\nWaiting 10 seconds before testing GDELT to clear rate limit...")
    time.sleep(10)
    
    # Try GDELT 2.0 API with minimal query
    # Also test GDELT DOC API format
    url = "https://api.gdeltproject.org/api/v2/doc/doc?query=India&mode=artlist&maxrecords=5&format=json"
    headers_gdelt = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
    }
    r_g = httpx.get(url, headers=headers_gdelt, timeout=15.0)
    print("GDELT status:", r_g.status_code)
    if r_g.status_code == 200:
        articles = r_g.json().get("articles", [])
        print("GDELT articles count:", len(articles))
        if articles:
            print("GDELT sample:", articles[0].get("title"), articles[0].get("url"))
    else:
        print("GDELT text:", r_g.text[:200])

    # Also test GDELT event export or geo endpoint if doc is throttled
    print("\nTesting GDELT GEO 2.0 API...")
    url_geo = "https://api.gdeltproject.org/api/v2/geo/geo?query=India&format=geojson"
    time.sleep(5)
    r_geo = httpx.get(url_geo, headers=headers_gdelt, timeout=15.0)
    print("GDELT GEO status:", r_geo.status_code)
    if r_geo.status_code == 200:
        features = r_geo.json().get("features", [])
        print("GDELT GEO features count:", len(features))
        if features:
            print("GDELT GEO sample:", features[0].get("properties", {}).get("name"))

if __name__ == "__main__":
    test_wikidata_and_gdelt()
