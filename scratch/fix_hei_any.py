with open("apps/web/src/app/app/hei-matching/page.tsx", "r") as f:
    content = f.read()

content = content.replace("match_method: candMatchMethod as any,", "match_method: candMatchMethod as \"MANUAL\" | \"AI_HYBRID\",")
content = content.replace("catch (err: any) {", "catch (err: unknown) {")
content = content.replace("alert(err.message ||", "const msg = err instanceof Error ? err.message : \"Error\"; alert(msg ||")

with open("apps/web/src/app/app/hei-matching/page.tsx", "w") as f:
    f.write(content)

print("hei-matching/page.tsx explicit any replaced")
