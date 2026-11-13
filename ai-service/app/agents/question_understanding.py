import re
from typing import List, Optional, Tuple
from pydantic import BaseModel
from ..schemas.models import (
    QuestionIntakeRequest,
    IntentOutput,
    IntentCategory,
    ExtractedEntity,
    EntityType,
    EntityExtractionOutput,
    QueryAnalysisProfile,
)
from ..core.llm_adapter import llm_adapter
from ..core.config import settings


class QUCombinedOutput(BaseModel):
    intent: IntentOutput
    entities: EntityExtractionOutput


class QuestionUnderstandingAgent:
    """
    Powerful Query Analyzer Agent (Stages 1, 2, 3):
    - Detects Greetings, Small Talk, Thanks/Goodbye, Identity/Help, and Unclear inputs cleanly.
    - Strips leading greetings when paired with a real question (e.g., "Hi, what is the risk...").
    - Separates Simple Factual questions from Deep Analytical queries.
    - Classifies analytical intent (RISK, EFFECT, GOOD_BAD, STRATEGY, PREDICTION, COMPARISON, NEWS_STATUS, GENERAL).
    - Extracts entities, target geographies, key intent signals, and clean search keywords.
    """

    GREETING_TOKENS = {
        "hi", "hii", "hello", "helo", "hlw", "hlo", "hy", "hey", "yo", "sup", "hola",
        "namaste", "namaskar", "namaskaram", "salam", "salaam", "greetings",
        "gm", "ga", "ge", "mornin", "morning",
    }

    GREETING_PHRASES = (
        "good morning", "good afternoon", "good evening", "good day",
        "hi there", "hello there", "hey there", "hii there", "hey all", "hi all",
    )

    ADDRESSEE_TOKENS = {
        "bro", "bhai", "buddy", "friend", "mate", "sir", "mam", "maam", "team",
        "bot", "ai", "assistant", "geosentinel", "there", "all", "everyone",
        "guys", "dear", "dost", "yaar", "please", "pls",
    }

    SMALL_TALK_PHRASES = (
        "how are you", "how are u", "how r u", "how r you", "hows it going",
        "how is it going", "whats up", "what is up", "wassup", "sup",
        "how you doing", "how do you do", "kya haal", "kya haal hai",
        "kaise ho", "kaise hain", "kaisa hai", "sab badhiya", "all good",
        "nice to meet you", "good to see you", "glad to meet you",
        "are you there", "you there", "anyone there", "are you awake",
        "are you real", "are you human", "tell me a joke", "say something",
    )

    THANKS_BYE_PHRASES = (
        "thank you", "thankyou", "thanks", "thanks a lot", "thank u", "thx", "tysm",
        "ty", "tq", "dhanyawad", "shukriya", "appreciate it",
        "ok", "okay", "okie", "k", "kk", "cool", "great", "nice", "awesome",
        "good", "alright", "fine", "got it", "understood", "noted", "perfect",
        "bye", "goodbye", "good bye", "see you", "see ya", "cya", "gn",
        "good night", "goodnight", "take care", "tata",
    )

    IDENTITY_HELP_PHRASES = (
        "who are you", "what are you", "what is your name", "whats your name",
        "your name", "tell me about yourself", "introduce yourself",
        "what can you do", "what do you do", "how can you help", "how do you work",
        "help", "help me", "what is geosentinel", "about geosentinel",
        "what are your features", "show capabilities",
    )

    UNCLEAR_TOKENS = {
        "test", "testing", "check", "checking", "asdf", "qwer", "qwerty",
        "zxcv", "abc", "abcd", "xyz", "123", "1234", "aaa", "bbb", "hmm",
        "hm", "umm", "uh", "er", "na", "none", "null", "nothing",
    }

    KNOWN_COUNTRIES = {
        "india": "IND", "indian": "IND", "iran": "IRN", "iranian": "IRN",
        "united states": "USA", "us": "USA", "usa": "USA", "america": "USA", "american": "USA",
        "china": "CHN", "chinese": "CHN", "russia": "RUS", "russian": "RUS",
        "ukraine": "UKR", "israel": "ISR", "taiwan": "TWN",
        "uk": "GBR", "united kingdom": "GBR", "britain": "GBR",
        "japan": "JPN", "germany": "DEU", "france": "FRA",
        "saudi arabia": "SAU", "uae": "ARE", "dubai": "ARE",
        "pakistan": "PAK", "bangladesh": "BGD", "sri lanka": "LKA",
        "australia": "AUS", "canada": "CAN", "singapore": "SGP",
        "brazil": "BRA", "south africa": "ZAF", "middle east": "MEA", "europe": "EUR",
    }

    KNOWN_SECTORS = [
        "energy", "oil", "crude", "petroleum", "gas", "shipping", "logistics",
        "trade", "technology", "tech", "ai", "agriculture", "food", "finance",
        "market", "stock", "stocks", "nifty", "sensex", "gold", "crypto",
        "cricket", "sports", "world cup", "ipl", "aviation", "airlines",
        "retail", "fmcg", "banking", "inflation", "currency", "rupee", "dollar",
        "defense", "semiconductor", "healthcare", "tourism", "real estate",
    ]

    KNOWN_STRATEGIC_LOCATIONS = {
        "strait of hormuz": ("Strait of Hormuz", EntityType.INFRASTRUCTURE, "infra_hormuz"),
        "hormuz": ("Strait of Hormuz", EntityType.INFRASTRUCTURE, "infra_hormuz"),
        "persian gulf": ("Persian Gulf", EntityType.LOCATION, "loc_persian_gulf"),
        "red sea": ("Red Sea", EntityType.LOCATION, "loc_red_sea"),
        "suez canal": ("Suez Canal", EntityType.INFRASTRUCTURE, "infra_suez"),
        "bab el-mandeb": ("Bab el-Mandeb", EntityType.INFRASTRUCTURE, "infra_bab_el_mandeb"),
        "padur": ("Padur Strategic Petroleum Reserve", EntityType.INFRASTRUCTURE, "infra_spr_padur"),
        "mangalore": ("Mangalore Strategic Petroleum Reserve", EntityType.INFRASTRUCTURE, "infra_spr_mangalore"),
    }

    ANALYTICAL_SIGNALS = (
        "risk", "risks", "danger", "threat", "unsafe", "wrong", "lose", "loses", "lost",
        "effect", "effects", "impact", "impacts", "consequence", "outcome", "affect",
        "happen", "happens", "spillover", "good", "bad", "pros", "cons", "benefit",
        "strategy", "strategies", "plan", "prepare", "invest", "buy", "sell", "trade",
        "market", "stock", "stocks", "price", "prices", "economy", "economic", "gdp",
        "inflation", "oil", "gold", "cricket", "world cup", "win", "wins", "won",
        "predict", "prediction", "forecast", "future", "2026", "2027", "2028",
        "compare", "comparison", "versus", "vs", "difference", "news", "latest",
        "status", "update", "situation", "earthquake", "disaster", "war", "conflict",
        "sanctions", "tariff", "tariffs", "indicator", "indicators", "world bank",
    )

    @staticmethod
    def _collapse_repeats(word: str) -> str:
        """Collapses 3+ repeated chars (and double 'i'/'o'/'e'/'y' at ends) for greeting detection."""
        w = re.sub(r"(.)\1{2,}", r"\1", word.lower())
        w = re.sub(r"([ihyoau])\1+$", r"\1", w)
        return w

    @staticmethod
    def _clean_tokens(text: str) -> List[str]:
        stripped = re.sub(r"[^\w\s]", " ", text.lower())
        return [t for t in stripped.split() if t]

    def _strip_leading_greeting(self, text: str) -> Tuple[str, bool]:
        """Strips leading greetings like 'Hi,' or 'Hello bro,' from longer messages."""
        original = text.strip()
        lower = original.lower()

        for phrase in sorted(self.GREETING_PHRASES, key=len, reverse=True):
            m = re.match(rf"^{re.escape(phrase)}[\s,!.:;\-]*", lower)
            if m:
                rem = original[m.end():].strip()
                rem = self._strip_leading_addressees(rem)
                return rem, True

        tokens = original.split()
        if not tokens:
            return "", False

        first_alpha = re.sub(r"[^\w]", "", tokens[0]).lower()
        first_collapsed = self._collapse_repeats(first_alpha)
        if first_alpha in self.GREETING_TOKENS or first_collapsed in self.GREETING_TOKENS:
            rem = " ".join(tokens[1:]).lstrip(" ,!.:;-")
            rem = self._strip_leading_addressees(rem)
            return rem, True

        return original, False

    def _strip_leading_addressees(self, text: str) -> str:
        tokens = text.split()
        while tokens:
            cleaned = re.sub(r"[^\w]", "", tokens[0]).lower()
            collapsed = self._collapse_repeats(cleaned)
            if cleaned in self.ADDRESSEE_TOKENS or collapsed in self.ADDRESSEE_TOKENS:
                tokens.pop(0)
                if tokens:
                    tokens[0] = tokens[0].lstrip(",!.:;-")
            else:
                break
        return " ".join(tokens).strip(" ,!.:;-")

    @staticmethod
    def _extract_intro_name(text: str) -> Optional[str]:
        """Extracts user's name if they introduce themselves (e.g. 'I am Abhi', 'my name is Rahul')."""
        m = re.match(
            r"^\s*(?:my name is|i am|i'm|im|this is|myself)\s+([a-zA-Z]{2,24})(?:\s*[!.,]*)?$",
            text.strip(),
            flags=re.IGNORECASE,
        )
        if m:
            candidate = m.group(1).strip()
            if candidate.lower() not in {"a", "an", "the", "good", "fine", "ok", "okay", "here", "back", "new"}:
                return candidate.title()
        return None

    def _detect_conversational_type(self, original: str, stripped: str, had_greeting: bool) -> Optional[str]:
        """Determines if the input is a greeting, small talk, thanks/bye, identity/help, or unclear."""
        raw_clean = original.strip()
        alpha_chars = re.findall(r"[a-zA-Z0-9]", raw_clean)
        if not raw_clean or len(alpha_chars) == 0:
            return "UNCLEAR"

        # If leading greeting stripped and nothing left -> pure GREETING
        if had_greeting and not stripped.strip():
            return "GREETING"

        candidate = stripped if had_greeting and stripped else raw_clean
        if self._extract_intro_name(candidate):
            return "GREETING"

        cand_norm = " ".join(self._clean_tokens(candidate))
        cand_collapsed = " ".join(self._collapse_repeats(t) for t in self._clean_tokens(candidate))

        if not cand_norm:
            return "GREETING" if had_greeting else "UNCLEAR"

        # Exact or near-exact thanks / acknowledgement / bye
        if cand_norm in self.THANKS_BYE_PHRASES or cand_collapsed in self.THANKS_BYE_PHRASES:
            return "THANKS_BYE"
        if any(cand_norm == p or cand_norm.startswith(p + " ") and len(cand_norm.split()) <= 5 for p in ("thank you", "thanks", "goodbye", "good bye", "bye")):
            return "THANKS_BYE"

        # Small talk / wellbeing
        if any(p == cand_norm or (len(cand_norm.split()) <= 7 and p in cand_norm) for p in self.SMALL_TALK_PHRASES):
            return "SMALL_TALK"

        # Identity / capabilities / help
        if any(p == cand_norm or (len(cand_norm.split()) <= 7 and p in cand_norm) for p in self.IDENTITY_HELP_PHRASES):
            return "IDENTITY_HELP"

        # Pure greetings (e.g. multiple greeting words like "hi hello hey")
        tokens = self._clean_tokens(candidate)
        if tokens and all(
            t in self.GREETING_TOKENS or self._collapse_repeats(t) in self.GREETING_TOKENS or t in self.ADDRESSEE_TOKENS
            for t in tokens
        ):
            return "GREETING"

        # Unclear / single char / keyboard mash / pure test string
        if len(alpha_chars) == 1 or (len(tokens) == 1 and tokens[0] in self.UNCLEAR_TOKENS):
            return "UNCLEAR"

        # If leading greeting was stripped and remaining is 1 unclear token like "hii bro?" -> GREETING
        if had_greeting and len(tokens) == 1 and len(tokens[0]) <= 2 and tokens[0] not in self.KNOWN_COUNTRIES:
            return "GREETING"

        return None

    def _build_search_keywords(self, question: str) -> str:
        clean = re.sub(
            r"^(please\s+|can you\s+|could you\s+|tell me\s+|explain\s+|what if\s+|what is the\s+|what are the\s+|what will be\s+|give strategy for\s+|give me\s+|if\s+)",
            "",
            question.strip(),
            flags=re.IGNORECASE,
        )
        clean = re.sub(r"[?!.]+$", "", clean).strip()
        stop = {
            "what", "will", "be", "the", "should", "i", "use", "for", "a", "an",
            "to", "is", "are", "of", "on", "in", "then", "me", "please", "can", "you",
        }
        words = [w for w in clean.split() if w.lower() not in stop]
        return " ".join(words[:8]) if words else clean[:80]

    def _extract_entities(self, question: str, geographies: Optional[List[str]] = None) -> List[ExtractedEntity]:
        q_lower = question.lower()
        entities: List[ExtractedEntity] = []
        seen_ids = set()

        for name, code in self.KNOWN_COUNTRIES.items():
            pattern = r"\b" + re.escape(name) + r"\b"
            if re.search(pattern, q_lower) and code not in seen_ids:
                seen_ids.add(code)
                entities.append(ExtractedEntity(
                    name=name.title(),
                    entity_type=EntityType.COUNTRY,
                    canonical_id=code,
                    aliases=[code],
                ))

        if geographies:
            for g in geographies:
                g_code = g.upper()
                if g_code not in seen_ids:
                    seen_ids.add(g_code)
                    entities.append(ExtractedEntity(
                        name=g,
                        entity_type=EntityType.COUNTRY,
                        canonical_id=g_code,
                        aliases=[g_code],
                    ))

        for loc_key, (loc_name, loc_type, loc_id) in self.KNOWN_STRATEGIC_LOCATIONS.items():
            pattern = r"\b" + re.escape(loc_key) + r"\b"
            if re.search(pattern, q_lower) and loc_id not in seen_ids:
                seen_ids.add(loc_id)
                entities.append(ExtractedEntity(
                    name=loc_name,
                    entity_type=loc_type,
                    canonical_id=loc_id,
                    aliases=[loc_name, loc_key],
                ))

        for s in self.KNOWN_SECTORS:
            pattern = r"\b" + re.escape(s) + r"\b"
            sec_id = f"sec_{s.replace(' ', '_')}"
            if re.search(pattern, q_lower) and sec_id not in seen_ids:
                seen_ids.add(sec_id)
                entities.append(ExtractedEntity(
                    name=s.title(),
                    entity_type=EntityType.SECTOR,
                    canonical_id=sec_id,
                ))

        return entities

    def analyze_query(
        self,
        question: str,
        geographies: Optional[List[str]] = None,
    ) -> QueryAnalysisProfile:
        """
        Comprehensive Query Analyzer:
        Evaluates user intent, detects conversational vs factual vs analytical queries,
        extracts entities/signals, and optimizes downstream routing & live search keywords.
        """
        stripped_text, had_greeting = self._strip_leading_greeting(question)
        conv_type = self._detect_conversational_type(question, stripped_text, had_greeting)
        intro_name = self._extract_intro_name(stripped_text if had_greeting and stripped_text else question)

        if conv_type is not None:
            rationale_map = {
                "GREETING": "Detected conversational greeting; routing to personalized welcome with system specialities & usage guide.",
                "SMALL_TALK": "Detected conversational small talk; responding naturally and inviting user query.",
                "THANKS_BYE": "Detected gratitude, acknowledgement, or closing phrase; returning concise courtesy reply.",
                "IDENTITY_HELP": "Detected assistant identity or help request; summarizing capabilities concisely.",
                "UNCLEAR": "Detected empty, ambiguous, or non-informative input; prompting user for a clear query.",
            }
            return QueryAnalysisProfile(
                original_question=question,
                cleaned_question=question.strip(),
                query_type=conv_type,
                intent_category=IntentCategory.CONVERSATIONAL,
                is_conversational=True,
                requires_live_search=False,
                requires_strategies=False,
                needs_good_bad_effects=False,
                greeting_stripped=had_greeting,
                extracted_user_name=intro_name,
                search_keywords="",
                complexity="conversational",
                confidence=0.98,
                key_signals=[conv_type.lower()],
                entities=[],
                target_geographies=list(geographies or []),
                intent_rationale=rationale_map.get(conv_type, "Conversational input detected."),
            )

        effective_q = stripped_text if (had_greeting and stripped_text) else question.strip()
        q_lower = effective_q.lower()
        entities = self._extract_entities(effective_q, geographies)
        tokens = self._clean_tokens(effective_q)

        # Match analytical keywords & intent
        has_good_bad = any(p in q_lower for p in (
            "good and bad", "good or bad", "pros and cons", "both good and bad",
            "benefits and risks", "advantages and disadvantages", "good vs bad",
        ))
        has_strategy = any(p in q_lower for p in (
            "strategy", "strategies", "what strategy", "what to do", "how to prepare",
            "action plan", "what steps", "how should", "give plan", "best plan", "recommend", "mitigate",
        ))
        has_risk = any(re.search(r"\b" + re.escape(w) + r"\b", q_lower) for w in (
            "risk", "risks", "danger", "threat", "unsafe",
        )) or "what could go wrong" in q_lower
        has_effect = any(p in q_lower for p in (
            "effect", "effects", "impact", "impacts", "what will happen", "will happen",
            "affect", "outcome", "consequence", "consequences", "spillover", "result of",
        ))
        has_comparison = any(p in q_lower for p in (
            "compare ", "comparison", " vs ", " versus ", "difference between", "better than",
        ))
        has_prediction = any(p in q_lower for p in (
            "predict", "prediction", "forecast", "outlook", "future of", "what if",
            "next month", "next year", "2027", "2028",
        ))
        has_news = any(p in q_lower for p in (
            "latest news", "current situation", "current status", "latest update",
            "what is happening", "indicator", "indicators", "world bank", "recent earthquakes",
        ))
        has_win_lose_price = has_effect or any(
            re.search(r"\b" + re.escape(w) + r"\b", q_lower)
            for w in ("win", "wins", "won", "lose", "loses", "lost", "price", "prices", "market")
        )

        # Simple factual / definition / math check
        is_pure_math = bool(re.match(r"^\s*[\d\.\s\+\-\*/x×÷\(\)=]+\??\s*$", effective_q))
        is_factual_prefix = any(q_lower.startswith(p) for p in (
            "what is ", "what's ", "who is ", "where is ", "when was ", "when did ",
            "define ", "meaning of ", "full form of ", "capital of ", "how many ", "how tall ",
        ))
        has_event_keywords = any(
            re.search(r"\b" + re.escape(w) + r"\b", q_lower)
            for w in ("war", "conflict", "crisis", "sanctions", "earthquake", "disaster")
        )

        signals: List[str] = []
        if has_good_bad:
            query_type = "GOOD_BAD"
            intent_cat = IntentCategory.IMPACT_ANALYSIS
            requires_strategies = True
            signals.append("good_bad")
        elif has_strategy:
            query_type = "STRATEGY"
            intent_cat = IntentCategory.STRATEGY_COMPARISON
            requires_strategies = True
            signals.append("strategy")
        elif has_risk:
            query_type = "RISK"
            intent_cat = IntentCategory.IMPACT_ANALYSIS
            requires_strategies = True
            signals.append("risk")
        elif has_effect:
            query_type = "EFFECT"
            intent_cat = IntentCategory.IMPACT_ANALYSIS
            requires_strategies = True
            signals.append("effect")
        elif has_comparison:
            query_type = "COMPARISON"
            intent_cat = IntentCategory.IMPACT_ANALYSIS
            requires_strategies = False
            signals.append("comparison")
        elif has_prediction:
            query_type = "PREDICTION"
            intent_cat = IntentCategory.CONDITIONAL_SCENARIO if "what if" in q_lower else IntentCategory.FORECAST_PREDICTION
            requires_strategies = True
            signals.append("prediction")
        elif has_news:
            query_type = "NEWS_STATUS"
            intent_cat = IntentCategory.SITUATIONAL_SUMMARY
            requires_strategies = False
            signals.append("news_status")
        elif is_pure_math or (is_factual_prefix and len(tokens) <= 8 and not has_win_lose_price and not has_event_keywords):
            query_type = "SIMPLE_FACTUAL"
            intent_cat = IntentCategory.SIMPLE_FACTUAL
            requires_strategies = False
            signals.append("simple_factual")
        else:
            query_type = "GENERAL"
            intent_cat = IntentCategory.IMPACT_ANALYSIS
            requires_strategies = has_win_lose_price or len(entities) > 0
            signals.append("general")

        if has_win_lose_price:
            signals.append("good_bad_effects_needed")

        target_geos = sorted({e.canonical_id for e in entities if e.entity_type == EntityType.COUNTRY and e.canonical_id})
        requires_live = not is_pure_math and (query_type != "SIMPLE_FACTUAL" or any(w in q_lower for w in ("who is", "current", "today", "price", "pm", "president")))
        complexity = "simple" if query_type == "SIMPLE_FACTUAL" else ("deep_strategic" if query_type in ("STRATEGY", "RISK", "EFFECT", "GOOD_BAD") else "analytical")

        return QueryAnalysisProfile(
            original_question=question,
            cleaned_question=effective_q,
            query_type=query_type,
            intent_category=intent_cat,
            is_conversational=False,
            requires_live_search=requires_live,
            requires_strategies=requires_strategies,
            needs_good_bad_effects=has_win_lose_price,
            greeting_stripped=had_greeting,
            search_keywords=self._build_search_keywords(effective_q) if requires_live else "",
            complexity=complexity,
            confidence=0.92,
            key_signals=signals,
            entities=entities,
            target_geographies=target_geos,
            intent_rationale=f"Query Analyzer classified query as {query_type} ({complexity}) with signals {signals}.",
        )

    def _fallback_process(self, request: QuestionIntakeRequest) -> Tuple[IntentOutput, EntityExtractionOutput]:
        profile = self.analyze_query(request.question, request.geographies)

        intent_out = IntentOutput(
            primary_intent=profile.intent_category,
            confidence=profile.confidence,
            requires_geocausal=not profile.is_conversational and profile.query_type != "SIMPLE_FACTUAL",
            requires_scenario=profile.query_type in ("EFFECT", "PREDICTION", "NEWS_STATUS"),
            requires_strategy=profile.requires_strategies,
            intent_rationale=profile.intent_rationale,
        )

        entity_out = EntityExtractionOutput(
            entities=profile.entities,
            unresolved_ambiguities=[],
        )

        return intent_out, entity_out

    def _fallback_combined(self, request: QuestionIntakeRequest) -> QUCombinedOutput:
        intent_out, entity_out = self._fallback_process(request)
        return QUCombinedOutput(intent=intent_out, entities=entity_out)

    async def process(self, request: QuestionIntakeRequest) -> Tuple[IntentOutput, EntityExtractionOutput]:
        profile = self.analyze_query(request.question, request.geographies)
        if profile.is_conversational:
            return self._fallback_process(request)

        if settings.MODEL_PROVIDER in ["local_fallback", "live_llm"]:
            return self._fallback_process(request)

        try:
            prompt = f"Analyze this geopolitical question: '{profile.cleaned_question}'. Extract the intent and any entities (countries, sectors, organizations)."
            result, _ = await llm_adapter.generate_structured(
                prompt,
                QUCombinedOutput,
                fallback_factory=lambda: self._fallback_combined(request),
            )
            return result.intent, result.entities
        except Exception:
            return self._fallback_process(request)


question_understanding_agent = QuestionUnderstandingAgent()
