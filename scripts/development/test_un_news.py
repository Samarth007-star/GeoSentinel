import httpx

def test_news():
    client = httpx.Client(timeout=10.0, follow_redirects=True)
    try:
        r = client.get("https://news.un.org/feed/subscribe/en/news/all/rss.xml", headers={"User-Agent": "GeoSentinel/1.0"})
        print(f"UN News RSS: HTTP {r.status_code}, length: {len(r.text)}, sample: {r.text[:200].replace(chr(10), ' ')}")
    except Exception as e:
        print("UN News error:", e)

if __name__ == "__main__":
    test_news()
