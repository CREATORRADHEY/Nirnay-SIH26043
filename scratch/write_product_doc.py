content = """# PRODUCTION P4A: AI Assistance User Flows & Experience Guide

## 1. Product Overview
In NIRNAY, AI Assistance provides non-authoritative recommendations to citizens, government reviewers, and Higher Educational Institutions (HEIs). AI suggestions expedite data entry, highlight evidence insights, and recommend R&D capability matches while ensuring human reviewers remain solely accountable for platform decisions.

---

## 2. Citizen AI Assist (Challenge Creation Wizard)
- **Entry Point**: `Report Societal Challenge` (`/app/challenges/new`)
- **User Action**: Click `✨ Structure with AI` button in Step 1.
- **Workflow**:
  1. Citizen enters unstructured problem description in English, Hindi, or Hinglish.
  2. AI extracts `suggested_title`, `suggested_summary`, `suggested_domain`, `affected_group_notes`, and a `missing_information` checklist.
  3. AI suggestions populate an editable preview panel (`CitizenAIExtractionModal`).
  4. Citizen reviews and chooses whether to apply suggestions to the form.
  5. Citizen can edit any field before final submission.
- **Outage Fallback**: If AI is offline, citizen continues manual form entry seamlessly.

---

## 3. Government Reviewer Workbench AI Assistance
- **Entry Point**: `Government Review Workbench` (`/app/review/[challengeId]`)
- **Role Boundary**: Authorized Government Reviewers only.
- **Assistance Tools**:
  1. **Summarize Evidence**: Generates evidence completeness summaries, missing artifacts lists, and uncertainties.
  2. **Suggest Qualification Route**: Recommends canonical route (`SERVICE`, `CLARIFY`, `RESEARCH_REVIEW`, `INNOVATION_CHALLENGE`) with evidence-backed rationale.
  3. **Find Possible Duplicates**: Reranks bounded challenge queue to highlight potential duplicate issues.
  4. **Suggest Relevant HEIs**: Matches active HEI capabilities against challenge requirements.
- **Human Decision Boundary**:
  - AI outputs display `Copy Route & Rationale to Decision Form` or `+ Add as Candidate Match`.
  - The reviewer MUST explicitly review and submit the standard `Record Qualification Decision` or `Add HEI Candidate Record` form.
  - AI CANNOT submit decisions automatically.

---

## 4. HEI R&D Capability Matching (AI_HYBRID Match Method)
- **Entry Point**: `HEI R&D Matching Workbench` (`/app/hei-matching`)
- **Workflow**:
  1. Reviewer clicks `Suggest Relevant HEIs`.
  2. AI queries active capability directory registered by HEIs and displays top matched institutions with capability evidence notes.
  3. Reviewer clicks `+ Add Candidate Match`.
  4. Pre-fills candidate match form with `match_method: "AI_HYBRID"`.
  5. Reviewer submits standard candidate match record.

---

## 5. Standard UI Copy & Claims Guidelines
- **Allowed Terms**:
  - *"AI Suggested Route"*
  - *"AI-Assisted Candidate Match"*
  - *"Possible Duplicate Issue"*
  - *"Evidence Summary"*
  - *"Advisory Suggestion"*
- **Forbidden Terms**:
  - *"AI Approved"*
  - *"AI Verdict"*
  - *"93% Genuine"*
  - *"Auto Qualification"*
  - *"AI Proved Impact"*
"""

with open("docs/01-product/AI_ASSISTANCE_USER_FLOWS.md", "w") as f:
    f.write(content)

print("docs/01-product/AI_ASSISTANCE_USER_FLOWS.md created successfully")
