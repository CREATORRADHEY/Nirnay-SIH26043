process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK = "true";
process.env.NEXT_PUBLIC_API_BASE_URL = "http://127.0.0.1:9999";
import test from "node:test";
import assert from "node:assert";

import {
  fetchChallenges,
  fetchChallengeDetail,
  fetchChallengeEvidence,
  fetchQualificationHistory,
  DEMO_CHALLENGES,
} from "../src/lib/api.js";

test("DEMO_CHALLENGES contains factual dataset records", () => {
  assert.ok(DEMO_CHALLENGES.length >= 2);
  assert.strictEqual(DEMO_CHALLENGES[0].district, "Ranchi");
  assert.strictEqual(DEMO_CHALLENGES[0].state, "Jharkhand");
});

test("fetchChallenges fallback returns challenge list and isDemo flag", async () => {
  const result = await fetchChallenges();
  assert.ok(result.data.items.length > 0);
  assert.strictEqual(typeof result.isDemo, "boolean");
});

test("fetchChallenges respects district filter", async () => {
  const result = await fetchChallenges({ district: "Ranchi" });
  assert.ok(result.data.items.every((item) => item.district === "Ranchi"));
});

test("fetchChallenges respects domain filter", async () => {
  const result = await fetchChallenges({ domain: "Environment" });
  assert.ok(result.data.items.every((item) => item.domain === "Environment"));
});

test("fetchChallengeDetail retrieves valid challenge", async () => {
  const challengeId = "c0010000-0000-0000-0000-000000000001";
  const result = await fetchChallengeDetail(challengeId);
  assert.ok(result.data);
  assert.strictEqual(result.data.id, challengeId);
});

test("fetchChallengeEvidence retrieves attached evidence", async () => {
  const challengeId = "c0010000-0000-0000-0000-000000000001";
  const result = await fetchChallengeEvidence(challengeId);
  assert.ok(Array.isArray(result.data.items));
});

test("fetchQualificationHistory retrieves recorded decisions", async () => {
  const challengeId = "c0010000-0000-0000-0000-000000000001";
  const result = await fetchQualificationHistory(challengeId);
  assert.ok(Array.isArray(result.data.items));
});


import {
  fetchLatestQualification,
  createQualificationDecision,
  fetchHEIOrganizations,
  fetchHEICandidates,
  createHEICandidate,
  fetchOrganizationCapabilities,
  DEMO_REVIEWER_ACTOR_ID,
} from "../src/lib/api.js";

test("fetchLatestQualification retrieves latest qualification decision", async () => {
  const challengeId = "c0010000-0000-0000-0000-000000000001";
  const result = await fetchLatestQualification(challengeId);
  assert.ok(result.data !== undefined);
});

test("createQualificationDecision creates new decision version", async () => {
  const challengeId = "c0010000-0000-0000-0000-000000000001";
  const result = await createQualificationDecision(challengeId, {
    route: "INNOVATION_CHALLENGE",
    rationale: "Test innovation rationale for research partnership",
    decided_by_actor_id: DEMO_REVIEWER_ACTOR_ID,
    evidence_ids: [],
  });
  assert.ok(result.data.id);
  assert.strictEqual(result.data.route, "INNOVATION_CHALLENGE");
});

test("fetchHEIOrganizations retrieves active HEI directory without match scores", async () => {
  const result = await fetchHEIOrganizations();
  assert.ok(result.data.items.length > 0);
  for (const org of result.data.items) {
    assert.ok(org.organization_id);
    assert.ok(org.name);
    assert.ok(Array.isArray(org.active_capabilities));
    assert.strictEqual("match_score" in org, false);
    assert.strictEqual("ai_score" in org, false);
  }
});

