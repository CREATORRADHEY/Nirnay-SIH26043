with open("apps/web/src/app/app/challenges/new/page.tsx", "r") as f:
    content = f.read()

content = content.replace('import { CitizenAIExtractionModal } from "@/components/ai/CitizenAIExtractionModal";\n"use client";', '"use client";\n\nimport { CitizenAIExtractionModal } from "@/components/ai/CitizenAIExtractionModal";')

with open("apps/web/src/app/app/challenges/new/page.tsx", "w") as f:
    f.write(content)

print("apps/web/src/app/app/challenges/new/page.tsx updated with line 1 directive")
