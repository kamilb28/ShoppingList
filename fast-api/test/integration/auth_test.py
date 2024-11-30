from fastapi.testclient import TestClient
from main import app
from auth import create_access_token

from test_main import test_client

def test_register_user_success(test_client):
    response = test_client.post(
        "/register/",
        json={"username": "testuser", "password": "testpassword"},
    )
    assert response.status_code == 201


def test_register_user_duplicate_username(test_client):
    # Dodanie użytkownika
    test_client.post(
        "/register/",
        json={"username": "testuser", "password": "testpassword"},
    )
    # Próba dodania tego samego użytkownika
    response = test_client.post(
        "/register/",
        json={"username": "testuser", "password": "newpassword"},
    )
    assert response.status_code == 409
    assert response.json() == {"detail": "Username already registered"}


def test_login_user_success(test_client):
    # Zarejestruj użytkownika
    test_client.post(
        "/register/",
        json={"username": "testuser", "password": "testpassword"},
    )

    # Poprawne logowanie
    response = test_client.post(
        "/login/",
        json={"username": "testuser", "password": "testpassword"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_user_invalid_credentials(test_client):
    response = test_client.post(
        "/login/",
        json={"username": "wronguser", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid username or password"}


def test_register_user_missing_fields(test_client):
    response = test_client.post("/register/", json={"username": "testuser"})
    assert response.status_code == 422

    response = test_client.post("/register/", json={"password": "testpassword"})
    assert response.status_code == 422

def test_login_missing_fields(test_client):
    response = test_client.post("/login/", json={"username": "testuser"})
    assert response.status_code == 422

    response = test_client.post("/login/", json={"password": "testpassword"})
    assert response.status_code == 422

def test_login_invalid_credentials(test_client):
    response = test_client.post(
        "/login/", json={"username": "wronguser", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid username or password"}


def test_access_protected_route_no_token(test_client):
    response = test_client.get("/shopping-lists/")
    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}

def test_access_protected_route_invalid_token(test_client):
    response = test_client.get(
        "/shopping-lists/", headers={"Authorization": "Bearer invalidtoken"}
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid token"}

def test_create_access_token():
    data = {"sub": "testuser"}
    token = create_access_token(data)
    assert token is not None