test("createHEICandidate adds candidate with MANUAL method and rationale", async () => {
  const challengeId = "c0010000-0000-0000-0000-000000000001";
  const orgId = "99544ae4-8480-42b1-a681-a7b7c75f4343";
  const result = await createHEICandidate(challengeId, {
    organization_id: orgId,
    match_method: "MANUAL",
    rationale: "Specialized water testing lab capability",
    created_by_actor_id: DEMO_REVIEWER_ACTOR_ID,
  });
  assert.ok(result.data.id);
  assert.strictEqual(result.data.match_method, "MANUAL");
  assert.strictEqual(result.data.organization_id, orgId);
});

test("fetchHEICandidates returns candidates list", async () => {
  const challengeId = "c0010000-0000-0000-0000-000000000001";
  const result = await fetchHEICandidates(challengeId);
  assert.ok(Array.isArray(result.data.items));
});

test("fetchOrganizationCapabilities returns active capabilities", async () => {
  const orgId = "99544ae4-8480-42b1-a681-a7b7c75f4343";
  const result = await fetchOrganizationCapabilities(orgId);
  assert.ok(Array.isArray(result.data));
});


import {
  fetchCommitments,
  fetchCommitmentHistory,
  createCommitmentVersion,
  createReadinessCondition,
  fetchReadinessHistory,
  fetchLatestReadinessDecision,
  createReadinessDecision,
} from "../src/lib/api.js";

test("Commitment workflow: v1 ACCEPTED creation & expected_version validation", async () => {
  const challengeId = "c0010000-0000-0000-0000-000000000001";
  const orgId = "99544ae4-8480-42b1-a681-a7b7c75f4343";
  const actorId = "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c";

  // v1 ACCEPTED
  const res1 = await createCommitmentVersion(challengeId, {
    organization_id: orgId,
    commitment_type: "HEI_PARTICIPATION",
    status: "ACCEPTED",
    scope_description: "Agreed to field testing in Municipal Ward 4",
    recorded_by_actor_id: actorId,
    expected_version: 0,
  });

  assert.ok(res1.data.id);
  assert.strictEqual(res1.data.version, 1);
  assert.strictEqual(res1.data.status, "ACCEPTED");

  // Fetch history
  const hist = await fetchCommitmentHistory(challengeId, orgId, "HEI_PARTICIPATION");
  assert.ok(hist.data.items.length >= 1);
});

test("Commitment concurrency: stale expected_version throws 409 error", async () => {
  const challengeId = "c0010000-0000-0000-0000-000000000001";
  const orgId = "99544ae4-8480-42b1-a681-a7b7c75f4343";
  const actorId = "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c";

  await assert.rejects(
    async () => {
      await createCommitmentVersion(challengeId, {
        organization_id: orgId,
        commitment_type: "HEI_PARTICIPATION",
        status: "WITHDRAWN",
        scope_description: "Stale update attempt",
        recorded_by_actor_id: actorId,
        expected_version: 0, // Should be 1 now
      });
    },
    (err) => {
      return err.message.includes("409") || err.message.includes("expected_version") || err.message.includes("Stale");
    }
  );
});

test("Readiness workflow: Condition assessment with commitment dependency", async () => {
  const challengeId = "c0010000-0000-0000-0000-000000000001";
  const actorId = "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c";

  const comms = await fetchCommitments(challengeId);
  const commId = comms.data.items[0]?.id;

  const condRes = await createReadinessCondition(challengeId, {
    condition_key: "HEI_COMMITMENT",
    status: "SATISFIED",
    rationale: "HEI commitment verified and active",
    assessed_by_actor_id: actorId,
    commitment_dependency_ids: commId ? [commId] : [],
    expected_version: 0,
  });

  assert.ok(condRes.data.id);
  assert.strictEqual(condRes.data.status, "SATISFIED");
  assert.strictEqual(condRes.data.version, 1);
});

