import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import json
import logging
import re
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict, Any

logger = logging.getLogger("geosentinel.live_data")


class LiveDataService:
    """
    Fetches real-time multi-source data without requiring paid API keys:
    1. Google News RSS (Latest India & Global breaking news - 2026)
    2. Google News Market Trend RSS (Stock, business, and price trends)
    3. Google News Social & Public Buzz RSS (Fans, Reddit, YouTube, public opinion)
    4. YouTube Public Search Trends API (What users are actively searching)
    5. DuckDuckGo Instant Answer API (Topic background & related concepts)
    6. Wikipedia Search API (Verified factual context)
    7. HackerNews Algolia API (Tech/AI community discussion)
    """

    @staticmethod
    def clean_html(text: str) -> str:
        if not text:
            return ""
        clean = re.sub(r"<[^>]+>", "", text)
        clean = re.sub(r"&[a-z]+;", " ", clean)
        clean = re.sub(r"\s{2,}", " ", clean)
        return clean.strip()

    @staticmethod
    def _simplify_query(query: str) -> str:
        search_query = re.sub(
            r"^(what if|what is|what are|how will|why will|can you|tell me about|give strategy for|give me|if)\s+",
            "",
            query.strip(),
            flags=re.IGNORECASE,
        )
        search_query = re.sub(r"\?+$", "", search_query).strip()
        # Keep key words concise (first ~9 meaningful words) so search APIs return rich matches
        words = search_query.split()
        if len(words) > 10:
            stop = {"what", "will", "be", "the", "should", "i", "use", "for", "a", "an", "to", "is", "are", "of", "on", "in"}
            filtered = [w for w in words if w.lower() not in stop]
            search_query = " ".join(filtered[:8]) if filtered else " ".join(words[:8])
        return search_query or query

    @classmethod
    def _fetch_google_news_rss(cls, query_str: str, max_items: int = 5, label: str = "Google News Live") -> List[Dict[str, str]]:
        url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query_str)}&hl=en-IN&gl=IN&ceid=IN:en"
        items: List[Dict[str, str]] = []
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                xml_data = resp.read()
                root = ET.fromstring(xml_data)
                for item in root.findall(".//item")[:max_items]:
                    title_elem = item.find("title")
                    link_elem = item.find("link")
                    pub_elem = item.find("pubDate")
                    desc_elem = item.find("description")

                    title = cls.clean_html(title_elem.text if title_elem is not None else "")
                    desc = cls.clean_html(desc_elem.text if desc_elem is not None else "")
                    link = link_elem.text if link_elem is not None else ""
                    pub = pub_elem.text if pub_elem is not None else ""

                    if title:
                        items.append({
                            "title": title,
                            "summary": desc[:220],
                            "link": link,
                            "published": pub,
                            "source": label
                        })
        except Exception as e:
            logger.warning(f"{label} fetch failed for '{query_str}': {e}")
        return items

    @classmethod
    def fetch_google_news(cls, query: str, max_items: int = 5) -> List[Dict[str, str]]:
        core = cls._simplify_query(query)
        return cls._fetch_google_news_rss(core, max_items=max_items, label="Latest News")

    @classmethod
    def fetch_market_trends(cls, query: str, max_items: int = 4) -> List[Dict[str, str]]:
        core = cls._simplify_query(query)
        return cls._fetch_google_news_rss(
            f"{core} market OR stock OR business OR economy OR price",
            max_items=max_items,
            label="Market Trend News"
        )

    @classmethod
    def fetch_social_buzz(cls, query: str, max_items: int = 4) -> List[Dict[str, str]]:
        core = cls._simplify_query(query)
        return cls._fetch_google_news_rss(
            f"{core} fans OR social media OR reaction OR public opinion OR reddit",
            max_items=max_items,
            label="Social Media & Public Buzz"
        )

    @classmethod
    def fetch_youtube_trends(cls, query: str) -> List[str]:
        """Fetches real public YouTube search trends for the topic."""
        core = cls._simplify_query(query)
        # Take first 4-5 keywords for YouTube autocomplete
        short_core = " ".join(core.split()[:5])
        url = f"https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q={urllib.parse.quote(short_core)}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if isinstance(data, list) and len(data) > 1 and isinstance(data[1], list):
                    return [str(s) for s in data[1][:6]]
        except Exception as e:
            logger.warning(f"YouTube trends fetch failed for '{query}': {e}")
        return []

    @classmethod
    def fetch_duckduckgo(cls, query: str) -> List[str]:
        """Fetches instant background & related topics from DuckDuckGo API."""
        core = cls._simplify_query(query)
        url = f"https://api.duckduckgo.com/?q={urllib.parse.quote(core)}&format=json&no_html=1"
        results: List[str] = []
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "GeoSentinel/1.0"})
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                abstract = data.get("AbstractText", "").strip()
                if abstract:
                    results.append(abstract[:220])
                for topic in data.get("RelatedTopics", [])[:3]:
                    if isinstance(topic, dict) and topic.get("Text"):
                        results.append(topic["Text"][:160])
        except Exception as e:
            logger.warning(f"DuckDuckGo fetch failed for '{query}': {e}")
        return results

    @classmethod
    def fetch_wikipedia(cls, query: str, max_items: int = 2) -> List[Dict[str, str]]:
        """Fetches Wikipedia search snippets."""
        core = cls._simplify_query(query)
        url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(core)}&utf8=&format=json"
        items: List[Dict[str, str]] = []
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "GeoSentinel-Research/1.0 (academic research)"}
            )
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                results = data.get("query", {}).get("search", [])
                for r in results[:max_items]:
                    title = r.get("title", "")
                    snippet = cls.clean_html(r.get("snippet", ""))
                    if title and snippet:
                        items.append({
                            "title": title,
                            "snippet": snippet,
                            "source": "Wikipedia API"
                        })
        except Exception as e:
            logger.warning(f"Wikipedia search failed for '{query}': {e}")
        return items

    @classmethod
    def fetch_hackernews_discussion(cls, query: str) -> List[str]:
        """Fetches public community discussions from HackerNews Algolia API."""
        core = cls._simplify_query(query)
        short_core = " ".join(core.split()[:5])
        url = f"https://hn.algolia.com/api/v1/search?query={urllib.parse.quote(short_core)}&hitsPerPage=3"
        items: List[str] = []
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "GeoSentinel/1.0"})
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                for h in data.get("hits", [])[:3]:
                    title = h.get("title") or h.get("story_title")
                    pts = h.get("points", 0)
                    if title:
                        items.append(f"{title} ({pts} upvotes)")
        except Exception as e:
            logger.warning(f"HackerNews fetch failed for '{query}': {e}")
        return items

    @classmethod
    def get_live_context(cls, query: str) -> Dict[str, Any]:
        """Fetches all free live news, social media, YouTube trends, market trends, and background context in parallel."""
        with ThreadPoolExecutor(max_workers=7) as executor:
            f_news = executor.submit(cls.fetch_google_news, query, 5)
            f_market = executor.submit(cls.fetch_market_trends, query, 4)
            f_social = executor.submit(cls.fetch_social_buzz, query, 4)
            f_yt = executor.submit(cls.fetch_youtube_trends, query)
            f_ddg = executor.submit(cls.fetch_duckduckgo, query)
            f_wiki = executor.submit(cls.fetch_wikipedia, query, 2)
            f_hn = executor.submit(cls.fetch_hackernews_discussion, query)

            news = f_news.result()
            market_news = f_market.result()
            social_news = f_social.result()
            yt_trends = f_yt.result()
            ddg_info = f_ddg.result()
            wiki = f_wiki.result()
            hn_posts = f_hn.result()

        facts: List[str] = []
        seen_titles = set()

        for n in news:
            if n["title"] not in seen_titles:
                seen_titles.add(n["title"])
                facts.append(f"[Latest News | {n.get('published', '')[:16]}] {n['title']}")

        for m in market_news:
            if m["title"] not in seen_titles:
                seen_titles.add(m["title"])
                facts.append(f"[Market Trend News] {m['title']}")

        for s in social_news:
            if s["title"] not in seen_titles:
                seen_titles.add(s["title"])
                facts.append(f"[Social Media & Public Buzz] {s['title']}")

        if yt_trends:
            facts.append(f"[YouTube Public Search Trends] {', '.join(yt_trends)}")

        for h in hn_posts:
            facts.append(f"[Community Discussion] {h}")

        for d in ddg_info:
            facts.append(f"[DuckDuckGo Context] {d}")

        for w in wiki:
            facts.append(f"[Wikipedia] {w['title']}: {w['snippet'][:140]}")

        return {
            "query": query,
            "news": news,
            "market_news": market_news,
            "social_news": social_news,
            "youtube_trends": yt_trends,
            "wiki": wiki,
            "facts": facts,
            "has_live_data": len(facts) > 0
        }


live_data_service = LiveDataService()
