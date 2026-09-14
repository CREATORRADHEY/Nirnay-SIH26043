with open("apps/web/e2e/06-ai-assistance.spec.ts", "r") as f:
    content = f.read()

content = content.replace("@playwright.test", "@playwright/test")

with open("apps/web/e2e/06-ai-assistance.spec.ts", "w") as f:
    f.write(content)

print("e2e/06-ai-assistance.spec.ts updated")
