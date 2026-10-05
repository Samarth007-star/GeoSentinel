import time
import httpx

def probe_all():
    print("================ PROBING PUBLIC APIS ================")
    
    # 1. OONI API
    print("\n[1] Probing OONI API...")
    try:
        r = httpx.get("https://api.ooni.io/api/v1/measurements?probe_cc=IR&limit=3", timeout=12.0)
        print("OONI HTTP Status:", r.status_code)
        if r.status_code == 200:
            results = r.json().get("results", [])
            print(f"OONI Results Count: {len(results)}")
            if results:
                print("OONI Sample measurement_id:", results[0].get("measurement_id"))
                print("OONI Sample test_name:", results[0].get("test_name"))
                print("OONI Sample measurement_start_time:", results[0].get("measurement_start_time"))
        else:
            print("OONI Response text:", r.text[:200])
    except Exception as e:
        print("OONI Exception:", e)

    # 2. IODA API
    print("\n[2] Probing IODA API...")
    try:
        # IODA API v2 endpoint for country signals or outages
        r = httpx.get("https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/country/IR?from=-86400&until=now", timeout=12.0)
        print("IODA HTTP Status:", r.status_code)
        if r.status_code == 200:
            data = r.json()
            print("IODA Keys:", list(data.keys()) if isinstance(data, dict) else type(data))
        else:
            # Let's also probe outages endpoint if signals endpoint differs
            r2 = httpx.get("https://api.ioda.inetintel.cc.gatech.edu/v2/outages/overall?from=-86400&until=now", timeout=12.0)
            print("IODA Outages Status:", r2.status_code)
            if r2.status_code == 200:
                print("IODA Outages Data:", str(r2.json())[:200])
            else:
                print("IODA Error:", r.text[:200])
    except Exception as e:
        print("IODA Exception:", e)

    # 3. Wikidata SPARQL API
    print("\n[3] Probing Wikidata SPARQL...")
    try:
        sparql = """
        SELECT ?country ?countryLabel ?capitalLabel ?isoCode WHERE {
          ?country wdt:P31 wd:P6256.
          OPTIONAL { ?country wdt:P36 ?capital. }
          OPTIONAL { ?country wdt:P298 ?isoCode. }
          FILTER(?isoCode IN ("IND", "IRN", "USA"))
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        } LIMIT 5
        """
        headers = {"User-Agent": "GeoSentinel/1.0 (Research AI Platform; contact@geosentinel.org)"}
        r = httpx.get("https://query.wikidata.org/sparql", params={"query": sparql, "format": "json"}, headers=headers, timeout=12.0)
        print("Wikidata HTTP Status:", r.status_code)
        if r.status_code == 200:
            bindings = r.json().get("results", {}).get("bindings", [])
            print(f"Wikidata Bindings Count: {len(bindings)}")
            if bindings:
                sample = bindings[0]
                print("Wikidata Sample:", {k: v.get("value") for k, v in sample.items()})
        else:
            print("Wikidata Error:", r.text[:200])
    except Exception as e:
        print("Wikidata Exception:", e)

    # 4. Wikimedia Pageviews API
    print("\n[4] Probing Wikimedia Pageviews...")
    try:
        headers = {"User-Agent": "GeoSentinel/1.0 (Research AI Platform; contact@geosentinel.org)"}
        # Get pageviews for India over past few days
        r = httpx.get("https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/India/daily/2026092000/2026092500", headers=headers, timeout=12.0)
        print("Wikimedia Pageviews HTTP Status:", r.status_code)
        if r.status_code == 200:
            items = r.json().get("items", [])
            print(f"Wikimedia Pageviews Items Count: {len(items)}")
            if items:
                print("Wikimedia Sample:", items[0])
        else:
            print("Wikimedia Error:", r.text[:200])
    except Exception as e:
        print("Wikimedia Exception:", e)

    # 5. GDELT API
    print("\n[5] Probing GDELT API...")
    try:
        headers = {"User-Agent": "GeoSentinel/1.0 (Research AI Platform; contact@geosentinel.org)"}
        r = httpx.get("https://api.gdeltproject.org/api/v2/doc/doc?query=India%20oil&mode=artlist&maxrecords=5&format=json", headers=headers, timeout=15.0)
        print("GDELT HTTP Status:", r.status_code)
        if r.status_code == 200:
            articles = r.json().get("articles", [])
            print(f"GDELT Articles Count: {len(articles)}")
            if articles:
                print("GDELT Sample Article:", articles[0].get("title"))
        else:
            print("GDELT Response text:", r.text[:200])
    except Exception as e:
        print("GDELT Exception:", e)

if __name__ == "__main__":
    probe_all()
