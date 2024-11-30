from fastapi.testclient import TestClient
from main import app
from auth import create_access_token

from test_main import test_client

def test_create_shopping_list(test_client):
    # Zarejestruj użytkownika i zaloguj się
    test_client.post(
        "/register/",
        json={"username": "testuser", "password": "testpassword"},
    )
    login_response = test_client.post(
        "/login/",
        json={"username": "testuser", "password": "testpassword"},
    )
    token = login_response.json()["access_token"]

    # Dodaj listę zakupów
    response = test_client.post(
        "/shopping-lists/",
        json={"name": "Groceries", "due_date": "2024-12-31"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Groceries"
    assert response.json()["due_date"] == "2024-12-31"

def test_get_shopping_lists(test_client):
    login_response = test_client.post(
        "/login/",
        json={"username": "testuser", "password": "testpassword"},
    )
    token = login_response.json()["access_token"]

    # Pobierz listy zakupów
    response = test_client.get(
        "/shopping-lists/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_delete_shopping_list(test_client):
    login_response = test_client.post(
        "/login/",
        json={"username": "testuser", "password": "testpassword"},
    )
    token = login_response.json()["access_token"]

    # Dodaj listę zakupów
    response = test_client.post(
        "/shopping-lists/",
        json={"name": "Temporary List", "due_date": "2024-12-31"},
        headers={"Authorization": f"Bearer {token}"},
    )
    list_id = response.json()["id"]

    # Usuń listę zakupów
    delete_response = test_client.delete(
        f"/shopping-lists/{list_id}/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert delete_response.status_code == 200
    assert delete_response.json() == {"message": "Shopping list deleted successfully"}

def test_add_item_to_list(test_client):
    data = {"sub": "testuser"}
    token = create_access_token(data)
    assert token is not None
    # Dodaj listę zakupów
    response = test_client.post(
        "/shopping-lists/",
        json={"name": "Groceries", "due_date": "2024-12-31"},
        headers={"Authorization": f"Bearer {token}"},  # Upewnij się, że masz token
    )
    list_id = response.json()["id"]

    # Dodaj element do listy
    response = test_client.post(
        f"/shopping-lists/{list_id}/items/",
        json={"name": "Milk", "quantity": 2, "unit": "liters"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Milk"
    assert response.json()["quantity"] == 2


def test_toggle_item_completion(test_client):
    data = {"sub": "testuser"}
    token = create_access_token(data)
    assert token is not None

    response = test_client.post(
        "/shopping-lists/",
        json={"name": "Groceries", "due_date": "2024-12-31"},
        headers={"Authorization": f"Bearer {token}"},  # Upewnij się, że masz token
    )
    list_id = response.json()["id"]

    # Dodaj element do listy
    response = test_client.post(
        f"/shopping-lists/{list_id}/items/",
        json={"name": "Milk", "quantity": 2, "unit": "liters"},
        headers={"Authorization": f"Bearer {token}"},
    )
    item_id = response.json()["id"]

    response = test_client.put(
        f"/shopping-lists/{list_id}/items/{item_id}/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["completed"] is True


def test_delete_shopping_list_not_found(test_client):
    data = {"sub": "testuser"}
    token = create_access_token(data)
    assert token is not None
    response = test_client.delete(
        "/shopping-lists/99999/", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404
    assert response.json() == {"detail": "Shopping list not found"}


def test_create_shopping_list_empty_json(test_client):
    data = {"sub": "testuser"}
    token = create_access_token(data)
    assert token is not None
    response = test_client.post(
        "/shopping-lists/",
        json={},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422


def test_add_item_to_nonexistent_list(test_client):
    data = {"sub": "testuser"}
    token = create_access_token(data)
    assert token is not None
    response = test_client.post(
        "/shopping-lists/99999/items/",
        json={"name": "Milk", "quantity": 2, "unit": "liters"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404
    assert response.json() == {"detail": "Shopping list not found"}


# wydajnościowy ???
# def test_add_many_items_to_list(test_client):
#     data = {"sub": "testuser"}
#     token = create_access_token(data)
#     assert token is not None

#     response = test_client.post(
#         "/shopping-lists/",
#         json={"name": "Groceries", "due_date": "2024-12-31"},
#         headers={"Authorization": f"Bearer {token}"},  # Upewnij się, że masz token
#     )
#     list_id = response.json()["id"]

#     for i in range(100):
#         response = test_client.post(
#             f"/shopping-lists/{list_id}/items/",
#             json={"name": f"Item {i}", "quantity": 1, "unit": "pcs"},
#             headers={"Authorization": f"Bearer {token}"},
#         )
#         assert response.status_code == 200


