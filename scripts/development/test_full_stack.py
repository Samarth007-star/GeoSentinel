import httpx
import json

BASE_URL = "http://localhost:8080/api/v1"

def test_full_system():
    print("==================================================================")
    print("TESTING FULL STACK ENDPOINTS (SPRING BOOT -> MYSQL & AI SERVICE)")
    print("==================================================================")
    
    with httpx.Client(timeout=30.0) as client:
        # 1. Register or Login with demo user
        print("\n[1] Testing Auth Register & Login...")
        reg_res = client.post(f"{BASE_URL}/auth/register", json={
            "email": "lead_analyst@geosentinel.org",
            "password": "Password@123",
            "displayName": "Lead Geopolitical Analyst"
        })
        if reg_res.status_code == 200:
            token = reg_res.json()["data"]["token"]
            print(" -> User Registered Successfully! JWT obtained.")
        else:
            login_res = client.post(f"{BASE_URL}/auth/login", json={
                "email": "lead_analyst@geosentinel.org",
                "password": "Password@123"
            })
            if login_res.status_code == 200:
                token = login_res.json()["data"]["token"]
                print(" -> Login Successful! JWT obtained.")
            else:
                print(f" -> Auth failed: {login_res.text}")
                return

        headers = {"Authorization": f"Bearer {token}"}

        # 2. Dashboard Metrics
        print("\n[2] Testing Dashboard Summary...")
        dash_res = client.get(f"{BASE_URL}/dashboard/summary", headers=headers)
        print(f"Dashboard: HTTP {dash_res.status_code}, data: {dash_res.json().get('data')}")

        # 3. Countries
        print("\n[3] Testing Countries list (MySQL)...")
        c_res = client.get(f"{BASE_URL}/countries", headers=headers)
        countries = c_res.json().get("data", [])
        print(f"Countries: HTTP {c_res.status_code}, count: {len(countries)}, sample: {countries[0] if countries else 'none'}")

        # 4. Events
        print("\n[4] Testing Events list (MySQL)...")
        ev_res = client.get(f"{BASE_URL}/events", headers=headers)
        events = ev_res.json().get("data", [])
        print(f"Events: HTTP {ev_res.status_code}, count: {len(events)}, sample: {events[0] if events else 'none'}")

        # 5. News
        print("\n[5] Testing News list (MySQL)...")
        n_res = client.get(f"{BASE_URL}/news", headers=headers)
        news = n_res.json().get("data", [])
        print(f"News: HTTP {n_res.status_code}, count: {len(news)}, sample: {news[0] if news else 'none'}")

        # 6. Organizations
        print("\n[6] Testing Organizations list (MySQL)...")
        o_res = client.get(f"{BASE_URL}/organizations", headers=headers)
        orgs = o_res.json().get("data", [])
        print(f"Organizations: HTTP {o_res.status_code}, count: {len(orgs)}, sample: {orgs[0] if orgs else 'none'}")

        # 7. Evidence
        print("\n[7] Testing Evidence list (MySQL)...")
        e_res = client.get(f"{BASE_URL}/evidence", headers=headers)
        evidence = e_res.json().get("data", [])
        print(f"Evidence: HTTP {e_res.status_code}, count: {len(evidence)}, sample title: {evidence[0].get('title') if evidence else 'none'}")

        # 8. Sources
        print("\n[8] Testing Sources list (MySQL)...")
        s_res = client.get(f"{BASE_URL}/sources", headers=headers)
        sources = s_res.json().get("data", [])
        print(f"Sources: HTTP {s_res.status_code}, count: {len(sources)}, sample provider: {sources[0].get('provider') if sources else 'none'}")

        # 9. Search
        print("\n[9] Testing Global Search ('India')...")
        srch_res = client.get(f"{BASE_URL}/search?q=India", headers=headers)
        srch_data = srch_res.json().get("data", {})
        print(f"Search: HTTP {srch_res.status_code}, results: {list(srch_data.keys())}")

        # 10. Sessions and Ask GeoSentinel question execution
        print("\n[10] Testing Session Creation and Question Submission (End-to-End Pipeline)...")
        sess_res = client.post(f"{BASE_URL}/sessions", headers=headers, json={"title": "Geopolitical Impact Audit Session"})
        sess_id = sess_res.json()["data"]["id"]
        print(f"Session Created: {sess_id}")

        q_payload = {
            "question": "If tensions between the United States and Iran escalate into a wider military conflict, what would be the economic, energy, diplomatic and security impacts on India?",
            "timeHorizon": "30d",
            "geographies": ["IND", "IRN", "USA"]
        }
        print(f"Submitting Question to /api/v1/sessions/{sess_id}/questions ...")
        q_res = client.post(f"{BASE_URL}/sessions/{sess_id}/questions", headers=headers, json=q_payload)
        print(f"Question Execution: HTTP {q_res.status_code}")
        if q_res.status_code == 200:
            ai_data = q_res.json().get("data", {})
            ans = ai_data.get("answer", {})
            print(" -> Success! Pipeline output returned through Spring Boot backend.")
            print(f" -> Facts: {len(ans.get('current_situation', {}).get('verified_facts', []))}")
            print(f" -> Evidence Items: {len(ans.get('relevant_evidence', []))}")
            print(f" -> Impact Pathways: {len(ans.get('impact_analysis', []))}")
            print(f" -> Strategies: {len(ans.get('strategy_recommendations', []))}")
            print(f" -> Scenarios: {len(ans.get('scenarios', []))}")
        else:
            print(f" -> Error: {q_res.text}")

        # 11. Distinctive Capabilities via AI Service Direct / Proxy
        print("\n[11] Testing ForecastLab, GeoMemory, and GeoLens endpoints...")
        with httpx.Client(timeout=10.0) as ai_client:
            f_res = ai_client.post("http://localhost:8000/api/v1/forecastlab/evaluate")
            print(f"ForecastLab Evaluation: HTTP {f_res.status_code}, Brier Score: {f_res.json().get('metrics', {}).get('brier_score')}")

            mem_res = ai_client.post("http://localhost:8000/api/v1/geomemory/search", json={"query": "Hormuz shipping tanker conflict", "geographies": ["IND", "IRN"]})
            cases = mem_res.json().get('retrieved_cases', [])
            print(f"GeoMemory Search: HTTP {mem_res.status_code}, Cases found: {len(cases)}, Top case: {cases[0]['event_title'] if cases else 'None'}")

            lens_res = ai_client.post("http://localhost:8000/api/v1/geolens/compare", json={"countries": ["IND", "IRN", "USA"]})
            profiles = lens_res.json().get('profiles', [])
            print(f"GeoLens Comparison: HTTP {lens_res.status_code}, Profiles: {[p['country_name'] for p in profiles]}")

if __name__ == "__main__":
    test_full_system()
