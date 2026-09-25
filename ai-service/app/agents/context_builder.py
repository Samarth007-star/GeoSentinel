from typing import List
from ..schemas.models import EvidenceRecord, ContextSnapshot, VerificationState

class ContextBuilderAgent:
    """
    Stage 7: Assembles session-specific facts, source-referenced claims,
    conflicts, and evidence records into a bounded context snapshot.
    """

    def build_context(self, session_id: str, evidence_items: List[EvidenceRecord]) -> ContextSnapshot:
        verified_facts: List[str] = []
        source_claims: List[str] = []
        conflicts: List[str] = []

        for ev in evidence_items:
            if ev.verification_status in [VerificationState.VERIFIED, VerificationState.CROSS_CHECKED]:
                verified_facts.append(f"[{ev.source_name}] {ev.claim_text}")
            elif ev.verification_status == VerificationState.CONFLICTING:
                conflicts.append(f"[{ev.source_name}] {ev.claim_text} (Note: Contradicted by alternative source)")
            else:
                source_claims.append(f"[{ev.source_name}] {ev.claim_text}")

        missing_data = []
        if not any("energy" in ev.claim_text.lower() for ev in evidence_items):
            missing_data.append("Real-time crude shipping vessel transits unavailable.")

        return ContextSnapshot(
            session_id=session_id,
            verified_facts=verified_facts,
            source_referenced_claims=source_claims,
            conflicting_claims=conflicts,
            evidence_items=evidence_items,
            missing_data_disclosures=missing_data
        )

context_builder_agent = ContextBuilderAgent()
