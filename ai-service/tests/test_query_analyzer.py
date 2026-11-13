from app.agents.question_understanding import question_understanding_agent
from app.services.llm_service import live_llm_service
from app.orchestration.pipeline import geosentinel_pipeline
from app.schemas.models import QuestionIntakeRequest, IntentCategory


def _run_fast_coro(coro):
    """Steps a zero-await fast-path coroutine synchronously inside restricted sandboxes."""
    try:
        coro.send(None)
    except StopIteration as exc:
        return exc.value
    raise AssertionError("Fast-path coroutine unexpectedly awaited external I/O")


def test_greetings_and_conversational_fast_path():
    for msg in ["hi", "hii", "Hiiii!!", "hello bro", "hey there", "namaste", "gm", "Good morning!"]:
        profile = question_understanding_agent.analyze_query(msg)
        assert profile.is_conversational is True, f"Expected conversational for {msg!r}"
        assert profile.query_type == "GREETING", f"Expected GREETING for {msg!r}, got {profile.query_type}"
        assert profile.intent_category == IntentCategory.CONVERSATIONAL
        assert profile.requires_strategies is False
        assert profile.requires_live_search is False


def test_intro_name_extraction_from_greeting():
    profile = question_understanding_agent.analyze_query("hii I am Abhi")
    assert profile.is_conversational is True
    assert profile.query_type == "GREETING"
    assert profile.extracted_user_name == "Abhi"


def test_small_talk_thanks_identity_unclear():
    cases = [
        ("how are you?", "SMALL_TALK"),
        ("whats up bro", "SMALL_TALK"),
        ("thank you so much", "THANKS_BYE"),
        ("okkk", "THANKS_BYE"),
        ("byeee", "THANKS_BYE"),
        ("who are you", "IDENTITY_HELP"),
        ("what can you do", "IDENTITY_HELP"),
        ("???", "UNCLEAR"),
        ("test", "UNCLEAR"),
    ]
    for msg, expected in cases:
        profile = question_understanding_agent.analyze_query(msg)
        assert profile.is_conversational is True, f"Expected conversational for {msg!r}"
        assert profile.query_type == expected, f"For {msg!r} expected {expected}, got {profile.query_type}"


def test_leading_greeting_stripped_for_real_query():
    profile = question_understanding_agent.analyze_query(
        "Hi, what is the risk if India loses World Cup 2027?"
    )
    assert profile.is_conversational is False
    assert profile.greeting_stripped is True
    assert profile.query_type == "RISK"
    assert profile.needs_good_bad_effects is True
    assert profile.requires_strategies is True
    assert any(e.canonical_id == "IND" for e in profile.entities)


def test_simple_factual_vs_analytical_intents():
    factual = question_understanding_agent.analyze_query("What is inflation?")
    assert factual.is_conversational is False
    assert factual.query_type == "SIMPLE_FACTUAL"
    assert factual.requires_strategies is False

    effect = question_understanding_agent.analyze_query(
        "If India wins World Cup 2027 what will be effect on market?"
    )
    assert effect.query_type == "EFFECT"
    assert effect.needs_good_bad_effects is True

    strategy = question_understanding_agent.analyze_query(
        "Give strategy for India market if India wins World Cup 2027?"
    )
    assert strategy.query_type == "STRATEGY"
    assert strategy.requires_strategies is True


def test_pipeline_short_circuits_on_hii_with_name_speciality_and_usage():
    req = QuestionIntakeRequest(session_id="sess_hi_test", question="hii", user_name="Abhi")
    res = _run_fast_coro(geosentinel_pipeline.execute(req))
    assert res.status == "COMPLETED"
    assert res.answer.relevant_evidence == []
    assert res.answer.impact_analysis == []
    assert res.answer.strategy_recommendations == []
    assert res.answer.chat_output is not None
    assert res.answer.chat_output["intent"] == "GREETING"

    sections = res.answer.chat_output["sections"]
    assert len(sections) == 3
    assert "Abhi" in sections[0]["title"]
    assert "Abhi" in sections[0]["content"]
    assert "Speciality" in sections[1]["title"]
    assert len(sections[1]["items"]) >= 3
    assert "How to Use" in sections[2]["title"]
    assert len(sections[2]["items"]) >= 3

    # Self-introduction name override
    req2 = QuestionIntakeRequest(session_id="sess_hi_2", question="hii I am Rahul", user_name="Admin")
    res2 = _run_fast_coro(geosentinel_pipeline.execute(req2))
    assert "Rahul" in res2.answer.chat_output["sections"][0]["title"]

    # Identity response includes Speciality + How to Use
    id_profile = question_understanding_agent.analyze_query("what can you do?")
    id_out = live_llm_service.build_conversational_response("what can you do?", id_profile, user_name="Abhi")
    assert id_out["intent"] == "IDENTITY_HELP"
    assert "Abhi" in id_out["sections"][0]["title"]