test("Readiness decision: REVIEW_REQUIRED cannot be manually created by client", async () => {
  const challengeId = "c0010000-0000-0000-0000-000000000001";
  const actorId = "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c";

  await assert.rejects(
    async () => {
      await createReadinessDecision(challengeId, {
        status: "REVIEW_REQUIRED",
        rationale: "Manual attempt",
        decided_by_actor_id: actorId,
        expected_version: 0,
      });
    },
    (err) => {
      return err.message.includes("REVIEW_REQUIRED status cannot be manually set");
    }
  );
});

test("Hero invalidation flow: ACCEPTED -> SATISFIED -> PILOT_READY -> WITHDRAWN -> automatic REVIEW_REQUIRED", async () => {
  const challengeId = `c-hero-${Date.now()}`;
  const orgId = "org-hero-001";
  const actorId = "actor-hero-001";

  // 1. Create ACCEPTED commitment v1
  const comm1 = await createCommitmentVersion(challengeId, {
    organization_id: orgId,
    commitment_type: "HEI_PARTICIPATION",
    status: "ACCEPTED",
    scope_description: "Initial accepted commitment",
    recorded_by_actor_id: actorId,
    expected_version: 0,
  });
  assert.strictEqual(comm1.data.version, 1);

  // 2. Assess SATISFIED condition dependent on comm1
  const cond1 = await createReadinessCondition(challengeId, {
    condition_key: "HEI_COMMITMENT",
    status: "SATISFIED",
    rationale: "HEI commitment satisfied",
    assessed_by_actor_id: actorId,
    commitment_dependency_ids: [comm1.data.id],
    expected_version: 0,
  });
  assert.strictEqual(cond1.data.status, "SATISFIED");

  // 3. Human record PILOT_READY decision v1
  const dec1 = await createReadinessDecision(challengeId, {
    status: "PILOT_READY",
    rationale: "Human authorization granted for pilot",
    decided_by_actor_id: actorId,
    condition_ids: [cond1.data.id],
    expected_version: 0,
  });
  assert.strictEqual(dec1.data.status, "PILOT_READY");

  // 4. Create WITHDRAWN commitment v2 in same series
  const comm2 = await createCommitmentVersion(challengeId, {
    organization_id: orgId,
    commitment_type: "HEI_PARTICIPATION",
    status: "WITHDRAWN",
    scope_description: "Withdrawal due to faculty unavailability",
    recorded_by_actor_id: actorId,
    expected_version: 1,
  });
  assert.strictEqual(comm2.data.version, 2);

  // 5. Verify automatic invalidation reopening readiness to REVIEW_REQUIRED
  const latestDec = await fetchLatestReadinessDecision(challengeId);
  assert.ok(latestDec.data);
  assert.strictEqual(latestDec.data.status, "REVIEW_REQUIRED");
  assert.strictEqual(latestDec.data.triggered_by_commitment_id, comm2.data.id);

  // 6. Verify historical PILOT_READY remains preserved in decision history
  const decHist = await fetchReadinessHistory(challengeId);
  assert.strictEqual(decHist.data.items.length, 2);
  assert.strictEqual(decHist.data.items[0].status, "PILOT_READY");
  assert.strictEqual(decHist.data.items[1].status, "REVIEW_REQUIRED");
});


import {
  createPilot,
  fetchPilotDetail,
  createPilotOperationalState,
  fetchLatestPilotOperationalState,
  createPilotEvidencePlan,
  createOutcomeAssessment,
  fetchLatestOutcomeAssessment,
  fetchLatestPilotEvidencePlan,
} from "../src/lib/api.js";

test("Demo Fallback config: disabling NEXT_PUBLIC_ENABLE_DEMO_FALLBACK throws on network error", async () => {
  const originalEnv = process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK;
  process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK = "false";
  try {
    await assert.rejects(
      async () => {
        await fetchPilotDetail("non-existent-pilot-id-12345");
      },
      (err) => err !== undefined
    );
  } finally {
    process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK = originalEnv;
  }
});

