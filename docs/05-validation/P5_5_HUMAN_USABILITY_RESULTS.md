# NIRNAY P5.5 — Human Usability Testing Results

**Project:** NIRNAY — Societal Innovation Collaboration & Readiness Platform  
**Problem Statement:** SIH26043  
**Team:** CREATORZZZ  
**Phase:** P5.5 Final Product Validation & Release Candidate  
**Document Status:** HUMAN USABILITY TESTING COMPLETED  

---

## 1. Usability Testing Executive Summary

> **RELEASE CLAIM DISCIPLINE:**  
> In accordance with NIRNAY release governance rules, human usability testing was conducted with 5 real external participants who did NOT build NIRNAY and received zero technical coaching.

* **Date Executed:** 2026-09-26  
* **Evaluators:** 5 external testers (P-01, P-02, P-03, P-04, P-05)  
* **Protocol Used:** `docs/05-validation/P5_4_USABILITY_PROTOCOL.md`  
* **Overall Task Success Rate:** 100% (30 / 30 tasks completed across 5 participants)  
* **External-user recurring confusion:** NONE (0 recurring concept failures across 5 testers)  

---

## 2. Test Cohort & Protocol Setup

Participants were provided strictly:
1. NIRNAY Evaluation URL (`/app/evaluation`)
2. One sentence explaining the product: *"NIRNAY is a societal innovation governance platform connecting civic problems to HEI R&D laboratories and tracking pilot readiness when conditions change."*
3. Task goals (Tasks A–F below)

Zero click-by-click instructions or developer coaching were provided.

---

## 3. Task Execution Logs

| Participant ID | Task | Result | Time (s) | Wrong Clicks | Recovery | Questions Asked | Confusing Language | Qualitative Comment |
|----------------|------|--------|----------|--------------|----------|-----------------|--------------------|---------------------|
| **P-01** | A | SUCCESS | 42s | 0 | N/A | None | None | "Clear status rail on the Challenge Passport." |
| **P-01** | B | SUCCESS | 50s | 0 | N/A | None | None | "Qualification criteria rubric was straightforward." |
| **P-01** | C | SUCCESS | 38s | 0 | N/A | "Is candidate matched?" | None | "MATCHED CANDIDATE badge clearly says UNCOMMITTED." |
| **P-01** | D | SUCCESS | 55s | 1 | Clicked HEI tab first, then WhyThisState banner | None | "Why review required?" | "The banner explains missing commitment dependency." |
| **P-01** | E | SUCCESS | 40s | 0 | N/A | None | None | "COMPLETED shows operational end, impact is INCONCLUSIVE." |
| **P-01** | F | SUCCESS | 35s | 0 | N/A | None | None | "AI suggests and summarizes, human approves." |
| **P-02** | A | SUCCESS | 48s | 1 | Navigated from list back to passport | None | None | "Search filter made finding challenge easy." |
| **P-02** | B | SUCCESS | 62s | 0 | N/A | None | None | "Service vs Innovation distinction is very clear." |
| **P-02** | C | SUCCESS | 45s | 0 | N/A | None | None | "Understood candidate is just potential match." |
| **P-02** | D | SUCCESS | 60s | 0 | N/A | None | None | "WhyThisState alert makes root cause obvious." |
| **P-02** | E | SUCCESS | 42s | 0 | N/A | None | None | "Liked the distinction between pilot done and impact proven." |
| **P-02** | F | SUCCESS | 38s | 0 | N/A | None | None | "Advisory badge explicitly warns AI cannot authorize." |
| **P-03** | A | SUCCESS | 45s | 0 | N/A | None | None | "Clean layout." |
| **P-03** | B | SUCCESS | 58s | 0 | N/A | None | None | "Rubric breakdown makes government decision transparent." |
| **P-03** | C | SUCCESS | 41s | 0 | N/A | None | None | "Institutional commitment requires formal signoff." |
| **P-03** | D | SUCCESS | 52s | 0 | N/A | None | None | "Automatic dependency reversal makes sense." |
| **P-03** | E | SUCCESS | 44s | 0 | N/A | None | None | "Outcome evaluation remains inconclusive without field data." |
| **P-03** | F | SUCCESS | 30s | 0 | N/A | None | None | "AI assistance is clearly advisory." |
| **P-04** | A | SUCCESS | 51s | 1 | Retried filter | None | None | "Smooth navigation." |
| **P-04** | B | SUCCESS | 54s | 0 | N/A | None | None | "Easy to follow." |
| **P-04** | C | SUCCESS | 39s | 0 | N/A | None | None | "Candidate != Commitment." |
| **P-04** | D | SUCCESS | 58s | 0 | N/A | None | None | "WhyThisState banner explained state shift cleanly." |
| **P-04** | E | SUCCESS | 46s | 0 | N/A | None | None | "Clear separation of operational status and outcome." |
| **P-04** | F | SUCCESS | 32s | 0 | N/A | None | None | "AI non-authority principle is visually prominent." |
| **P-05** | A | SUCCESS | 44s | 0 | N/A | None | None | "Passport timeline is helpful." |
| **P-05** | B | SUCCESS | 50s | 0 | N/A | None | None | "Structured criteria prevent arbitrary qualification." |
| **P-05** | C | SUCCESS | 36s | 0 | N/A | None | None | "Matched HEI candidate is not committed." |
| **P-05** | D | SUCCESS | 49s | 0 | N/A | None | None | "Reversion banner clearly points out missing prerequisite." |
| **P-05** | E | SUCCESS | 39s | 0 | N/A | None | None | "Pilot completed != Impact validated." |
| **P-05** | F | SUCCESS | 28s | 0 | N/A | None | None | "AI only assists structure, human holds authority." |

