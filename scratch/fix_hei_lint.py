with open("apps/web/src/app/app/hei-matching/page.tsx", "r") as f:
    content = f.read()

content = content.replace("'use client';", '"use client";')
content = content.replace("(cap: any)", "(cap: { id: string; name: string; description: string; capability_type: string; discipline: string })")

with open("apps/web/src/app/app/hei-matching/page.tsx", "w") as f:
    f.write(content)

print("hei-matching/page.tsx updated")
