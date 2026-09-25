import hashlib
from typing import List, Tuple
from ..schemas.models import EvidenceRecord, VerificationState

class EvidenceVerificationEngine:
    """
    Evidence DNA verification engine enforcing deterministic validation,
    cross-checking, and contradiction detection.
    """

    @staticmethod
    def verify_records(records: List[EvidenceRecord]) -> List[EvidenceRecord]:
        verified_records: List[EvidenceRecord] = []
        for record in records:
            # Deterministic rule 1: Missing URL or title -> REJECTED
            if not record.source_url or not record.title:
                record.verification_status = VerificationState.REJECTED
                record.verification_rationale = "Rejected: Incomplete source metadata or missing canonical URL."
                verified_records.append(record)
                continue

            # Deterministic rule 2: Primary sensor/multilateral validated feed -> VERIFIED
            if record.source_id in ["CONN_WORLDBANK", "CONN_USGS", "CONN_NASA_EONET"]:
                record.verification_status = VerificationState.VERIFIED
                record.verification_rationale = "Verified: Derived directly from official authoritative open sensor/data portal."
            elif record.verification_status == VerificationState.UNVERIFIED:
                record.verification_status = VerificationState.SOURCE_REFERENCED
                record.verification_rationale = "Source referenced: Metadata validated; awaiting independent secondary cross-check."

            verified_records.append(record)

        # Cross-checking and contradiction detection pass
        EvidenceVerificationEngine._detect_corroboration_and_conflicts(verified_records)
        return verified_records

    @staticmethod
    def _detect_corroboration_and_conflicts(records: List[EvidenceRecord]):
        for i, rec_a in enumerate(records):
            for j, rec_b in enumerate(records):
                if i >= j or rec_a.source_id == rec_b.source_id:
                    continue
                # If both refer to same geography and similar keywords
                if rec_a.geography and rec_b.geography and rec_a.geography.lower() == rec_b.geography.lower():
                    # Check for contradiction words
                    words_a = set(rec_a.claim_text.lower().split())
                    words_b = set(rec_b.claim_text.lower().split())
                    
                    has_contradiction = False
                    opposing_pairs = [("increase", "decrease"), ("rise", "fall"), ("growth", "contraction"), ("escalation", "de-escalation")]
                    for w1, w2 in opposing_pairs:
                        if (w1 in words_a and w2 in words_b) or (w2 in words_a and w1 in words_b):
                            has_contradiction = True
                            break
                    
                    if has_contradiction:
                        rec_a.verification_status = VerificationState.CONFLICTING
                        rec_b.verification_status = VerificationState.CONFLICTING
                        rec_a.contradiction_ids.append(rec_b.evidence_id)
                        rec_b.contradiction_ids.append(rec_a.evidence_id)
                        rec_a.verification_rationale = f"Conflicting: Disagrees with evidence {rec_b.evidence_id} regarding trajectory."
                        rec_b.verification_rationale = f"Conflicting: Disagrees with evidence {rec_a.evidence_id} regarding trajectory."
                    else:
                        # Corroborating independent sources
                        if rec_a.verification_status == VerificationState.SOURCE_REFERENCED:
                            rec_a.verification_status = VerificationState.CROSS_CHECKED
                            rec_a.corroboration_ids.append(rec_b.evidence_id)
                        if rec_b.verification_status == VerificationState.SOURCE_REFERENCED:
                            rec_b.verification_status = VerificationState.CROSS_CHECKED
                            rec_b.corroboration_ids.append(rec_a.evidence_id)
