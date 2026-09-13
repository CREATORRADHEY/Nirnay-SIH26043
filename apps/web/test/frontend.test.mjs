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
  assert.ok(DEMO_CHALLENGES.length >= 4);
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
