# Product Roadmap — NIRNAY

> [!IMPORTANT]  
> The items listed below represent future development directions post-hackathon. They are explicitly marked as **FUTURE ROADMAP** and are not claimed as currently completed features in the MVP build.

---

## 1. Post-Hackathon Roadmap Phases

### Phase 1: Production Infrastructure & Storage (Target: Q4 2026)
- **Durable S3 Object Storage**: Migration from ephemeral local storage to AWS S3 / Cloudflare R2 for durable binary evidence preservation with presigned upload URLs.
- **Production Kubernetes / Cloud Run Deployment**: Migration from starter Render web services to autoscaling container infrastructure with zero cold-start latency.

### Phase 2: Government Identity Integration (Target: Q1 2027)
- **Single Sign-On (SSO) Integration**: Support for Indian government SSO standards (ePramaan, MeriPahchan) for seamless nodal officer login.
- **Aadhaar / DigiLocker Verification**: Optional identity verification for citizen challenge reporters and institutional faculty leads.

### Phase 3: Field Operations & Regional Multichannel (Target: Q2 2027)
- **Offline-First Mobile Application**: React Native mobile app supporting offline evidence capture and GPS spatial tagging in rural areas.
- **WhatsApp / IVRS Gateway**: Voice-based challenge intake for citizens without smartphone access.
- **Expanded Regional Language AI Translation**: Real-time automated translation of citizen audio complaints into official administrative report formats.
