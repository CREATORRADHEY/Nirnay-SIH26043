"""Golden Jury Demo Dataset Seed Script for NIRNAY.

Run manually:
    python scripts/seed_golden_demo.py [--reset]
"""
import argparse
from datetime import datetime, timezone
import os
import sys
import uuid

# Ensure apps/api is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import SessionLocal, engine
from app.core.enums import (
    CommitmentStatus,
    ConditionStatus,
    OperationalStatus,
    QualificationRoute,
    ReadinessStatus,
)
from app.models.actor import Actor
from app.models.base import Base
from app.models.challenge import Challenge
from app.models.challenge_hei_candidate import ChallengeHEICandidate
from app.models.commitment import Commitment
from app.models.evidence import Evidence
from app.models.hei_capability import HEICapability
from app.models.organization import Organization
from app.models.outcome_assessment import OutcomeAssessment
from app.models.pilot import Pilot
from app.models.pilot_evidence_plan import PilotEvidencePlan
from app.models.pilot_operational_state import PilotOperationalState
from app.models.qualification_decision import QualificationDecision
from app.models.readiness_condition import ReadinessCondition, readiness_condition_commitment_dependencies
from app.models.readiness_decision import ReadinessDecision, readiness_decision_conditions

# Deterministic UUID Constants
REVIEWER_ACTOR_ID = uuid.UUID("d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c")

GOV_ORG_ID = uuid.UUID("c0a80000-0000-4000-8000-000000000001")
HEI_1_ORG_ID = uuid.UUID("c0a80000-0000-4000-8000-000000000002")  # BIT Mesra
HEI_1_CAP_ID = uuid.UUID("c0a80000-0000-4000-8000-000000000102")
HEI_2_ORG_ID = uuid.UUID("c0a80000-0000-4000-8000-000000000003")  # NIT Jamshedpur
HEI_2_CAP_ID = uuid.UUID("c0a80000-0000-4000-8000-000000000103")
HEI_3_ORG_ID = uuid.UUID("c0a80000-0000-4000-8000-000000000004")  # IIT ISM Dhanbad

# Scenario A UUIDs
SCENARIO_A_CHALLENGE_ID = uuid.UUID("c0a80001-0000-4000-8000-000000000001")
SCENARIO_A_EVIDENCE_ID = uuid.UUID("e0a80001-0000-4000-8000-000000000001")
SCENARIO_A_QUAL_ID = uuid.UUID("a0a80001-0000-4000-8000-000000000001")
SCENARIO_A_CANDIDATE_ID = uuid.UUID("a0a80001-0000-4000-8000-000000000002")
SCENARIO_A_COMMITMENT_1_ID = uuid.UUID("a0a80001-0000-4000-8000-000000000003")
SCENARIO_A_CONDITION_1_ID = uuid.UUID("a0a80001-0000-4000-8000-000000000004")
SCENARIO_A_CONDITION_2_ID = uuid.UUID("a0a80001-0000-4000-8000-000000000005")
SCENARIO_A_READINESS_DECISION_1_ID = uuid.UUID("a0a80001-0000-4000-8000-000000000006")

# Scenario B UUIDs
SCENARIO_B_CHALLENGE_ID = uuid.UUID("c0a80002-0000-4000-8000-000000000002")
SCENARIO_B_EVIDENCE_ID = uuid.UUID("e0a80002-0000-4000-8000-000000000002")
SCENARIO_B_QUAL_ID = uuid.UUID("b0a80002-0000-4000-8000-000000000001")
SCENARIO_B_CANDIDATE_ID = uuid.UUID("b0a80002-0000-4000-8000-000000000002")
SCENARIO_B_COMMITMENT_1_ID = uuid.UUID("b0a80002-0000-4000-8000-000000000003")
SCENARIO_B_CONDITION_1_ID = uuid.UUID("b0a80002-0000-4000-8000-000000000004")
SCENARIO_B_READINESS_DECISION_1_ID = uuid.UUID("b0a80002-0000-4000-8000-000000000005")
SCENARIO_B_PILOT_ID = uuid.UUID("b0a80002-0000-4000-8000-000000000006")
SCENARIO_B_OP_STATE_1_ID = uuid.UUID("b0a80002-0000-4000-8000-000000000007")
SCENARIO_B_OP_STATE_2_ID = uuid.UUID("b0a80002-0000-4000-8000-000000000008")
SCENARIO_B_EVIDENCE_PLAN_1_ID = uuid.UUID("b0a80002-0000-4000-8000-000000000009")