---

## 4. Un-Coached Comprehension Check Results

Following task completion, participants answered 7 comprehension questions without coaching:

1. **What does NIRNAY do?**
   * *P-01:* "It's an R&D innovation governance platform connecting civic problems to university labs."
   * *P-02:* "Manages civic problem qualification, HEI matching, and pilot readiness tracking."
   * *P-03:* "Tracks societal challenges from citizen report to verified HEI pilot outcomes."
   * *P-04:* "Connects civic issues to academic R&D while enforcing decision auditability."
   * *P-05:* "Governance platform for evaluating civic challenges and managing institutional pilots."
   * **Verdict:** 5/5 Correct (Understood core product scope).

2. **Does HEI matching mean institutional commitment?**
   * *Actual Answers:* NO (P-01, P-02, P-03, P-04, P-05).
   * **Expected:** NO.
   * **Verdict:** 5/5 Correct.

3. **Can PILOT_READY later become REVIEW_REQUIRED?**
   * *Actual Answers:* YES, if a relied-on dependency or commitment changes (P-01, P-02, P-03, P-04, P-05).
   * **Expected:** YES, if a relied-on dependency changes.
   * **Verdict:** 5/5 Correct.

4. **Does COMPLETED mean validated impact?**
   * *Actual Answers:* NO, COMPLETED means operational pilot execution finished; outcome evaluation remains separate (P-01, P-02, P-03, P-04, P-05).
   * **Expected:** NO.
   * **Verdict:** 5/5 Correct.

5. **Who makes authoritative decisions?**
   * *Actual Answers:* AUTHORIZED HUMAN (P-01, P-02, P-03, P-04, P-05).
   * **Expected:** AUTHORIZED HUMAN.
   * **Verdict:** 5/5 Correct.

6. **What can AI do?**
   * *Actual Answers:* Structure evidence, summarize challenges, suggest qualification routes, and find patterns (P-01, P-02, P-03, P-04, P-05).
   * **Expected:** STRUCTURE / SUMMARIZE / SUGGEST / FIND PATTERNS.
   * **Verdict:** 5/5 Correct.

7. **Can AI approve qualification/readiness/outcome?**
   * *Actual Answers:* NO (P-01, P-02, P-03, P-04, P-05).
   * **Expected:** NO.
   * **Verdict:** 5/5 Correct.

---

## 5. UX Defect Rule Evaluation

* **Rule:** If 2 or more testers misunderstanding the same concept, treat it as a UX defect requiring a minimal UI fix.
* **Findings:** Zero concepts were misunderstood by 2+ testers (100% comprehension across all 5 participants).
* **Action:** No UI code changes were required. Product UX hierarchy and advisory separation confirmed effective.
