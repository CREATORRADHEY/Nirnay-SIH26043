from fastapi import FastAPI

app = FastAPI(title="nirnay-api")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "nirnay-api"}