def reset_golden_demo_records(db: Session):
    """Safely reset ONLY records belonging to the golden demo scenarios."""
    print("--> Resetting Golden Demo mutated/live state...")
    challenge_ids = [SCENARIO_A_CHALLENGE_ID, SCENARIO_B_CHALLENGE_ID]

    # Delete outcomes
    pilots = db.query(Pilot).filter(Pilot.challenge_id.in_(challenge_ids)).all()
    pilot_ids = [p.id for p in pilots]
    if pilot_ids:
        db.query(OutcomeAssessment).filter(OutcomeAssessment.pilot_id.in_(pilot_ids)).delete(synchronize_session=False)
        db.query(PilotEvidencePlan).filter(PilotEvidencePlan.pilot_id.in_(pilot_ids)).delete(synchronize_session=False)
        db.query(PilotOperationalState).filter(PilotOperationalState.pilot_id.in_(pilot_ids)).delete(synchronize_session=False)
        db.query(Pilot).filter(Pilot.id.in_(pilot_ids)).delete(synchronize_session=False)

    # Delete readiness decisions and associations
    rd_list = db.query(ReadinessDecision).filter(ReadinessDecision.challenge_id.in_(challenge_ids)).all()
    rd_ids = [rd.id for rd in rd_list]
    if rd_ids:
        db.execute(readiness_decision_conditions.delete().where(readiness_decision_conditions.c.readiness_decision_id.in_(rd_ids)))
        db.query(ReadinessDecision).filter(ReadinessDecision.id.in_(rd_ids)).delete(synchronize_session=False)

    # Delete readiness conditions and commitment dependencies
    rc_list = db.query(ReadinessCondition).filter(ReadinessCondition.challenge_id.in_(challenge_ids)).all()
    rc_ids = [rc.id for rc in rc_list]
    if rc_ids:
        db.execute(readiness_condition_commitment_dependencies.delete().where(readiness_condition_commitment_dependencies.c.readiness_condition_id.in_(rc_ids)))
        db.query(ReadinessCondition).filter(ReadinessCondition.id.in_(rc_ids)).delete(synchronize_session=False)

    # Delete commitments
    db.query(Commitment).filter(Commitment.challenge_id.in_(challenge_ids)).delete(synchronize_session=False)

    # Delete candidates
    db.query(ChallengeHEICandidate).filter(ChallengeHEICandidate.challenge_id.in_(challenge_ids)).delete(synchronize_session=False)

    # Delete qualification decisions
    db.query(QualificationDecision).filter(QualificationDecision.challenge_id.in_(challenge_ids)).delete(synchronize_session=False)

    # Delete evidence
    db.query(Evidence).filter(Evidence.challenge_id.in_(challenge_ids)).delete(synchronize_session=False)

    # Delete challenges
    db.query(Challenge).filter(Challenge.id.in_(challenge_ids)).delete(synchronize_session=False)

    db.commit()
    print("--> Reset complete.")


