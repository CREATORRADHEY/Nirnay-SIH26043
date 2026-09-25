from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "nirnay-api"
    assert "version" in data
    assert "release_sha" in data


def test_health_ready() -> None:
    response = client.get("/health/ready")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert "checks" in data
    assert "storage" in data["checks"]
    assert "provider" in data["checks"]["storage"]
    assert "durable" in data["checks"]["storage"]
    assert "mode" in data["checks"]["storage"]
