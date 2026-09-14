with open("apps/api/app/api/v1/admin.py", "r") as f:
    content = f.read()

content = content.replace("from app.models.evidence import EvidenceClarification", "from app.models.clarification import ClarificationRequest")
content = content.replace("EvidenceClarification.id", "ClarificationRequest.id")
content = content.replace("EvidenceClarification.status", "ClarificationRequest.status")

with open("apps/api/app/api/v1/admin.py", "w") as f:
    f.write(content)

print("apps/api/app/api/v1/admin.py updated imports")
