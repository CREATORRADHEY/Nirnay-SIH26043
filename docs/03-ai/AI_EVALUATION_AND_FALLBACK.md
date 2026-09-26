# AI Evaluation & Fallback — NIRNAY

## 1. AI Evaluation Framework

NIRNAY includes an automated AI benchmark evaluation engine (`apps/api/app/api/v1/ai_evaluation.py` & `apps/api/app/schemas/ai_evaluation.py`) that measures LLM performance against a curated dataset of civic challenge scenarios.

### Evaluated Metrics
1. **Qualification Route Agreement Rate**: Measures match rate between AI suggested route and expert human reviewer route.
2. **Duplicate Detection Precision & Recall**: Evaluates accuracy in identifying duplicate challenge submissions.
3. **Execution Latency**: Tracks response times across models (`gemini-2.5-flash` vs fallback engines).

---

## 2. AI-Disabled Fallback Plan

If AI service is disabled (`AI_ENABLED=False`), experiencing rate limits, or network connectivity is lost:

1. **Seamless Degraded Execution**: Core governance workflows (reporting, qualification, matching, readiness, pilot execution, outcome integrity) continue without interruption.
2. **UI Fallback Indicators**: Buttons requesting AI extraction or suggestions display a graceful fallback message:  
   *"AI assistance is currently offline. Please enter details manually."*
3. **Deterministic Mock Service**: During hackathon demonstrations or offline evaluation, setting `AI_PROVIDER=disabled` engages the local mock service, returning pre-validated heuristic suggestions without network calls.
