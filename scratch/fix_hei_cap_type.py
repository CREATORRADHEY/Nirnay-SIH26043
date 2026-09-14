with open("apps/web/src/app/app/hei-matching/page.tsx", "r") as f:
    content = f.read()

target = '{org.active_capabilities?.map((cap: { id: string; name: string; description: string; capability_type: string; discipline: string }) => ('
replacement = '{org.active_capabilities?.map((cap) => ('

content = content.replace(target, replacement)

with open("apps/web/src/app/app/hei-matching/page.tsx", "w") as f:
    f.write(content)

print("apps/web/src/app/app/hei-matching/page.tsx updated cap parameter")
