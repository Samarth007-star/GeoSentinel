import httpx
import json
import sys

def probe_all():
    candidates = {
        # 1. Government Open Data
        "USASpending (Gov Open Data)": {
            "category": "Government Open Data",
            "url": "https://api.usaspending.gov/api/v2/references/toptier_agencies/",
            "headers": {"User-Agent": "GeoSentinel-Research/1.0"}
        },
        # 2. International Organizations
        "UN SDG (Intl Orgs)": {
            "category": "International Organizations",
            "url": "https://unstats.un.org/SDGAPI/v1/sdg/Target/List?format=json",
            "headers": {"User-Agent": "GeoSentinel-Research/1.0"}
        },
        "ReliefWeb v2 (Intl Orgs)": {
            "category": "International Organizations",
            "url": "https://api.reliefweb.int/v2/reports?appname=geosentinel&limit=1",
            "headers": {"User-Agent": "GeoSentinel-Research/1.0"}
        },
        # 3. Economic & Financial
        "World Bank (Economic)": {
            "category": "Economic & Financial Data",
            "url": "https://api.worldbank.org/v2/country/IND/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=2",
            "headers": {"User-Agent": "GeoSentinel-Research/1.0"}
        },
        # 4. News Sources
        "GDELT DOC 2.0 (News)": {
            "category": "News Sources",
            "url": "https://api.gdeltproject.org/api/v2/doc/doc?query=India&mode=artlist&format=json&maxrecords=2",
            "headers": {"User-Agent": "GeoSentinel-Research/1.0"}
        },
        # 5. Scientific & Disaster Data
        "USGS Earthquakes (Scientific)": {
            "category": "Scientific & Disaster Data",
            "url": "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=2",
            "headers": {"User-Agent": "GeoSentinel-Research/1.0"}
        },
        "NASA EONET (Scientific)": {
            "category": "Scientific & Disaster Data",
            "url": "https://eonet.gsfc.nasa.gov/api/v3/events?limit=2",
            "headers": {"User-Agent": "GeoSentinel-Research/1.0"}
        },
        # 6. Geographic Data
        "RestCountries (Geographic)": {
            "category": "Geographic Data",
            "url": "https://restcountries.com/v3.1/alpha/IND",
            "headers": {"User-Agent": "GeoSentinel-Research/1.0"}
        },
        "Nominatim OSM (Geographic)": {
            "category": "Geographic Data",
            "url": "https://nominatim.openstreetmap.org/search?q=New+Delhi&format=json&limit=1",
            "headers": {"User-Agent": "GeoSentinel-Research/1.0 (contact: info@geosentinel.org)"}
        },
        # 7. Public Social Signals
        "Wikimedia Pageviews (Social Signals)": {
            "category": "Public Social Signals",
            "url": "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/India/daily/20240101/20240102",
            "headers": {"User-Agent": "GeoSentinel-Research/1.0 (info@geosentinel.org)"}
        },
        # 8. Conflict & Political Events
        "UCDP Conflict Data (Conflict)": {
            "category": "Conflict & Political Events",
            "url": "https://ucdpapi.pcr.uu.se/api/gedevents/20.1?pagesize=2",
            "headers": {"User-Agent": "GeoSentinel-Research/1.0"}
        },
        "GDELT GEO 2.0 (Conflict)": {
            "category": "Conflict & Political Events",
            "url": "https://api.gdeltproject.org/api/v2/geo/geo?query=military&format=geojson",
            "headers": {"User-Agent": "GeoSentinel-Research/1.0"}
        }
    }

    print("=================================================================")
    print("PROBING CANDIDATE APIS FOR 8 CANONICAL CATEGORIES")
    print("=================================================================")

    with httpx.Client(timeout=10.0) as client:
        for name, info in candidates.items():
            try:
                res = client.get(info["url"], headers=info["headers"])
                body_sample = res.text[:120].replace("\n", " ")
                print(f"[{info['category'][:15]:15}] {name:30} -> HTTP {res.status_code} | bytes: {len(res.content):6} | sample: {body_sample}")
            except Exception as e:
                print(f"[{info['category'][:15]:15}] {name:30} -> ERROR: {str(e)[:80]}")

if __name__ == "__main__":
    probe_all()