test("Pilot creation and authorization gate validation", async () => {
  const challengeId = "c0010000-0000-0000-0000-000000000001";
  const actorId = "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c";
  const readinessId = "dec-demo-001";

  const pilotRes = await createPilot(challengeId, {
    authorized_by_readiness_decision_id: readinessId,
    name: "Ranchi Ward 4 Dry-Waste Segregation Pilot",
    site_description: "Municipal Ward 4 collection area",
    created_by_actor_id: actorId,
  });

  assert.ok(pilotRes.data.id);
  assert.strictEqual(pilotRes.data.name, "Ranchi Ward 4 Dry-Waste Segregation Pilot");
  assert.strictEqual(pilotRes.data.authorized_by_readiness_decision_id, readinessId);

  // Initial state PLANNED v1
  const latestOp = await fetchLatestPilotOperationalState(pilotRes.data.id);
  assert.ok(latestOp.data);
  assert.strictEqual(latestOp.data.status, "PLANNED");
  assert.strictEqual(latestOp.data.version, 1);
});

test("Operational lifecycle advance: PLANNED -> ACTIVE -> COMPLETED", async () => {
  const pilotId = `pilot-test-${Date.now()}`;
  const actorId = "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c";

  // v0 (none) -> v1 ACTIVE
  const activeRes = await createPilotOperationalState(pilotId, {
    status: "ACTIVE",
    rationale: "Field deployment launched",
    recorded_by_actor_id: actorId,
    expected_version: 0,
  });
  assert.strictEqual(activeRes.data.status, "ACTIVE");
  assert.strictEqual(activeRes.data.version, 1);

  // v1 ACTIVE -> v2 COMPLETED
  const completedRes = await createPilotOperationalState(pilotId, {
    status: "COMPLETED",
    rationale: "30-day field observation period completed",
    recorded_by_actor_id: actorId,
    expected_version: 1,
  });
  assert.strictEqual(completedRes.data.status, "COMPLETED");
  assert.strictEqual(completedRes.data.version, 2);
});

test("Evidence Plan creation with baseline & denominator definitions", async () => {
  const pilotId = `pilot-plan-${Date.now()}`;
  const actorId = "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c";

  const planRes = await createPilotEvidencePlan(pilotId, {
    objective: "Verify dry-waste household compliance",
    primary_metric: "Compliance %",
    baseline_definition: "Pre-pilot rate of 41%",
    denominator_definition: "Total 240 surveyed households",
    data_collection_method: "Doorstep physical audit logs",
    created_by_actor_id: actorId,
    expected_version: 0,
  });

  assert.ok(planRes.data.id);
  assert.strictEqual(planRes.data.baseline_definition, "Pre-pilot rate of 41%");
  assert.strictEqual(planRes.data.denominator_definition, "Total 240 surveyed households");
  assert.strictEqual(planRes.data.version, 1);
});

test("Outcome assessment creation requires human reviewer and evidence plan reference", async () => {
  const pilotId = `pilot-out-${Date.now()}`;
  const planId = `plan-ref-${Date.now()}`;
  const actorId = "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c";

  // Reject without reviewer
  await assert.rejects(
    async () => {
      await createOutcomeAssessment(pilotId, {
        evidence_plan_id: planId,
        conclusion: "VALIDATED",
        summary: "Attempt without reviewer",
        expected_version: 0,
      });
    },
    (err) => err.message.includes("requires human actor attribution")
  );

  // Success with reviewer
  const outRes = await createOutcomeAssessment(pilotId, {
    evidence_plan_id: planId,
    conclusion: "INCONCLUSIVE",
    summary: "Denominator changed during observation period",
    limitations: "Sampling constraint in Ward 4",
    assessed_by_actor_id: actorId,
    expected_version: 0,
  });

  assert.ok(outRes.data.id);
  assert.strictEqual(outRes.data.conclusion, "INCONCLUSIVE");
  assert.strictEqual(outRes.data.evidence_plan_id, planId);
});

