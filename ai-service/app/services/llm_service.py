import os
import json
import logging
import urllib.request
import re
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
from .live_data_service import live_data_service
from ..agents.question_understanding import question_understanding_agent
from ..schemas.models import QueryAnalysisProfile

logger = logging.getLogger("geosentinel.llm_service")


class LiveLLMService:
    """
    Powerful Query-Analyzer-Aware LLM & Strategy Agent:
    1. Uses QuestionUnderstandingAgent (Query Analyzer) FIRST to distinguish:
       - Conversational (GREETING, SMALL_TALK, THANKS_BYE, IDENTITY_HELP, UNCLEAR)
       - Simple Factual (SIMPLE_FACTUAL)
       - Deep Analytical (RISK, EFFECT, GOOD_BAD, STRATEGY, PREDICTION, COMPARISON, NEWS_STATUS, GENERAL)
    2. For short ambiguous messages, runs a fast LLM Query Analyzer Guard to catch casual remarks/jokes/Hinglish chat.
    3. For analytical queries, fetches live 2026 news, market trends, social buzz, YouTube trends, DuckDuckGo & Wikipedia in parallel.
    4. Produces clean, intent-matched dynamic outputs without dumping strategies onto casual chat.
    """

    def __init__(self):
        self.env_path = r"d:\Geosentinal\GeoSentinel\.env"
        self._load_env_keys()

    def _load_env_keys(self):
        try:
            if os.path.exists(self.env_path):
                load_dotenv(self.env_path, override=True)
        except Exception:
            pass
        self.groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY", "").strip()

    @staticmethod
    def format_conversational_output(
        reply_text: str,
        intent_label: str = "CONVERSATIONAL",
        emoji: str = "👋",
        extra_bullets: Optional[List[str]] = None,
        extra_title: str = "What I Can Help With",
    ) -> Dict[str, Any]:
        sections: List[Dict[str, Any]] = [
            {
                "emoji": emoji,
                "title": "Message",
                "type": "text",
                "content": reply_text.strip(),
            }
        ]
        if extra_bullets:
            sections.append({
                "emoji": "✨",
                "title": extra_title,
                "type": "bullets",
                "items": extra_bullets,
            })
        return {
            "intent": intent_label,
            "sections": sections,
        }

    def build_conversational_response(
        self,
        question: str,
        profile: QueryAnalysisProfile,
        user_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Generates fast, personalized responses for greetings, small talk, thanks, help, or unclear input."""
        q_lower = question.lower().strip()
        qtype = profile.query_type
        display_name = (profile.extracted_user_name or (user_name or "").strip() or "Admin").strip()

        if qtype == "GREETING":
            if "morning" in q_lower or q_lower == "gm":
                greeting_word = f"Good morning, {display_name}!"
            elif "afternoon" in q_lower:
                greeting_word = f"Good afternoon, {display_name}!"
            elif "evening" in q_lower:
                greeting_word = f"Good evening, {display_name}!"
            elif "namaste" in q_lower or "namaskar" in q_lower:
                greeting_word = f"Namaste, {display_name}!"
            elif "salam" in q_lower:
                greeting_word = f"Salaam, {display_name}!"
            else:
                greeting_word = f"Hello, {display_name}!"

            return {
                "intent": "GREETING",
                "sections": [
                    {
                        "emoji": "👋",
                        "title": greeting_word,
                        "type": "text",
                        "content": f"Welcome to GeoSentinel Prime, {display_name}! I'm your AI Query Analyzer and Real-Time Decision Assistant, glad to help you today.",
                    },
                    {
                        "emoji": "✨",
                        "title": "Speciality of GeoSentinel Prime",
                        "type": "bullets",
                        "items": [
                            "Smart Intent & Query Analyzer: Automatically understands whether you want a risk check, market effect, good vs. bad comparison, or action plan.",
                            "Live 2026 Multi-Source Intelligence: Fetches real-time Google News, market trends, YouTube search trends, Reddit/social opinion, and Wikipedia before answering.",
                            "Actionable Strategy Engine: Delivers prioritized strategies with What To Do, Why It Works, Good Effects, Bad Effects / Risks, Timing, and a Best Strategy For You pick.",
                        ],
                    },
                    {
                        "emoji": "🧭",
                        "title": "How to Use GeoSentinel",
                        "type": "bullets",
                        "items": [
                            "Check Risks -> Ask: \"What is risk if India loses World Cup 2027?\" (Shows Risk, Why Will Happen, Risk Level & Strategies).",
                            "Analyze Market Effects -> Ask: \"If India wins World Cup 2027 what will be effect on market?\" (Shows Good Effects, Bad Effects & Overall Effect).",
                            "Get a Strategy Plan -> Ask: \"Give strategy for India market if India wins World Cup 2027?\" (Shows 5 Prioritized Strategies + Best Strategy For You).",
                            "Compare Good vs. Bad or Quick Facts -> Ask: \"What are good and bad things about AI jobs?\" or \"What is inflation?\"",
                        ],
                    },
                ],
            }

        if qtype == "SMALL_TALK":
            if "joke" in q_lower:
                msg = f"Haha, here's one for you, {display_name}: Why did the analyst carry an umbrella to the stock market? Just in case of a sudden market shower! Now, what event or strategy would you like to explore?"
                emoji = "😄"
            elif any(w in q_lower for w in ("how are", "how r", "kaise ho", "kya haal", "whats up", "what's up", "wassup", "how you doing")):
                msg = f"I'm doing great, {display_name}, and ready to help! Ask me about any global event, market trend, risk, or strategy you'd like analyzed today."
                emoji = "😊"
            elif any(w in q_lower for w in ("are you real", "are you human")):
                msg = f"I'm GeoSentinel Prime, {display_name} — an AI assistant built to analyze live news, risks, impacts, and actionable strategies. What would you like to check?"
                emoji = "🤖"
            else:
                msg = f"I'm right here and ready, {display_name}! Ask me anything about global events, markets, risks, or strategies."
                emoji = "😊"

            return self.format_conversational_output(msg, intent_label="SMALL_TALK", emoji=emoji)

        if qtype == "THANKS_BYE":
            if any(w in q_lower for w in ("bye", "goodbye", "good bye", "see you", "see ya", "cya", "gn", "good night", "goodnight", "take care", "tata")):
                return self.format_conversational_output(
                    f"Goodbye, {display_name}! Come back anytime you need live intelligence, risk checks, or strategies.",
                    intent_label="THANKS_BYE",
                    emoji="👋",
                )
            if any(w in q_lower for w in ("thank", "thx", "tysm", "ty", "tq", "shukriya", "dhanyawad", "appreciate")):
                return self.format_conversational_output(
                    f"You're very welcome, {display_name}! Feel free to ask anytime you want to analyze another event, risk, or strategy.",
                    intent_label="THANKS_BYE",
                    emoji="🙏",
                )
            return self.format_conversational_output(
                f"Got it, {display_name}! Let me know whenever you have a question to analyze.",
                intent_label="THANKS_BYE",
                emoji="👍",
            )

        if qtype == "IDENTITY_HELP":
            return {
                "intent": "IDENTITY_HELP",
                "sections": [
                    {
                        "emoji": "🛡️",
                        "title": f"Hello, {display_name}! Meet GeoSentinel Prime",
                        "type": "text",
                        "content": "I'm your intelligent Query Analyzer and real-time decision assistant.",
                    },
                    {
                        "emoji": "✨",
                        "title": "Speciality of GeoSentinel Prime",
                        "type": "bullets",
                        "items": [
                            "Intent-Aware Analysis: Adapts output cleanly to Risk, Effect, Good vs. Bad, Strategy, or Simple Fact questions.",
                            "Live Multi-Source Data: Pulls real-time 2026 news, market trends, YouTube trends, social buzz, DuckDuckGo & Wikipedia.",
                            "Actionable Strategies: Gives concrete steps with real pros, cons, timing, cost & success chance.",
                        ],
                    },
                    {
                        "emoji": "🧭",
                        "title": "How to Use",
                        "type": "bullets",
                        "items": [
                            "Try: \"What is risk if India loses World Cup 2027?\"",
                            "Try: \"If India wins World Cup 2027 what will be effect on market?\"",
                            "Try: \"Give strategy for India market if India wins World Cup 2027?\"",
                        ],
                    },
                ],
            }

        return self.format_conversational_output(
            f"Hi {display_name}, I didn't quite catch a specific topic there. Please ask a clear question — for example, about a global event, market risk, effect, or strategy — and I'll analyze it right away!",
            intent_label="UNCLEAR",
            emoji="🤔",
        )

    def _raw_json_llm_call(self, system_prompt: str, user_prompt: str, temperature: float = 0.15, timeout: int = 12) -> Optional[Dict[str, Any]]:
        """Tries configured cloud LLM providers (Groq -> Gemini) for lightweight JSON responses."""
        if self.groq_api_key:
            try:
                url = "https://api.groq.com/openai/v1/chat/completions"
                payload = {
                    "model": "llama-3.1-8b-instant",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": temperature,
                    "response_format": {"type": "json_object"},
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.groq_api_key}",
                    },
                )
                with urllib.request.urlopen(req, timeout=timeout) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    content = data["choices"][0]["message"]["content"]
                    clean = re.sub(r"```json\s*|```\s*", "", content).strip()
                    return json.loads(clean)
            except Exception as e:
                logger.warning(f"Groq lightweight call failed: {e}")

        if self.gemini_api_key:
            for model in ("gemini-3-flash-preview", "gemini-3.1-flash-lite-preview", "gemini-flash-latest"):
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.gemini_api_key}"
                    payload = {
                        "contents": [{"parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}],
                        "generationConfig": {
                            "temperature": temperature,
                            "responseMimeType": "application/json",
                        },
                    }
                    req = urllib.request.Request(
                        url,
                        data=json.dumps(payload).encode("utf-8"),
                        headers={"Content-Type": "application/json"},
                    )
                    with urllib.request.urlopen(req, timeout=timeout) as resp:
                        data = json.loads(resp.read().decode("utf-8"))
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        clean = re.sub(r"```json\s*|```\s*", "", text).strip()
                        return json.loads(clean)
                except Exception as e:
                    logger.warning(f"Gemini {model} lightweight call failed: {e}")

        return None

    def classify_ambiguous_query(
        self,
        question: str,
        profile: QueryAnalysisProfile,
    ) -> Optional[Dict[str, Any]]:
        """
        Smart Query Analyzer Guard for short, ambiguous messages that did not match explicit rules.
        Catches subtle casual chat / Hinglish greetings / jokes / compliments before running heavy web scraping.
        Returns a ready conversational chat_output dict if casual, or updates profile for SIMPLE_FACTUAL.
        """
        if profile.is_conversational:
            return self.build_conversational_response(question, profile)

        words = question.strip().split()
        should_check = (
            profile.query_type in ("GENERAL", "SIMPLE_FACTUAL")
            and len(words) <= 8
            and len(profile.entities) == 0
            and not profile.needs_good_bad_effects
        )
        if not should_check:
            return None

        self._load_env_keys()
        if not (self.groq_api_key or self.gemini_api_key):
            return None

        sys_prompt = (
            "You are a fast, accurate Query Analyzer Agent. Classify the user's message strictly."
        )
        usr_prompt = (
            f'User message: "{question}"\n\n'
            "Classify into ONE category:\n"
            '- "CONVERSATIONAL": greeting (in any language/Hinglish/slang), casual chat, asking how the bot is, joke request, compliment, feeling, thanks, goodbye, or non-analytical remark.\n'
            '- "SIMPLE_FACTUAL": short straightforward factual/definition/math question that needs only a crisp 2-4 line direct answer without strategies.\n'
            '- "ANALYTICAL": a real question about news, markets, economy, sports outcomes, risks, impacts, or strategies.\n\n'
            'Return ONLY valid JSON: {"category": "...", "emoji": "👋 or 💬", "quick_reply": "if CONVERSATIONAL, write a warm, natural 1-2 sentence response in simple English; otherwise empty string"}'
        )

        parsed = self._raw_json_llm_call(sys_prompt, usr_prompt, temperature=0.2, timeout=10)
        if not isinstance(parsed, dict):
            return None

        category = str(parsed.get("category", "")).upper().strip()
        quick_reply = str(parsed.get("quick_reply", "")).strip()
        emoji = str(parsed.get("emoji") or "💬").strip() or "💬"

        if category == "CONVERSATIONAL" and quick_reply:
            return self.format_conversational_output(
                quick_reply,
                intent_label="CONVERSATIONAL",
                emoji=emoji,
            )

        if category == "SIMPLE_FACTUAL":
            profile.query_type = "SIMPLE_FACTUAL"
            profile.requires_strategies = False

        return None

    def _strategy_item_schema(self) -> str:
        return (
            '{\n'
            '  "name": "Strategy X: [Specific Action Name - e.g. real sector/brand/step]",\n'
            '  "what_to_do": "Exact concrete step user can start right away in simple words",\n'
            '  "why_will_work": "1-2 simple lines tied directly to the fetched 2026 news / social media buzz / market trend",\n'
            '  "good_effect": "Specific benefit or expected gain (with realistic numbers/range where helpful)",\n'
            '  "bad_effect": "Specific risk or what can go wrong",\n'
            '  "when_to_do": "Today" or "This Week" or "This Month" or specific timing,\n'
            '  "cost_effort": "Low" or "Medium" or "High",\n'
            '  "success_chance": "High / Medium / Low - short reason based on data"\n'
            '}'
        )

    def _build_prompt(self, question: str, facts: List[str], profile: QueryAnalysisProfile) -> str:
        intent = profile.query_type
        needs_gb = profile.needs_good_bad_effects

        facts_text = "\n".join(facts[:14]) if facts else "No live news needed or returned; answer cleanly using verified 2026 knowledge."
        strat_schema = self._strategy_item_schema()

        best_strategy_section = (
            '  {"emoji": "🏆", "title": "BEST STRATEGY FOR YOU", "type": "best_strategy", '
            '"strategy_name": "Name of the #1 best strategy from above", '
            '"content": "3 simple lines explaining why the user should do this strategy FIRST right now based on news and social media buzz."}'
        )

        if intent == "SIMPLE_FACTUAL":
            return (
                f"CURRENT DATE CONTEXT: November 2026.\n"
                f"USER QUESTION: {question}\n\n"
                f"LIVE REFERENCE SNIPPETS (if any):\n{facts_text}\n\n"
                "INTENT DETECTED: SIMPLE FACTUAL / DIRECT QUESTION.\n"
                "Give a clear, accurate, concise answer in simple everyday English.\n"
                "Return JSON with \"intent\": \"SIMPLE_FACTUAL\" and \"sections\" containing:\n"
                "[\n"
                '  {"emoji": "💡", "title": "Direct Answer", "type": "text", "content": "2-4 clear sentences directly answering the question."},\n'
                '  {"emoji": "📌", "title": "Key Points", "type": "bullets", "items": ["2 or 3 crisp helpful facts (omit if unnecessary)"]}\n'
                "]\n"
                "DO NOT add strategies or 'BEST STRATEGY FOR YOU' for a simple factual question.\n"
                "Respond ONLY with ONE valid JSON object (no markdown, no backticks)."
            )

        if intent == "RISK":
            extra_gb = (
                '  {"emoji": "✅", "title": "Good Effect", "type": "bullets", "items": ["short simple good point 1", "short simple good point 2"]},\n'
                '  {"emoji": "❌", "title": "Bad Effect", "type": "bullets", "items": ["short simple bad point 1", "short simple bad point 2"]},\n'
                if needs_gb else ""
            )
            extra_conclusion = (
                ',\n  {"emoji": "📌", "title": "Final Conclusion", "type": "text", "content": "Simple 1-2 line final takeaway"}'
                if needs_gb else ""
            )
            format_guide = (
                f'INTENT DETECTED: RISK.\n'
                f'Return JSON with "intent": "RISK" and "sections" containing these sections in order:\n'
                f'[\n'
                f'  {{"emoji": "⚠️", "title": "Risk", "type": "text", "content": "2-3 lines simple explanation of the risk"}},\n'
                f'  {{"emoji": "❓", "title": "Why Will Happen", "type": "bullets", "items": ["simple reason 1", "simple reason 2", "simple reason 3"]}},\n'
                f'  {{"emoji": "🔴", "title": "Risk Level", "type": "badge", "level": "High" or "Medium" or "Low"}},\n'
                f'{extra_gb}'
                f'  {{"emoji": "✅", "title": "Strategies", "type": "strategies", "strategies": [Provide 4 specific, prioritized strategies matching this schema:\n{strat_schema}\n  ]}},\n'
                f'{best_strategy_section}{extra_conclusion}\n'
                f']'
            )
        elif intent == "EFFECT":
            format_guide = (
                f'INTENT DETECTED: EFFECT / WHAT WILL HAPPEN.\n'
                f'Return JSON with "intent": "EFFECT" and "sections" containing these sections in order:\n'
                f'[\n'
                f'  {{"emoji": "✅", "title": "Good Effects", "type": "bullets", "items": ["simple positive effect 1", "simple positive effect 2", "simple positive effect 3"]}},\n'
                f'  {{"emoji": "❌", "title": "Bad Effects", "type": "bullets", "items": ["simple negative effect 1", "simple negative effect 2", "simple negative effect 3"]}},\n'
                f'  {{"emoji": "📊", "title": "Overall Effect", "type": "text", "content": "Simple 2-3 lines final conclusion explaining the net overall effect"}},\n'
                f'  {{"emoji": "✅", "title": "Strategies", "type": "strategies", "strategies": [Provide 4 specific, prioritized strategies matching this schema:\n{strat_schema}\n  ]}},\n'
                f'{best_strategy_section}\n'
                f']'
            )
        elif intent == "GOOD_BAD":
            format_guide = (
                f'INTENT DETECTED: GOOD / BAD COMPARISON.\n'
                f'Return JSON with "intent": "GOOD_BAD" and "sections" containing these sections in order:\n'
                f'[\n'
                f'  {{"emoji": "✅", "title": "Good Things", "type": "bullets", "items": ["simple good thing 1", "simple good thing 2", "simple good thing 3"]}},\n'
                f'  {{"emoji": "❌", "title": "Bad Things", "type": "bullets", "items": ["simple bad thing 1", "simple bad thing 2", "simple bad thing 3"]}},\n'
                f'  {{"emoji": "⚖️", "title": "Which Is More?", "type": "text", "content": "Simple 2-3 lines clear conclusion on which side is bigger"}},\n'
                f'  {{"emoji": "✅", "title": "What To Do?", "type": "strategies", "strategies": [Provide 4 specific, prioritized steps matching this schema:\n{strat_schema}\n  ]}},\n'
                f'{best_strategy_section}\n'
                f']'
            )
        elif intent == "STRATEGY":
            format_guide = (
                f'INTENT DETECTED: STRATEGY / ACTION PLAN (PRIORITY MODE).\n'
                f'Return JSON with "intent": "STRATEGY" and "sections" containing EXACTLY these sections in order:\n'
                f'[\n'
                f'  {{"emoji": "🎯", "title": "Best Prioritized Strategies", "type": "strategies", "strategies": [\n'
                f'    Provide 5 SPECIFIC, HIGHLY ACTIONABLE strategies prioritized from Strategy 1 (Most Important) to Strategy 5.\n'
                f'    Each strategy MUST follow this exact schema:\n{strat_schema}\n'
                f'  ]}},\n'
                f'  {{"emoji": "⚠️", "title": "Risk If No Strategy", "type": "text", "content": "Simple 2-3 lines explaining what opportunities or money the user loses if they take no action."}},\n'
                f'{best_strategy_section}\n'
                f']'
            )
        elif intent == "COMPARISON":
            format_guide = (
                'INTENT DETECTED: COMPARISON.\n'
                'Return JSON with "intent": "COMPARISON" and "sections" comparing both options clearly:\n'
                '[\n'
                '  {"emoji": "⚖️", "title": "Key Differences", "type": "bullets", "items": ["clear point 1", "clear point 2", "clear point 3"]},\n'
                '  {"emoji": "✅", "title": "Strengths & Advantages", "type": "bullets", "items": ["advantage 1", "advantage 2"]},\n'
                '  {"emoji": "❌", "title": "Drawbacks & Risks", "type": "bullets", "items": ["drawback 1", "drawback 2"]},\n'
                '  {"emoji": "📌", "title": "Which Is Better?", "type": "text", "content": "Clear 2-3 line verdict based on facts."}\n'
                ']'
            )
        elif intent == "NEWS_STATUS":
            format_guide = (
                'INTENT DETECTED: CURRENT NEWS & SITUATION UPDATE.\n'
                'Return JSON with "intent": "NEWS_STATUS" and "sections" summarizing verified updates:\n'
                '[\n'
                '  {"emoji": "📰", "title": "Latest Situation", "type": "text", "content": "2-3 line summary of what is happening right now based on the live news."},\n'
                '  {"emoji": "📌", "title": "Key Developments", "type": "bullets", "items": ["verified point 1", "verified point 2", "verified point 3"]},\n'
                '  {"emoji": "👀", "title": "What To Watch Next", "type": "bullets", "items": ["upcoming trigger 1", "upcoming trigger 2"]}\n'
                ']'
            )
        else:
            extra_general = (
                'Because the question involves win/lose/price/impact, you MUST also include:\n'
                '  {"emoji": "✅", "title": "Good Effect", "type": "bullets", "items": ["..."]},\n'
                '  {"emoji": "❌", "title": "Bad Effect", "type": "bullets", "items": ["..."]},\n'
                'and a simple conclusion section.\n'
                if needs_gb else ""
            )
            strat_guidance = (
                f'Since action steps help here, include 4 specific, non-generic steps using this schema:\n{strat_schema}\nand end with:\n{best_strategy_section}'
                if profile.requires_strategies else
                'Only include strategies if the question genuinely asks for decisions/investments/actions; otherwise answer directly and cleanly like ChatGPT/Gemini.'
            )
            format_guide = (
                f'INTENT DETECTED: {intent} QUESTION.\n'
                f'Choose the BEST 3 to 4 section headings and emojis yourself that fit this exact question naturally (like ChatGPT/Gemini).\n'
                f'{extra_general}'
                f'{strat_guidance}\n'
                f'Return JSON with "intent": "{intent}" and "sections": [...].'
            )

        return (
            f"CURRENT DATE CONTEXT: November 2026.\n"
            f"USER QUESTION: {question}\n\n"
            f"LIVE REAL-TIME NEWS, MARKET TRENDS, SOCIAL MEDIA BUZZ & SEARCH TRENDS:\n{facts_text}\n\n"
            f"{format_guide}\n\n"
            "STRICT QUALITY & STRATEGY RULES (DO NOT BREAK THESE):\n"
            "1. FIRST CHECK INTENT: Never return unnecessary financial/stock strategies for casual, theoretical, or simple factual queries.\n"
            "2. NO GENERIC ADVICE (when strategies are included): Strictly FORBIDDEN phrases like 'invest carefully', 'stay updated', 'keep backup cash', 'monitor news', or 'diversify portfolio'.\n"
            "3. BE HYPER-SPECIFIC & USABLE (when strategies are included): Name real relevant sectors, listed companies, platforms, ETFs, or concrete actions tailored to the question.\n"
            "4. USE THE LIVE DATA: In 'why_will_work' and analysis bullets, connect your reasoning directly to the fetched live news or social buzz.\n"
            "5. SIMPLE EVERYDAY ENGLISH: Short clear sentences anyone understands in one reading. No complex jargon.\n"
            "6. Respond ONLY with ONE valid JSON object (no markdown, no backticks, not a JSON array)."
        )

    def _normalize_strategy_item(self, st: Any, idx: int) -> Dict[str, str]:
        if isinstance(st, dict):
            name = str(st.get("name") or f"Strategy {idx}").strip()
            if not re.match(r"^(🎯\s*)?Strategy\s+\d+", name, re.IGNORECASE):
                name = f"Strategy {idx}: {name}"
            return {
                "name": name,
                "what_to_do": str(st.get("what_to_do") or "").strip(),
                "why_will_work": str(st.get("why_will_work") or "").strip(),
                "good_effect": str(st.get("good_effect") or "Helps capture direct gains and upside.").strip(),
                "bad_effect": str(st.get("bad_effect") or "Carries short-term swing or timing risk.").strip(),
                "when_to_do": str(st.get("when_to_do") or "This Week").strip(),
                "cost_effort": str(st.get("cost_effort") or "Medium").strip(),
                "success_chance": str(st.get("success_chance") or "Medium - Based on current trends").strip(),
            }
        return {
            "name": f"Strategy {idx}: {str(st).strip()}",
            "what_to_do": str(st).strip(),
            "why_will_work": "Supported by current public interest and live data.",
            "good_effect": "Creates measurable opportunity.",
            "bad_effect": "Needs proper timing to avoid drops.",
            "when_to_do": "This Week",
            "cost_effort": "Medium",
            "success_chance": "Medium",
        }

    def _normalize_response(self, parsed: Any, profile: QueryAnalysisProfile) -> Dict[str, Any]:
        """Ensures JSON output strictly conforms to the rich dynamic sections schema."""
        if isinstance(parsed, list):
            parsed = parsed[0] if parsed else {}
        if not isinstance(parsed, dict):
            raise ValueError("LLM did not return a JSON object")

        intent = str(parsed.get("intent") or profile.query_type).upper()
        raw_sections = parsed.get("sections", [])

        if not raw_sections and "risk" in parsed:
            raw_sections = [
                {"emoji": "⚠️", "title": "Risk", "type": "text", "content": parsed.get("risk", "")},
                {"emoji": "❓", "title": "Why Will Happen", "type": "bullets", "items": parsed.get("why_will_happen", [])},
                {"emoji": "🔴", "title": "Risk Level", "type": "badge", "level": parsed.get("risk_level", "Medium")},
                {"emoji": "✅", "title": "Strategies", "type": "strategies", "strategies": parsed.get("strategies", [])},
            ]

        clean_sections: List[Dict[str, Any]] = []
        for sec in raw_sections:
            if not isinstance(sec, dict):
                continue
            sec_type = sec.get("type", "text")
            title = str(sec.get("title", "Details")).strip()
            emoji = str(sec.get("emoji", "📌")).strip()

            if sec_type == "badge":
                level = str(sec.get("level", "Medium")).strip().capitalize()
                if level not in ("High", "Medium", "Low", "Critical"):
                    level = "Medium"
                badge_emoji = "🔴" if level in ("High", "Critical") else ("🟡" if level == "Medium" else "🟢")
                clean_sections.append({
                    "emoji": badge_emoji,
                    "title": title,
                    "type": "badge",
                    "level": level,
                })
            elif sec_type == "bullets":
                items = sec.get("items", [])
                if isinstance(items, str):
                    items = [items]
                clean_items = [str(i).strip() for i in items if str(i).strip()]
                if clean_items:
                    clean_sections.append({
                        "emoji": emoji,
                        "title": title,
                        "type": "bullets",
                        "items": clean_items,
                    })
            elif sec_type == "strategies":
                raw_strats = sec.get("strategies", sec.get("items", []))
                clean_strats = [self._normalize_strategy_item(st, idx) for idx, st in enumerate(raw_strats, 1) if st]
                if clean_strats:
                    clean_sections.append({
                        "emoji": emoji,
                        "title": title,
                        "type": "strategies",
                        "strategies": clean_strats,
                    })
            elif sec_type == "best_strategy":
                content = str(sec.get("content") or "").strip()
                strategy_name = str(sec.get("strategy_name") or "").strip()
                if content:
                    clean_sections.append({
                        "emoji": "🏆",
                        "title": title or "BEST STRATEGY FOR YOU",
                        "type": "best_strategy",
                        "strategy_name": strategy_name,
                        "content": content,
                    })
            else:
                content = str(sec.get("content") or "").strip()
                if not content and sec.get("items"):
                    content = " ".join(str(x) for x in sec.get("items", []))
                if content:
                    clean_sections.append({
                        "emoji": emoji,
                        "title": title,
                        "type": "text",
                        "content": content,
                    })

        if not clean_sections:
            raise ValueError("LLM returned empty sections")

        return {
            "intent": intent,
            "sections": clean_sections,
        }

    def _call_groq(self, prompt: str, profile: QueryAnalysisProfile) -> Dict[str, Any]:
        """Calls Groq Cloud API using llama-3.1-8b-instant."""
        url = "https://api.groq.com/openai/v1/chat/completions"
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a senior Query Analyzer, Risk & Strategy AI. Respect detected user intent strictly and return valid raw JSON.",
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.25,
            "response_format": {"type": "json_object"},
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.groq_api_key}",
            },
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            content = data["choices"][0]["message"]["content"]
            clean = re.sub(r"```json\s*|```\s*", "", content).strip()
            return self._normalize_response(json.loads(clean), profile)

    def _call_gemini(self, prompt: str, profile: QueryAnalysisProfile) -> Dict[str, Any]:
        """Calls Google Gemini API with automatic model fallback."""
        models_to_try = ["gemini-3-flash-preview", "gemini-3.1-flash-lite-preview", "gemini-flash-latest"]
        last_error = None

        for model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.gemini_api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.25,
                    "responseMimeType": "application/json",
                },
            }

            try:
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                )
                with urllib.request.urlopen(req, timeout=25) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    clean = re.sub(r"```json\s*|```\s*", "", text).strip()
                    parsed = json.loads(clean)
                    return self._normalize_response(parsed, profile)
            except Exception as e:
                logger.warning(f"Gemini model {model} attempt failed: {e}")
                last_error = e

        raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")

    def _call_openrouter(self, prompt: str, profile: QueryAnalysisProfile) -> Dict[str, Any]:
        """Calls OpenRouter free model API."""
        url = "https://openrouter.ai/api/v1/chat/completions"
        payload = {
            "model": "meta-llama/llama-3.1-8b-instruct:free",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a senior Query Analyzer, Risk & Strategy AI. Return valid raw JSON.",
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.25,
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.openrouter_api_key}",
            },
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            content = data["choices"][0]["message"]["content"]
            clean = re.sub(r"```json\s*|```\s*", "", content).strip()
            return self._normalize_response(json.loads(clean), profile)

    def _dynamic_semantic_synthesis(
        self,
        question: str,
        live_data: Dict[str, Any],
        profile: QueryAnalysisProfile,
    ) -> Dict[str, Any]:
        """Intent-aware local fallback if cloud APIs are offline."""
        if profile.is_conversational:
            return self.build_conversational_response(question, profile)

        intent = profile.query_type
        clean_q = re.sub(
            r"^(what if|what happens if|how will|why will|give strategy for|what is risk if)\s+",
            "",
            profile.cleaned_question.strip().rstrip("?"),
            flags=re.IGNORECASE,
        ).strip()
        news = [re.sub(r"\s+-\s+[A-Za-z0-9\s]+$", "", n["title"]) for n in live_data.get("news", [])]
        headline = news[0] if news else "live data shows active interest around this topic"

        if intent == "SIMPLE_FACTUAL":
            # Evaluate pure arithmetic safely if numeric
            if re.match(r"^\s*[\d\.\s\+\-\*/\(\)]+\s*$", clean_q):
                try:
                    val = eval(clean_q, {"__builtins__": {}}, {})
                    return {
                        "intent": "SIMPLE_FACTUAL",
                        "sections": [{"emoji": "🧮", "title": "Direct Answer", "type": "text", "content": f"The answer to {clean_q} is {val}."}],
                    }
                except Exception:
                    pass
            summary = live_data.get("facts", [headline])[0] if live_data.get("facts") else f"Here is a brief overview regarding '{clean_q}'."
            return {
                "intent": "SIMPLE_FACTUAL",
                "sections": [
                    {"emoji": "💡", "title": "Direct Answer", "type": "text", "content": summary},
                ],
            }

        strat_list = [
            {
                "name": f"Strategy 1: Target high-momentum Indian sector leaders tied to {clean_q[:40]}",
                "what_to_do": "Put a small allocation into leading consumer, food delivery (Zomato/Jubilant), or sector ETFs with strict stop-loss limits.",
                "why_will_work": f"Recent data shows: {headline}.",
                "good_effect": "Direct upside of 8-15% if positive hype turns into real sales.",
                "bad_effect": "Fast 5-10% pullback if results disappoint.",
                "when_to_do": "This Week",
                "cost_effort": "Medium",
                "success_chance": "High - Backed by strong domestic demand",
            },
            {
                "name": "Strategy 2: Launch timed promotional offers for Indian shoppers",
                "what_to_do": "Run limited-time celebration bundles or discount codes on WhatsApp, Instagram, and local apps.",
                "why_will_work": "YouTube search trends and social buzz show active buyer interest around major events.",
                "good_effect": "Quick spike in orders and new customer signups.",
                "bad_effect": "Lower profit margin on discounted goods.",
                "when_to_do": "Today",
                "cost_effort": "Low",
                "success_chance": "High - Very low downside risk",
            },
            {
                "name": "Strategy 3: Lock in supplier inventory before peak demand",
                "what_to_do": "Order fast-moving stock or raw items ahead of peak dates at fixed vendor rates.",
                "why_will_work": "Market trends show prices jump sharply during peak public excitement.",
                "good_effect": "Protects profit margins when competitor costs rise.",
                "bad_effect": "Cash stays tied up if sales move slower than expected.",
                "when_to_do": "This Week",
                "cost_effort": "Medium",
                "success_chance": "Medium - Depends on demand timing",
            },
            {
                "name": "Strategy 4: Hedge short-term price swings using broad Nifty index exposure",
                "what_to_do": "Balance thematic bets with broad Nifty 50 ETF units so a single sector drop does not hurt your whole balance.",
                "why_will_work": "Index funds absorb sudden single-event volatility better than individual small-cap picks.",
                "good_effect": "Keeps overall portfolio steady even if hype fades.",
                "bad_effect": "Lower peak return compared to aggressive single-sector bets.",
                "when_to_do": "This Month",
                "cost_effort": "Low",
                "success_chance": "High - Proven downside protection",
            },
        ]

        best_section = {
            "emoji": "🏆",
            "title": "BEST STRATEGY FOR YOU",
            "type": "best_strategy",
            "strategy_name": strat_list[0]["name"],
            "content": "Start with Strategy 1 first because it targets real spending sectors already seeing rising public buzz. Using strict limits protects your money if surprises happen, while keeping full upside if demand surges.",
        }

        if intent == "STRATEGY":
            return {
                "intent": "STRATEGY",
                "sections": [
                    {"emoji": "🎯", "title": "Best Prioritized Strategies", "type": "strategies", "strategies": strat_list},
                    {"emoji": "⚠️", "title": "Risk If No Strategy", "type": "text", "content": f"Without a clear action plan for {clean_q}, competitors capture peak buyer excitement and sudden price jumps eat into your budget."},
                    best_section,
                ],
            }
        elif intent == "EFFECT":
            return {
                "intent": "EFFECT",
                "sections": [
                    {"emoji": "✅", "title": "Good Effects", "type": "bullets", "items": [f"Boosts spending and demand linked to {clean_q}.", "Lifts sales for retail brands, food delivery, and digital ads."]},
                    {"emoji": "❌", "title": "Bad Effects", "type": "bullets", "items": ["Prices can overheat and drop sharply after peak buzz.", "Short-term crowding can strain transport and delivery timelines."]},
                    {"emoji": "📊", "title": "Overall Effect", "type": "text", "content": f"In simple words, {clean_q} triggers strong short-term demand followed by normal cooling once excitement settles."},
                    {"emoji": "✅", "title": "Strategies", "type": "strategies", "strategies": strat_list},
                    best_section,
                ],
            }
        elif intent == "GOOD_BAD":
            return {
                "intent": "GOOD_BAD",
                "sections": [
                    {"emoji": "✅", "title": "Good Things", "type": "bullets", "items": [f"Creates immediate demand around {clean_q}.", "Encourages business activity and consumer spending."]},
                    {"emoji": "❌", "title": "Bad Things", "type": "bullets", "items": ["Sudden price swings can hurt late buyers.", "Unplanned inventory can sit unsold later."]},
                    {"emoji": "⚖️", "title": "Which Is More?", "type": "text", "content": f"The upside is bigger if you act early with strict risk limits on {clean_q}."},
                    {"emoji": "✅", "title": "What To Do?", "type": "strategies", "strategies": strat_list},
                    best_section,
                ],
            }
        elif intent == "RISK":
            sections: List[Dict[str, Any]] = [
                {"emoji": "⚠️", "title": "Risk", "type": "text", "content": f"Regarding {clean_q}, sudden negative news or disappointment can quickly reduce consumer spending and investor mood."},
                {"emoji": "❓", "title": "Why Will Happen", "type": "bullets", "items": [
                    "Buyers and sponsors pull back quickly when outcomes miss hopes.",
                    headline,
                    "Hype-driven prices reverse fast once public mood shifts.",
                ]},
                {"emoji": "🟡", "title": "Risk Level", "type": "badge", "level": "Medium"},
            ]
            if profile.needs_good_bad_effects:
                sections.extend([
                    {"emoji": "✅", "title": "Good Effect", "type": "bullets", "items": ["Overpriced hype cools down to fair entry prices."]},
                    {"emoji": "❌", "title": "Bad Effect", "type": "bullets", "items": ["Short-term drop in ad revenue, merchandise sales, and investor confidence."]},
                ])
            sections.append({"emoji": "✅", "title": "Strategies", "type": "strategies", "strategies": strat_list})
            sections.append(best_section)
            return {"intent": "RISK", "sections": sections}
        else:
            sections = [
                {"emoji": "💡", "title": "Main Answer", "type": "text", "content": f"Looking at {clean_q}, recent data shows: {headline}."},
            ]
            if profile.requires_strategies:
                sections.append({"emoji": "✅", "title": "Smart Steps", "type": "strategies", "strategies": strat_list})
                sections.append(best_section)
            return {"intent": intent, "sections": sections}

    def analyze(
        self,
        question: str,
        profile: Optional[QueryAnalysisProfile] = None,
        user_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Main Smart Analysis Entrypoint:
        1. Reloads .env keys.
        2. Runs Query Analyzer (QuestionUnderstandingAgent) FIRST.
        3. Immediately returns personalized welcome / concise reply for greetings, small talk, thanks, help, or unclear inputs.
        4. Runs Ambiguous Query Guard for subtle casual phrases.
        5. For analytical / factual questions, fetches live data when needed and generates intent-matched output.
        """
        self._load_env_keys()
        if profile is None:
            profile = question_understanding_agent.analyze_query(question)

        # Fast-path conversational response (never run strategies/news for 'hi', 'thanks', etc.)
        if profile.is_conversational:
            logger.info(f"Query Analyzer fast-path [type={profile.query_type}] for: {question!r}")
            return self.build_conversational_response(question, profile, user_name=user_name)

        # Fast LLM guard for short subtle casual messages (e.g. 'kya haal hai', 'tell me a joke')
        casual_override = self.classify_ambiguous_query(question, profile)
        if casual_override is not None:
            logger.info(f"Query Analyzer LLM Guard classified as casual for: {question!r}")
            return casual_override

        # Use cleaned question (without leading "Hi, ") for sharper search & analysis
        effective_question = profile.cleaned_question

        if profile.requires_live_search:
            search_query = profile.search_keywords or effective_question
            live_data = live_data_service.get_live_context(search_query)
        else:
            live_data = {"news": [], "facts": []}

        facts = live_data.get("facts", [])
        prompt = self._build_prompt(effective_question, facts, profile)

        if self.groq_api_key:
            try:
                logger.info(f"Calling Groq API [query_type={profile.query_type}]...")
                return self._call_groq(prompt, profile)
            except Exception as e:
                logger.warning(f"Groq API call failed: {e}. Trying next provider...")

        if self.gemini_api_key:
            try:
                logger.info(f"Calling Gemini API [query_type={profile.query_type}]...")
                return self._call_gemini(prompt, profile)
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}. Trying next provider...")

        if self.openrouter_api_key:
            try:
                logger.info(f"Calling OpenRouter API [query_type={profile.query_type}]...")
                return self._call_openrouter(prompt, profile)
            except Exception as e:
                logger.warning(f"OpenRouter API call failed: {e}. Falling back to dynamic synthesis...")

        logger.info(f"Using intent-aware dynamic synthesis [query_type={profile.query_type}]...")
        return self._dynamic_semantic_synthesis(effective_question, live_data, profile)


live_llm_service = LiveLLMService()
