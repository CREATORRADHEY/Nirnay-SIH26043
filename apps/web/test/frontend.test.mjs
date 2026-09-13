import test from "node:test";
import assert from "node:assert";

import {
  fetchChallenges,
  fetchChallengeDetail,
  fetchChallengeEvidence,
  fetchQualificationHistory,
  DEMO_CHALLENGES,
} from "../src/lib/api.ts";

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
} from "../src/lib/api.ts";

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
} from "../src/lib/api.ts";

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
