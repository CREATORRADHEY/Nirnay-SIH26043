with open("apps/web/src/app/app/hei-matching/page.tsx", "r") as f:
    content = f.read()

content = content.replace("const chList = (chRes as any).items || (chRes as any).data?.items || [];", "const chList = (chRes as { items?: Challenge[]; data?: { items: Challenge[] } }).items || (chRes as { data?: { items: Challenge[] } }).data?.items || [];")
content = content.replace("const heiList = (orgsRes as any).data?.items || (orgsRes as any).items || [];", "const heiList = (orgsRes as { data?: { items: HEIOrganizationResponse[] }; items?: HEIOrganizationResponse[] }).data?.items || (orgsRes as { items?: HEIOrganizationResponse[] }).items || [];")

with open("apps/web/src/app/app/hei-matching/page.tsx", "w") as f:
    f.write(content)

print("hei-matching/page.tsx cast fixes completed")
