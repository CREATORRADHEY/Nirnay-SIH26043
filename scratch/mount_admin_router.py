with open("apps/api/app/api/v1/router.py", "r") as f:
    content = f.read()

import_line = "from app.api.v1.admin import router as admin_router\n"
if "admin_router" not in content:
    content = import_line + content
    content += "\napi_v1_router.include_router(admin_router)\n"

with open("apps/api/app/api/v1/router.py", "w") as f:
    f.write(content)

print("apps/api/app/api/v1/router.py updated with admin_router")
