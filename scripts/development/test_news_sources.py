import httpx

def test_news_sources():
    client = httpx.Client(timeout=10.0, follow_redirects=True)
    sources = {
        "UN News RSS": "https://news.un.org/feed/subscribe/en/news/all/rss.xml",
        "BBC World RSS": "https://feeds.bbci.co.uk/news/world/rss.xml"
    }
    for name, url in sources.items():
        try:
            r = client.get(url, headers={"User-Agent": "GeoSentinel-Research/1.0"})
            print(f"{name}: HTTP {r.status_code}, length: {len(r.text)}")
        except Exception as e:
            print(f"{name} error: {e}")

if __name__ == "__main__":
    test_news_sources()
