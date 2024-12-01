import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app, get_db
from database import Base
import os

# Create a temporary SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./e2e-test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency override for testing
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    #Initialize
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup after the session
    if os.path.exists("./e2e-test.db"):
        os.remove("./e2e-test.db")

client = TestClient(app)

def test_register_and_login():
    # Register a new user
    register_response = client.post("/register/", json={
        "username": "testuser",
        "password": "testpassword"
    })
    assert register_response.status_code == 201

    # Login with the registered user
    login_response = client.post("/login/", json={
        "username": "testuser",
        "password": "testpassword"
    })
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()

def test_create_and_get_shopping_list():
    # Register and login
    client.post("/register/", json={"username": "testuser", "password": "testpassword"})
    login_response = client.post("/login/", json={"username": "testuser", "password": "testpassword"})
    token = login_response.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # Create a shopping list
    create_list_response = client.post("/shopping-lists/", json={
        "name": "Groceries",
        "due_date": "2024-12-31"
    }, headers=headers)
    assert create_list_response.status_code == 200

    # Get shopping lists
    get_lists_response = client.get("/shopping-lists/", headers=headers)
    assert get_lists_response.status_code == 200
    shopping_lists = get_lists_response.json()
    assert len(shopping_lists) == 1
    assert shopping_lists[0]["name"] == "Groceries"

def test_add_and_toggle_item():
    # Register and login
    client.post("/register/", json={"username": "testuser", "password": "testpassword"})
    login_response = client.post("/login/", json={"username": "testuser", "password": "testpassword"})
    token = login_response.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # Create a shopping list
    create_list_response = client.post("/shopping-lists/", json={
        "name": "Groceries",
        "due_date": "2024-12-31"
    }, headers=headers)
    list_id = create_list_response.json()["id"]

    # Add an item to the list
    add_item_response = client.post(f"/shopping-lists/{list_id}/items/", json={
        "name": "Milk",
        "quantity": 2,
        "unit": "liters"
    }, headers=headers)
    assert add_item_response.status_code == 200
    item_id = add_item_response.json()["id"]

    # Toggle the item's completion status
    toggle_response = client.put(f"/shopping-lists/{list_id}/items/{item_id}/", headers=headers)
    assert toggle_response.status_code == 200
    assert toggle_response.json()["completed"] is True