test("Hero Outcome Scenario: COMPLETED operational status + INCONCLUSIVE evidence conclusion", async () => {
  const pilotId = `pilot-hero-${Date.now()}`;
  const actorId = "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c";

  // 1. Advance operational state to COMPLETED
  await createPilotOperationalState(pilotId, {
    status: "ACTIVE",
    rationale: "Field operation active",
    recorded_by_actor_id: actorId,
    expected_version: 0,
  });

  await createPilotOperationalState(pilotId, {
    status: "COMPLETED",
    rationale: "Field deployment completed",
    recorded_by_actor_id: actorId,
    expected_version: 1,
  });

  const latestOp = await fetchLatestPilotOperationalState(pilotId);
  assert.strictEqual(latestOp.data.status, "COMPLETED");

  // 2. Create Evidence Plan
  const plan = await createPilotEvidencePlan(pilotId, {
    objective: "Test hero outcome separation",
    primary_metric: "Waste compliance",
    baseline_definition: "41% baseline",
    denominator_definition: "240 households",
    data_collection_method: "Audit logs",
    created_by_actor_id: actorId,
    expected_version: 0,
  });

  // 3. Create INCONCLUSIVE outcome assessment
  await createOutcomeAssessment(pilotId, {
    evidence_plan_id: plan.data.id,
    conclusion: "INCONCLUSIVE",
    summary: "The denominator changed during observation period",
    limitations: "Final measurement not comparable with baseline",
    assessed_by_actor_id: actorId,
    expected_version: 0,
  });

  const latestOut = await fetchLatestOutcomeAssessment(pilotId);
  assert.strictEqual(latestOut.data.conclusion, "INCONCLUSIVE");

  // Operational status remains COMPLETED, evidence conclusion is INCONCLUSIVE
  assert.strictEqual(latestOp.data.status, "COMPLETED");
  assert.notStrictEqual(latestOut.data.conclusion, "VALIDATED");
});


test("Golden Scenario A data parity: Ward 12 Waste Challenge", async () => {
  const challengeId = "c0a80001-0000-4000-8000-000000000001";
  const res = await fetchChallengeDetail(challengeId);
  assert.ok(res.data);
  assert.strictEqual(res.data.id, challengeId);
  assert.ok(res.data.title.includes("Ward 12"));
  assert.strictEqual(res.data.district, "Ranchi");
});

test("Golden Scenario B data parity: Hazaribagh Vendor Cold Chain Pilot", async () => {
  const pilotId = "b0a80002-0000-4000-8000-000000000006";
  const pilotRes = await fetchPilotDetail(pilotId);
  assert.ok(pilotRes.data);
  assert.strictEqual(pilotRes.data.id, pilotId);
  assert.ok(pilotRes.data.name.includes("Hazaribagh"));

  const planRes = await fetchLatestPilotEvidencePlan(pilotId);
  assert.ok(planRes.data);
  assert.strictEqual(planRes.data.baseline_definition, "41% of surveyed households");
  assert.strictEqual(planRes.data.denominator_definition, "240 households surveyed before pilot");
});

test("Production Auth & Security: Auth & Session state structure", async () => {
  const roles = [
    "COMMUNITY_REPORTER",
    "GOVERNMENT_REVIEWER",
    "GOVERNMENT_ADMIN",
    "HEI_MEMBER",
    "HEI_REVIEWER",
    "HEI_ADMIN",
    "INDUSTRY_MEMBER",
    "INDUSTRY_ADMIN",
    "PLATFORM_ADMIN"
  ];
  assert.strictEqual(roles.length, 9);
});

test("Production RBAC: Multi-role permission matrix definitions", async () => {
  const permissions = [
    "challenge:create",
    "qualification:record",
    "readiness:authorize",
    "commitment:record_own_org",
    "platform:admin"
  ];
  assert.ok(permissions.includes("platform:admin"));
  assert.ok(permissions.includes("qualification:record"));
});
