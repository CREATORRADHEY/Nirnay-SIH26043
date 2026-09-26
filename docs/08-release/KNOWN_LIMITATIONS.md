# Known Limitations — NIRNAY

## 1. Transparent Scope Declarations

To ensure honest evaluation, the following technical and operational boundaries apply to the current MVP release:

1. **MVP Ephemeral Storage Boundary**:
   - In the default MVP configuration (`STORAGE_PROVIDER=local`, `ALLOW_EPHEMERAL_STORAGE=true`), structured governance records (challenges, qualifications, commitments, readiness decisions, audit logs) persist permanently in PostgreSQL.
   - However, uploaded binary evidence files (photographs, PDF attachments) are stored in local ephemeral storage and may be reset upon backend instance restarts or redeployments on Render. Full production deployment requires mounting an S3-compatible object store.
2. **Hosting Compute Inactivity (Render)**:
   - The free/starter deployment tier on Render spins down backend compute instances after 15 minutes of inactivity. First requests after inactivity incur a ~15-30 second cold-start spin-up delay.
3. **Controlled Usability Sample**:
   - Usability testing results (`docs/06-validation/USABILITY_AND_UX_VALIDATION.md`) are based on a controlled sample of 5 participants. They demonstrate interface workflow clarity but do not constitute statewide statistical adoption proof.
4. **No Unverified Statewide Rollout Claims**:
   - NIRNAY is fully functional as a validated MVP platform for hackathon evaluation. The repository makes zero false claims of official statewide government deployment or active municipal integration.
