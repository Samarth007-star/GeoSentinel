import httpx
import json

def test_wikidata_search():
    sparql = """
    SELECT ?item ?itemLabel ?itemDescription ?instanceOfLabel WHERE {
      SERVICE wikibase:mwapi {
        bd:serviceParam wikibase:endpoint "www.wikidata.org";
                        wikibase:api "EntitySearch";
                        mwapi:search "India";
                        mwapi:language "en".
        ?item wikibase:apiOutputItem mwapi:item.
      }
      OPTIONAL { ?item wdt:P31 ?instanceOf. }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    } LIMIT 3
    """
    headers = {"User-Agent": "GeoSentinel/1.0 (Research AI Platform; contact@geosentinel.org)"}
    r = httpx.get("https://query.wikidata.org/sparql", params={"query": sparql, "format": "json"}, headers=headers, timeout=15.0)
    print("Wikidata search status:", r.status_code)
    if r.status_code == 200:
        data = r.json()
        bindings = data.get("results", {}).get("bindings", [])
        print("Bindings count:", len(bindings))
        for b in bindings:
            print({k: v.get("value") for k, v in b.items()})

if __name__ == "__main__":
    test_wikidata_search()
