import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import json
import logging
import re
from typing import List, Dict, Any

logger = logging.getLogger("geosentinel.live_data")

class LiveDataService:
    """
    Fetches real-time information from free public sources without requiring API keys:
    1. Google News RSS API (Real-time Indian & global news)
    2. Wikipedia Search API (Real-time encyclopedia and contextual facts)
    """

    @staticmethod
    def clean_html(text: str) -> str:
        if not text:
            return ""
        clean = re.sub(r"<[^>]+>", "", text)
        clean = re.sub(r"&[a-z]+;", " ", clean)
        clean = re.sub(r"\s{2,}", " ", clean)
        return clean.strip()

    @classmethod
    def fetch_google_news(cls, query: str, max_items: int = 5) -> List[Dict[str, str]]:
        """Fetches live breaking news headlines and summaries via Google News RSS."""
        # Simplify query for news search
        search_query = re.sub(r"^(what if|what is|how will|why will|can you|tell me about|if)\s+", "", query, flags=re.IGNORECASE)
        search_query = re.sub(r"\?+$", "", search_query).strip()
        if not search_query:
            search_query = query

        url = f"https://news.google.com/rss/search?q={urllib.parse.quote(search_query)}&hl=en-IN&gl=IN&ceid=IN:en"
        items = []

        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            )
            with urllib.request.urlopen(req, timeout=6) as resp:
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
                            "summary": desc[:250],
                            "link": link,
                            "published": pub,
                            "source": "Google News Live"
                        })
        except Exception as e:
            logger.warning(f"Google News RSS fetch failed for query '{query}': {e}")

        return items

    @classmethod
    def fetch_wikipedia(cls, query: str, max_items: int = 3) -> List[Dict[str, str]]:
        """Fetches live Wikipedia article summaries for background context."""
        search_query = re.sub(r"^(what if|what is|how will|why will|if)\s+", "", query, flags=re.IGNORECASE)
        search_query = re.sub(r"\?+$", "", search_query).strip()

        url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(search_query)}&utf8=&format=json"
        items = []

        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "GeoSentinel-Research/1.0 (academic research)"}
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
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
            logger.warning(f"Wikipedia search failed for query '{query}': {e}")

        return items

    @classmethod
    def get_live_context(cls, query: str) -> Dict[str, Any]:
        """Combines live news and Wikipedia data for a specific query."""
        news = cls.fetch_google_news(query, max_items=5)
        wiki = cls.fetch_wikipedia(query, max_items=3)

        facts = []
        for n in news:
            facts.append(f"[Live News] {n['title']}")
        for w in wiki:
            facts.append(f"[Wikipedia] {w['title']}: {w['snippet'][:150]}")

        return {
            "query": query,
            "news": news,
            "wiki": wiki,
            "facts": facts,
            "has_live_data": len(news) > 0 or len(wiki) > 0
        }

live_data_service = LiveDataService()
