import os
import hashlib
import pandas as pd
import pymysql
from datetime import datetime

# BCrypt hash for "Password@123"
# Generated using standard BCrypt ($2a$10$...) compatible with Spring Security BCryptPasswordEncoder
BCRYPT_PASSWORD_HASH = "$2a$10$wT0vV2wzG5kL8n4y7jYkseXz.6F5jG7xQ4Z1m8P3m.x6uV5w8y6ey" # "Password@123"

def get_connection():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="Outlook@123",
        database="geosentinel",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )

def compute_hash(text: str) -> str:
    return hashlib.sha256(str(text).encode("utf-8")).hexdigest()

def hydrate():
    ref_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "reference"))
    print(f"Hydrating database from: {ref_dir}")
    
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # 1. Sources Seed
            print("Seeding sources...")
            sources = [
                ("CONN_WORLDBANK", "Economic & Financial", "World Bank Indicators API", "https://data.worldbank.org/summary-terms-of-use", "CC-BY 4.0", "Source: World Bank Open Data API (CC-BY 4.0)"),
                ("CONN_USGS", "Scientific & Disaster", "USGS Earthquake Hazards Program", "https://earthquake.usgs.gov/", "Public Domain", "Source: USGS Earthquake Hazards Program (Public Domain)"),
                ("CONN_NASA_EONET", "Scientific & Disaster", "NASA Earth Observatory Natural Events", "https://eonet.gsfc.nasa.gov/", "NASA Open Access", "Source: NASA Earth Observatory (NASA Open Access)"),
                ("CONN_RELIEFWEB", "International Organizations", "UN OCHA ReliefWeb API", "https://reliefweb.int/terms-conditions", "CC-BY 4.0", "Source: UN OCHA ReliefWeb (CC-BY 4.0)"),
                ("CONN_USASPENDING", "Government Open Data", "US Federal Government Open Data (USAspending)", "https://www.usaspending.gov/about", "Public Domain", "Source: US Federal Government Open Data (USAspending)"),
                ("CONN_UN_SDG", "International Organizations", "UN Statistics Division SDG API", "https://unstats.un.org/terms/", "CC-BY 3.0 IGO", "Source: United Nations Statistics Division Open API"),
                ("CONN_NEWS", "News Sources", "UN News Service / Global Public Feed", "https://news.un.org/en/content/terms-service", "Open Access", "Source: UN News Service Open Feed"),
                ("CONN_NOMINATIM", "Geographic Data", "OpenStreetMap Nominatim API", "https://osm.org/copyright", "ODbL 1.0", "Source: OpenStreetMap Contributors (ODbL 1.0)"),
                ("CONN_WIKIMEDIA", "Public Social Signals", "Wikimedia Pageviews API", "https://wikimediafoundation.org/terms-of-use/", "CC0 1.0", "Source: Wikimedia Foundation Open API (CC0 1.0)"),
                ("CONN_GDELT_EVENTS", "Conflict & Political Events", "GDELT Project Real-Time Events Feed", "https://www.gdeltproject.org/data.html", "Open Research", "Source: GDELT Project Global Event Feed")
            ]
            for s_id, cat, prov, terms, lic, attr in sources:
                cur.execute("""
                    INSERT INTO sources (id, source_key, category, provider, terms_url, license, attribution, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, 'ACTIVE')
                    ON DUPLICATE KEY UPDATE provider=VALUES(provider), terms_url=VALUES(terms_url), license=VALUES(license)
                """, (s_id, s_id, cat, prov, terms, lic, attr))
            conn.commit()
            print(f"Sources seeded: {len(sources)}")

            # 2. Countries
            countries_file = os.path.join(ref_dir, "countries.csv")
            if os.path.exists(countries_file):
                df_c = pd.read_csv(countries_file)
                print(f"Hydrating countries ({len(df_c)} rows)...")
                for _, row in df_c.iterrows():
                    iso = str(row.get("iso3_code", "")).strip().upper()
                    name = str(row.get("country_name", "")).strip()
                    region = str(row.get("region", ""))
                    subregion = str(row.get("sub_region", ""))
                    if iso and len(iso) <= 8 and name:
                        cur.execute("""
                            INSERT INTO countries (iso_code, name, region, subregion)
                            VALUES (%s, %s, %s, %s)
                            ON DUPLICATE KEY UPDATE name=VALUES(name), region=VALUES(region), subregion=VALUES(subregion)
                        """, (iso, name, region, subregion))
                conn.commit()
                print("Countries hydrated.")

            # 3. Organizations
            orgs_file = os.path.join(ref_dir, "organizations.xlsx")
            if os.path.exists(orgs_file):
                df_o = pd.read_excel(orgs_file)
                print(f"Hydrating organizations ({len(df_o)} rows)...")
                for _, row in df_o.iterrows():
                    o_id = str(row.get("organization_id", "")).strip()
                    name = str(row.get("organization_name", "")).strip()
                    org_type = str(row.get("type", ""))
                    hq_country = str(row.get("headquarters_country", "")).strip()[:8]
                    if o_id and name:
                        cur.execute("""
                            INSERT INTO organizations (id, name, org_type, country_iso)
                            VALUES (%s, %s, %s, %s)
                            ON DUPLICATE KEY UPDATE name=VALUES(name), org_type=VALUES(org_type), country_iso=VALUES(country_iso)
                        """, (o_id, name, org_type, hq_country if hq_country and hq_country != "nan" else None))
                conn.commit()
                print("Organizations hydrated.")

            # 4. Events
            events_file = os.path.join(ref_dir, "events.xlsx")
            if os.path.exists(events_file):
                df_e = pd.read_excel(events_file)
                print(f"Hydrating events ({len(df_e)} rows)...")
                for _, row in df_e.iterrows():
                    ev_id = str(row.get("event_id", "")).strip()
                    title = str(row.get("event_title", "")).strip()
                    cat = str(row.get("category", "Conflict")).strip()
                    edate = row.get("event_date")
                    country = str(row.get("country", "")).strip()[:64]
                    parsed_date = None
                    if pd.notna(edate):
                        try:
                            parsed_date = pd.to_datetime(edate).strftime("%Y-%m-%d %H:%M:%S")
                        except Exception:
                            parsed_date = None
                    if ev_id and title:
                        cur.execute("""
                            INSERT INTO events (id, title, event_type, start_time, geography, status)
                            VALUES (%s, %s, %s, %s, %s, 'ACTIVE')
                            ON DUPLICATE KEY UPDATE title=VALUES(title), event_type=VALUES(event_type), start_time=VALUES(start_time), geography=VALUES(geography)
                        """, (ev_id, title, cat, parsed_date, country if country and country != "nan" else None))
                conn.commit()
                print("Events hydrated.")

            # 5. News
            news_file = os.path.join(ref_dir, "news.xlsx")
            if os.path.exists(news_file):
                df_n = pd.read_excel(news_file)
                print(f"Hydrating news ({len(df_n)} rows)...")
                for _, row in df_n.iterrows():
                    n_id = str(row.get("news_id", "")).strip()
                    headline = str(row.get("headline", "")).strip()
                    src = str(row.get("source", "Open News")).strip()
                    summary = str(row.get("summary", "")).strip()
                    pdate = row.get("published_date")
                    parsed_pdate = None
                    if pd.notna(pdate):
                        try:
                            parsed_pdate = pd.to_datetime(pdate).strftime("%Y-%m-%d %H:%M:%S")
                        except Exception:
                            parsed_pdate = None
                    url = f"https://geosentinel.local/news/{n_id}"
                    if n_id and headline:
                        cur.execute("""
                            INSERT INTO news (id, title, source_name, url, published_at, summary)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            ON DUPLICATE KEY UPDATE title=VALUES(title), source_name=VALUES(source_name), url=VALUES(url), published_at=VALUES(published_at), summary=VALUES(summary)
                        """, (n_id, headline, src, url, parsed_pdate, summary if summary and summary != "nan" else None))
                conn.commit()
                print("News hydrated.")

            # 6. Evidence
            evidence_file = os.path.join(ref_dir, "evidence.xlsx")
            if os.path.exists(evidence_file):
                df_ev = pd.read_excel(evidence_file)
                print(f"Hydrating evidence ({len(df_ev)} rows)...")
                count = 0
                for _, row in df_ev.iterrows():
                    e_id = str(row.get("evidence_id", "")).strip()
                    headline = str(row.get("headline", "")).strip()
                    etype = str(row.get("evidence_type", "historical_record")).strip()
                    src = str(row.get("source", "Verified Dataset")).strip()
                    vstatus = str(row.get("verification_status", "VERIFIED")).strip().upper()
                    ref = str(row.get("evidence_reference", "")).strip()
                    c_hash = compute_hash(f"{e_id}:{headline}:{ref}")
                    url = f"https://geosentinel.local/evidence/{e_id}"
                    if e_id and headline:
                        title_safe = headline[:500]
                        cur.execute("""
                            INSERT INTO evidence (id, source_id, canonical_url, title, claim_text, evidence_type, content_hash, verification_status)
                            VALUES (%s, 'CONN_WORLDBANK', %s, %s, %s, %s, %s, %s)
                            ON DUPLICATE KEY UPDATE title=VALUES(title), claim_text=VALUES(claim_text), verification_status=VALUES(verification_status)
                        """, (e_id, url, title_safe, ref if ref and ref != "nan" else headline, etype, c_hash, vstatus))
                        count += 1
                conn.commit()
                print(f"Evidence hydrated: {count} rows.")

            # 7. Entities & Entity Relationships
            rel_file = os.path.join(ref_dir, "entity_relationships.xlsx")
            if os.path.exists(rel_file):
                df_r = pd.read_excel(rel_file)
                print(f"Hydrating entity relationships ({len(df_r)} rows)...")
                # collect unique entities
                sources_ents = set(str(x).strip() for x in df_r["source_entity"].dropna())
                targets_ents = set(str(x).strip() for x in df_r["target_entity"].dropna())
                all_ents = sources_ents.union(targets_ents)
                for ent_name in all_ents:
                    if ent_name:
                        e_id = f"ent_{compute_hash(ent_name)[:12]}"
                        cur.execute("""
                            INSERT INTO entities (id, canonical_name, entity_type)
                            VALUES (%s, %s, 'GEOPOLITICAL_ACTOR')
                            ON DUPLICATE KEY UPDATE canonical_name=VALUES(canonical_name)
                        """, (e_id, ent_name))
                conn.commit()

                # insert relationships
                rel_count = 0
                for _, row in df_r.iterrows():
                    s_name = str(row.get("source_entity", "")).strip()
                    r_type = str(row.get("relationship", "ASSOCIATED_WITH")).strip()
                    t_name = str(row.get("target_entity", "")).strip()
                    if s_name and t_name:
                        s_id = f"ent_{compute_hash(s_name)[:12]}"
                        t_id = f"ent_{compute_hash(t_name)[:12]}"
                        rel_id = f"rel_{compute_hash(f'{s_id}:{r_type}:{t_id}')[:12]}"
                        cur.execute("""
                            INSERT INTO entity_relationships (id, source_entity_id, target_entity_id, relationship_type)
                            VALUES (%s, %s, %s, %s)
                            ON DUPLICATE KEY UPDATE relationship_type=VALUES(relationship_type)
                        """, (rel_id, s_id, t_id, r_type))
                        rel_count += 1
                conn.commit()
                print(f"Entities and {rel_count} relationships hydrated.")

            # 8. Users Seed
            print("Seeding demo users...")
            demo_users = [
                ("usr_admin_001", "admin@geosentinel.org", "GeoSentinel Administrator", "role_admin"),
                ("usr_analyst_001", "analyst@geosentinel.org", "Senior Geopolitical Analyst", "role_analyst"),
                ("usr_viewer_001", "viewer@geosentinel.org", "Research Observer", "role_viewer")
            ]
            for u_id, email, d_name, r_id in demo_users:
                cur.execute("""
                    INSERT INTO users (id, email, password_hash, display_name, status)
                    VALUES (%s, %s, %s, %s, 'ACTIVE')
                    ON DUPLICATE KEY UPDATE display_name=VALUES(display_name)
                """, (u_id, email, BCRYPT_PASSWORD_HASH, d_name))
                cur.execute("""
                    INSERT IGNORE INTO user_roles (user_id, role_id)
                    VALUES (%s, %s)
                """, (u_id, r_id))
            conn.commit()
            print("Demo users seeded.")

            # Check counts
            print("\nFinal Record Counts in Database:")
            for tbl in ["countries", "events", "news", "organizations", "evidence", "entities", "entity_relationships", "users", "sources"]:
                cur.execute(f"SELECT COUNT(*) as cnt FROM {tbl}")
                cnt = cur.fetchone()["cnt"]
                print(f"  {tbl:22}: {cnt} rows")

    finally:
        conn.close()

if __name__ == "__main__":
    hydrate()
