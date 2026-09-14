with open("apps/api/app/main.py", "r") as f:
    content = f.read()

middleware_code = """
@app.middleware("http")
async def request_correlation_id_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id
    start_time = time.time()

    response: Response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)
    response.headers["X-Request-ID"] = request_id

    # Structured logging output (excluding sensitive content)
    path = request.url.path
    if not path.startswith("/_next") and not path.startswith("/static"):
        status_code = response.status_code
        print(f'{{"timestamp":"{time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}","level":"INFO","request_id":"{request_id}","route":"{path}","method":"{request.method}","status_code":{status_code},"latency_ms":{duration_ms}}}')

    return response
"""

if "request_correlation_id_middleware" not in content:
    # Add uuid import if missing
    if "import uuid" not in content:
        content = "import uuid\n" + content
    
    target = "@app.middleware(\"http\")\nasync def security_and_csrf_middleware"
    content = content.replace(target, middleware_code + "\n" + target)

    with open("apps/api/app/main.py", "w") as f:
        f.write(content)

print("apps/api/app/main.py updated with request correlation middleware")
