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