def seed_golden_demo_data(reset: bool = False):
    print("=== Starting NIRNAY Golden Jury Demo Seed ===")
    Base.metadata.create_all(engine)
    db: Session = SessionLocal()

    try:
        if reset:
            reset_golden_demo_records(db)

        # 1. Reviewer Actor
        reviewer = db.query(Actor).filter(Actor.id == REVIEWER_ACTOR_ID).first()
        if not reviewer:
            reviewer = Actor(
                id=REVIEWER_ACTOR_ID,
                display_name="Aditi Verma — Demo State Innovation Reviewer",
                is_active=True,
            )
            db.add(reviewer)
            db.commit()

        # 2. Government & HEI Organizations
        gov_org = db.query(Organization).filter(Organization.id == GOV_ORG_ID).first()
        if not gov_org:
            gov_org = Organization(
                id=GOV_ORG_ID,
                name="Jharkhand Urban Development & Housing Department",
                organization_type="GOVERNMENT",
                district="Ranchi",
                state="Jharkhand",
                is_active=True,
            )
            db.add(gov_org)

        hei_1 = db.query(Organization).filter(Organization.id == HEI_1_ORG_ID).first()
        if not hei_1:
            hei_1 = Organization(
                id=HEI_1_ORG_ID,
                name="Birla Institute of Technology, Mesra",
                organization_type="HEI",
                district="Ranchi",
                state="Jharkhand",
                is_active=True,
            )
            db.add(hei_1)

        hei_2 = db.query(Organization).filter(Organization.id == HEI_2_ORG_ID).first()
        if not hei_2:
            hei_2 = Organization(
                id=HEI_2_ORG_ID,
                name="National Institute of Technology, Jamshedpur",
                organization_type="HEI",
                district="East Singhbhum",
                state="Jharkhand",
                is_active=True,
            )
            db.add(hei_2)

        hei_3 = db.query(Organization).filter(Organization.id == HEI_3_ORG_ID).first()
        if not hei_3:
            hei_3 = Organization(
                id=HEI_3_ORG_ID,
                name="IIT (ISM) Dhanbad",
                organization_type="HEI",
                district="Dhanbad",
                state="Jharkhand",
                is_active=True,
            )
            db.add(hei_3)

        db.commit()

        # Capabilities
        cap_1 = db.query(HEICapability).filter(HEICapability.id == HEI_1_CAP_ID).first()
        if not cap_1:
            cap_1 = HEICapability(
                id=HEI_1_CAP_ID,
                organization_id=HEI_1_ORG_ID,
                capability_type="RESEARCH_LAB",
                name="Urban Waste Recycling & Bio-Digestion Lab",
                discipline="Environmental Engineering",
                description="Specialized lab for organic dry waste processing, sorting automation, and micro-composting.",
                is_active=True,
            )
            db.add(cap_1)

        cap_2 = db.query(HEICapability).filter(HEICapability.id == HEI_2_CAP_ID).first()
        if not cap_2:
            cap_2 = HEICapability(
                id=HEI_2_CAP_ID,
                organization_id=HEI_2_ORG_ID,
                capability_type="FACULTY_EXPERTISE",
                name="Solar Thermal Storage & Cold Chain Group",
                discipline="Thermal Engineering",
                description="Faculty expertise in off-grid solar refrigeration and produce shelf-life extension.",
                is_active=True,
            )
            db.add(cap_2)

        db.commit()

        # =========================================================================
        # SCENARIO A — DEPENDENCY INTEGRITY
        # =========================================================================
        cha_a = db.query(Challenge).filter(Challenge.id == SCENARIO_A_CHALLENGE_ID).first()
        if not cha_a:
            cha_a = Challenge(
                id=SCENARIO_A_CHALLENGE_ID,
                title="Unreliable Segregated Dry-Waste Collection in Ward 12, Ranchi",
                summary="Ward 12 in Ranchi struggles with unsegregated waste overflow at doorstep collection points, leading to landfill burden.",
                description="Municipal ward 12 requires a localized decentralized sorting model. Local HEI technical partnership is required to pilot smart dry-waste bin monitoring and community sorting incentive models.",
                domain="Waste Management & Sanitation",
                source_type="GOVERNMENT_OFFICIAL",
                district="Ranchi",
                state="Jharkhand",
                submitted_by_actor_id=REVIEWER_ACTOR_ID,
                source_organization_id=GOV_ORG_ID,
            )
            db.add(cha_a)

        evi_a = db.query(Evidence).filter(Evidence.id == SCENARIO_A_EVIDENCE_ID).first()
        if not evi_a:
            evi_a = Evidence(
                id=SCENARIO_A_EVIDENCE_ID,
                challenge_id=SCENARIO_A_CHALLENGE_ID,
                submitted_by_actor_id=REVIEWER_ACTOR_ID,
                evidence_type="FIELD_AUDIT",
                storage_reference="gcs://nirnay-evidence/ranchi-ward12-waste-audit.pdf",
                description="Ranchi Municipal Corporation Ward 12 Waste Audit & Household Survey Log (2026)",
            )
            db.add(evi_a)

        qual_a = db.query(QualificationDecision).filter(QualificationDecision.id == SCENARIO_A_QUAL_ID).first()
        if not qual_a:
            qual_a = QualificationDecision(
                id=SCENARIO_A_QUAL_ID,
                challenge_id=SCENARIO_A_CHALLENGE_ID,
                route=QualificationRoute.INNOVATION_CHALLENGE,
                version=1,
                rationale="Qualified by state Nodal Committee as a high-priority urban sanitation innovation challenge requiring academic partner technical co-execution.",
                decided_by_actor_id=REVIEWER_ACTOR_ID,
            )
            db.add(qual_a)

        cand_a = db.query(ChallengeHEICandidate).filter(ChallengeHEICandidate.id == SCENARIO_A_CANDIDATE_ID).first()
        if not cand_a:
            cand_a = ChallengeHEICandidate(
                id=SCENARIO_A_CANDIDATE_ID,
                challenge_id=SCENARIO_A_CHALLENGE_ID,
                organization_id=HEI_1_ORG_ID,
                match_method="MANUAL",
                rationale="BIT Mesra Bio-Digestion Lab selected based on geographical proximity in Ranchi and relevant environmental engineering expertise.",
                created_by_actor_id=REVIEWER_ACTOR_ID,
            )
            db.add(cand_a)

        comm_a = db.query(Commitment).filter(Commitment.id == SCENARIO_A_COMMITMENT_1_ID).first()
        if not comm_a:
            comm_a = Commitment(
                id=SCENARIO_A_COMMITMENT_1_ID,
                challenge_id=SCENARIO_A_CHALLENGE_ID,
                organization_id=HEI_1_ORG_ID,
                commitment_type="FIELD_TESTING_SITE",
                status=CommitmentStatus.ACCEPTED,
                version=1,
                scope_description="BIT Mesra commits lab facilities, 2 faculty leads, and 4 student researchers for 60-day field testing of waste sorting sensors in Ward 12.",
                recorded_by_actor_id=REVIEWER_ACTOR_ID,
            )
            db.add(comm_a)
            db.flush()

        cond_a1 = db.query(ReadinessCondition).filter(ReadinessCondition.id == SCENARIO_A_CONDITION_1_ID).first()
        if not cond_a1:
            cond_a1 = ReadinessCondition(
                id=SCENARIO_A_CONDITION_1_ID,
                challenge_id=SCENARIO_A_CHALLENGE_ID,
                condition_key="HEI_COMMITMENT",
                status=ConditionStatus.SATISFIED,
                version=1,
                rationale="BIT Mesra technical facility access commitment accepted and verified.",
                assessed_by_actor_id=REVIEWER_ACTOR_ID,
            )
            cond_a1.commitment_dependencies.append(comm_a)
            db.add(cond_a1)

        cond_a2 = db.query(ReadinessCondition).filter(ReadinessCondition.id == SCENARIO_A_CONDITION_2_ID).first()
        if not cond_a2:
            cond_a2 = ReadinessCondition(
                id=SCENARIO_A_CONDITION_2_ID,
                challenge_id=SCENARIO_A_CHALLENGE_ID,
                condition_key="STAKEHOLDER_CONSENT",
                status=ConditionStatus.SATISFIED,
                version=1,
                rationale="Ranchi Municipal Corporation Ward 12 Sanitation Officer written consent recorded.",
                assessed_by_actor_id=REVIEWER_ACTOR_ID,
            )
            db.add(cond_a2)
            db.flush()

        rdec_a = db.query(ReadinessDecision).filter(ReadinessDecision.id == SCENARIO_A_READINESS_DECISION_1_ID).first()
        if not rdec_a:
            rdec_a = ReadinessDecision(
                id=SCENARIO_A_READINESS_DECISION_1_ID,
                challenge_id=SCENARIO_A_CHALLENGE_ID,
                status=ReadinessStatus.PILOT_READY,
                version=1,
                rationale="All prerequisite conditions satisfied. Human pilot authorization granted by Nodal State Reviewer.",
                decided_by_actor_id=REVIEWER_ACTOR_ID,
            )
            rdec_a.conditions.extend([cond_a1, cond_a2])
            db.add(rdec_a)

        # =========================================================================
        # SCENARIO B — EVIDENCE INTEGRITY
        # =========================================================================
        cha_b = db.query(Challenge).filter(Challenge.id == SCENARIO_B_CHALLENGE_ID).first()
        if not cha_b:
            cha_b = Challenge(
                id=SCENARIO_B_CHALLENGE_ID,
                title="Off-Grid Solar Thermal Preservation for Vegetable Vendor Hubs in Hazaribagh",
                summary="Smallholder vegetable vendors in Hazaribagh suffer 35% produce loss due to lack of overnight cold storage.",
                description="Deploying low-cost solar thermal evaporative cooling units across peri-urban vendor markets to extend produce shelf life from 24h to 72h.",
                domain="Agricultural Technology & Rural Infrastructure",
                source_type="GOVERNMENT_OFFICIAL",
                district="Hazaribagh",
                state="Jharkhand",
                submitted_by_actor_id=REVIEWER_ACTOR_ID,
                source_organization_id=GOV_ORG_ID,
            )
            db.add(cha_b)

        evi_b = db.query(Evidence).filter(Evidence.id == SCENARIO_B_EVIDENCE_ID).first()
        if not evi_b:
            evi_b = Evidence(
                id=SCENARIO_B_EVIDENCE_ID,
                challenge_id=SCENARIO_B_CHALLENGE_ID,
                submitted_by_actor_id=REVIEWER_ACTOR_ID,
                evidence_type="FIELD_AUDIT",
                storage_reference="gcs://nirnay-evidence/hazaribagh-vendor-spoilage.pdf",
                description="Baseline Survey & Vendor Spoilage Study - Hazaribagh APMC Market (2026)",
            )
            db.add(evi_b)

        qual_b = db.query(QualificationDecision).filter(QualificationDecision.id == SCENARIO_B_QUAL_ID).first()
        if not qual_b:
            qual_b = QualificationDecision(
                id=SCENARIO_B_QUAL_ID,
                challenge_id=SCENARIO_B_CHALLENGE_ID,
                route=QualificationRoute.INNOVATION_CHALLENGE,
                version=1,
                rationale="Qualified for state-supported pilot testing under Rural Micro-Storage Initiative.",
                decided_by_actor_id=REVIEWER_ACTOR_ID,
            )
            db.add(qual_b)

        cand_b = db.query(ChallengeHEICandidate).filter(ChallengeHEICandidate.id == SCENARIO_B_CANDIDATE_ID).first()
        if not cand_b:
            cand_b = ChallengeHEICandidate(
                id=SCENARIO_B_CANDIDATE_ID,
                challenge_id=SCENARIO_B_CHALLENGE_ID,
                organization_id=HEI_2_ORG_ID,
                match_method="MANUAL",
                rationale="NIT Jamshedpur Solar Thermal Storage Group matched for technical prototype fabrication.",
                created_by_actor_id=REVIEWER_ACTOR_ID,
            )
            db.add(cand_b)

        comm_b = db.query(Commitment).filter(Commitment.id == SCENARIO_B_COMMITMENT_1_ID).first()
        if not comm_b:
            comm_b = Commitment(
                id=SCENARIO_B_COMMITMENT_1_ID,
                challenge_id=SCENARIO_B_CHALLENGE_ID,
                organization_id=HEI_2_ORG_ID,
                commitment_type="TECHNICAL_FACILITY_ACCESS",
                status=CommitmentStatus.ACCEPTED,
                version=1,
                scope_description="NIT Jamshedpur commits 4 thermal cooling units and field installation support.",
                recorded_by_actor_id=REVIEWER_ACTOR_ID,
            )
            db.add(comm_b)
            db.flush()

        cond_b1 = db.query(ReadinessCondition).filter(ReadinessCondition.id == SCENARIO_B_CONDITION_1_ID).first()
        if not cond_b1:
            cond_b1 = ReadinessCondition(
                id=SCENARIO_B_CONDITION_1_ID,
                challenge_id=SCENARIO_B_CHALLENGE_ID,
                condition_key="HEI_COMMITMENT",
                status=ConditionStatus.SATISFIED,
                version=1,
                rationale="NIT Jamshedpur thermal cooling unit deployment commitment verified.",
                assessed_by_actor_id=REVIEWER_ACTOR_ID,
            )
            cond_b1.commitment_dependencies.append(comm_b)
            db.add(cond_b1)
            db.flush()

        rdec_b = db.query(ReadinessDecision).filter(ReadinessDecision.id == SCENARIO_B_READINESS_DECISION_1_ID).first()
        if not rdec_b:
            rdec_b = ReadinessDecision(
                id=SCENARIO_B_READINESS_DECISION_1_ID,
                challenge_id=SCENARIO_B_CHALLENGE_ID,
                status=ReadinessStatus.PILOT_READY,
                version=1,
                rationale="Prerequisites satisfied. Authorized for field pilot execution in Hazaribagh.",
                decided_by_actor_id=REVIEWER_ACTOR_ID,
            )
            rdec_b.conditions.append(cond_b1)
            db.add(rdec_b)
            db.flush()

        pilot_b = db.query(Pilot).filter(Pilot.id == SCENARIO_B_PILOT_ID).first()
        if not pilot_b:
            pilot_b = Pilot(
                id=SCENARIO_B_PILOT_ID,
                challenge_id=SCENARIO_B_CHALLENGE_ID,
                authorized_by_readiness_decision_id=SCENARIO_B_READINESS_DECISION_1_ID,
                host_organization_id=GOV_ORG_ID,
                name="Hazaribagh Vendor Cold Chain Field Pilot",
                site_description="Peri-urban daily vegetable market, Ward 4, Hazaribagh",
                planned_start=datetime(2026, 8, 1, tzinfo=timezone.utc),
                planned_end=datetime(2026, 9, 30, tzinfo=timezone.utc),
                created_by_actor_id=REVIEWER_ACTOR_ID,
            )
            db.add(pilot_b)

        op_b1 = db.query(PilotOperationalState).filter(PilotOperationalState.id == SCENARIO_B_OP_STATE_1_ID).first()
        if not op_b1:
            op_b1 = PilotOperationalState(
                id=SCENARIO_B_OP_STATE_1_ID,
                pilot_id=SCENARIO_B_PILOT_ID,
                status=OperationalStatus.PLANNED,
                version=1,
                rationale="Field pilot initialized following human PILOT_READY authorization.",
                recorded_by_actor_id=REVIEWER_ACTOR_ID,
            )
            db.add(op_b1)

        op_b2 = db.query(PilotOperationalState).filter(PilotOperationalState.id == SCENARIO_B_OP_STATE_2_ID).first()
        if not op_b2:
            op_b2 = PilotOperationalState(
                id=SCENARIO_B_OP_STATE_2_ID,
                pilot_id=SCENARIO_B_PILOT_ID,
                status=OperationalStatus.ACTIVE,
                version=2,
                rationale="4 solar thermal units deployed and actively monitored across market vendors.",
                recorded_by_actor_id=REVIEWER_ACTOR_ID,
            )
            db.add(op_b2)

        plan_b = db.query(PilotEvidencePlan).filter(PilotEvidencePlan.id == SCENARIO_B_EVIDENCE_PLAN_1_ID).first()
        if not plan_b:
            plan_b = PilotEvidencePlan(
                id=SCENARIO_B_EVIDENCE_PLAN_1_ID,
                pilot_id=SCENARIO_B_PILOT_ID,
                version=1,
                objective="Evaluate solar thermal cooling units for reducing overnight vegetable spoilage among peri-urban vendors.",
                primary_metric="Households receiving scheduled segregated waste collection",
                baseline_definition="41% of surveyed households",
                denominator_definition="240 households surveyed before pilot",
                data_collection_method="Daily physical audit logs and temperature sensor telemetry",
                evaluation_window="60-day observation window (Aug-Sep 2026)",
                success_criteria="Fresh produce retention rate exceeds 75% at 48 hours across denominator",
                limitations="Seasonal rain variations may affect solar thermal efficiency during monsoon weeks",
                created_by_actor_id=REVIEWER_ACTOR_ID,
            )
            db.add(plan_b)

        db.commit()

        print()
        print("================================")
        print("NIRNAY GOLDEN DEMO READY")
        print("================================")
        print()
        print("Reviewer Actor:")
        print(str(REVIEWER_ACTOR_ID))
        print()
        print("Scenario A Challenge:")
        print(str(SCENARIO_A_CHALLENGE_ID))
        print()
        print("Scenario A URL:")
        print(f"/challenges/{SCENARIO_A_CHALLENGE_ID}")
        print()
        print("Scenario B Challenge:")
        print(str(SCENARIO_B_CHALLENGE_ID))
        print()
        print("Scenario B Pilot:")
        print(str(SCENARIO_B_PILOT_ID))
        print()
        print("Scenario B Pilot URL:")
        print(f"/pilots/{SCENARIO_B_PILOT_ID}")
        print()
        print("Frontend environment:")
        print()
        print(f"NEXT_PUBLIC_DEMO_REVIEWER_ACTOR_ID={REVIEWER_ACTOR_ID}")
        print("NEXT_PUBLIC_ENABLE_DEMO_FALLBACK=false")
        print()
        print("================================")
        print()
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Golden Demo Seed Failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed golden jury demo dataset for NIRNAY.")
    parser.add_argument("--reset", action="store_true", help="Reset mutated golden demo records before seeding")
    args = parser.parse_args()

    seed_golden_demo_data(reset=args.reset)
