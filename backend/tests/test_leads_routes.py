import pytest, os, sys # type: ignore
from httpx import AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.routes.leads_routes import router
from app.configs.database.postgres_db import get_postgres_db, Base
from app.models.postgres_models import LeadModel

os.environ["POSTGRES_URL"] = "sqlite:///./test.db"
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"


engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(router)

def override_get_postgres_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_postgres_db] = override_get_postgres_db

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_create_lead(client):
    response = await client.post("/", json={"name": "Test Lead", "address": "123 Main St", "zipcode": "12345", "state": "CA", "country": "USA", "area_of_interest": "Technology", "status": "New"})
    assert response.status_code == 200
    assert response.json()["name"] == "Test Lead"
    assert response.json()["status"] == "New"

@pytest.mark.asyncio
async def test_create_duplicate_lead(client):
    await client.post("/", json={"name": "Duplicate Lead", "address": "123 Main St", "zipcode": "12345", "state": "CA", "country": "USA", "area_of_interest": "Technology", "status": "New"})
    response = await client.post("/", json={"name": "Duplicate Lead", "address": "123 Main St", "zipcode": "12345", "state": "CA", "country": "USA", "area_of_interest": "Technology", "status": "New"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Lead with this name already exists"

@pytest.mark.asyncio
async def test_get_leads(client):
    response = await client.get("/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_lead(client):
    # Create a lead first
    create_response = await client.post("/", json={"name": "Test Lead", "address": "123 Main St", "zipcode": "12345", "state": "CA", "country": "USA", "area_of_interest": "Technology", "status": "New"})
    lead_id = create_response.json()["id"]

    # Get the lead
    response = await client.get(f"/{lead_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Test Lead"

@pytest.mark.asyncio
async def test_update_lead(client):
    # Create a lead first
    create_response = await client.post("/", json={"name": "Test Lead", "address": "123 Main St", "zipcode": "12345", "state": "CA", "country": "USA", "area_of_interest": "Technology", "status": "New"})
    lead_id = create_response.json()["id"]

    # Update the lead
    update_data = {"name": "Updated Lead", "address": "123 Main St", "zipcode": "12345", "state": "CA", "country": "USA", "area_of_interest": "Technology", "status": "Contacted"}
    response = await client.put(f"/{lead_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Lead"
    assert response.json()["status"] == "Contacted"

@pytest.mark.asyncio
async def test_delete_lead(client):
    # Create a lead first
    create_response = await client.post("/", json={"name": "Test Lead", "address": "123 Main St", "zipcode": "12345", "state": "CA", "country": "USA", "area_of_interest": "Technology", "status": "New"})
    lead_id = create_response.json()["id"]

    # Delete the lead
    response = await client.delete(f"/{lead_id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Lead deleted successfully"