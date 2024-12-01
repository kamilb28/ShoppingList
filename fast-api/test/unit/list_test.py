from models.shoppinglist import ShoppingList, ShoppingItem
from unittest.mock import MagicMock
from main import *
from fastapi import HTTPException
from schemas.shoppinglistrepo import ShoppingListCreate, ShoppingItemCreate

def test_create_shopping_list():
    shopping_list = ShoppingList(name="Groceries", due_date="2024-12-31")
    assert shopping_list.name == "Groceries"
    assert shopping_list.due_date == "2024-12-31"

def test_add_item_to_list():
    shopping_list = ShoppingList(name="Groceries", due_date="2024-12-31")
    item = ShoppingItem(name="Milk", quantity=2, unit="liters")
    shopping_list.items.append(item)
    assert len(shopping_list.items) == 1
    assert shopping_list.items[0].name == "Milk"

def test_create_shopping_list_success():
    mock_db = MagicMock()

    mock_user = MagicMock()
    mock_user.id = 1
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    list_data = ShoppingListCreate(name="Groceries", due_date="2024-12-31")

    new_list = create_shopping_list(list_data, db=mock_db, username="testuser")

    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()

    assert new_list.name == "Groceries"
    assert new_list.due_date == "2024-12-31"
    assert new_list.owner_id == mock_user.id


def test_get_shopping_lists_success():
    mock_db = MagicMock()
    mock_user = MagicMock()
    mock_user.id = 1

    mock_db.query.return_value.filter.return_value.all.return_value = [
        {"id": 1, "name": "Groceries", "due_date": "2024-12-31", "owner_id": 1},
        {"id": 2, "name": "Work Supplies", "due_date": "2024-11-30", "owner_id": 1},
    ]

    shopping_lists = get_shopping_lists(db=mock_db, username="testuser")

    assert len(shopping_lists) == 2
    assert shopping_lists[0]["name"] == "Groceries"
    assert shopping_lists[1]["name"] == "Work Supplies"


def test_delete_shopping_list_success():
    mock_db = MagicMock()

    mock_db.query.return_value.filter.return_value.first.return_value = MagicMock()

    response = delete_shopping_list(list_id=1, db=mock_db)

    mock_db.delete.assert_called_once()
    mock_db.commit.assert_called_once()
    assert response == {"message": "Shopping list deleted successfully"}

def test_delete_shopping_list_not_found():
    mock_db = MagicMock()

    mock_db.query.return_value.filter.return_value.first.return_value = None

    try:
        delete_shopping_list(list_id=1, db=mock_db)
    except HTTPException as exc:
        assert exc.status_code == 404
        assert exc.detail == "Shopping list not found"

def test_add_item_to_list_success():
    mock_db = MagicMock()
    mock_list = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = mock_list

    item_data = ShoppingItemCreate(name="Milk", quantity=2, unit="liters")

    new_item = add_item_to_list(list_id=1, item_data=item_data, db=mock_db)

    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()

    assert new_item.name == "Milk"
    assert new_item.quantity == 2
    assert new_item.unit == "liters"
    assert new_item.list_id == 1

def test_toggle_item_completion_success():
    mock_db = MagicMock()
    mock_item = MagicMock()
    mock_item.completed = False
    mock_db.query.return_value.filter.return_value.first.return_value = mock_item

    updated_item = toggle_item_completion(list_id=1, item_id=1, db=mock_db)

    assert updated_item.completed is True
    mock_db.commit.assert_called_once()

def test_toggle_item_completion_not_found():
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = None

    try:
        toggle_item_completion(list_id=1, item_id=1, db=mock_db)
    except HTTPException as exc:
        assert exc.status_code == 404
        assert exc.detail == "Item not found"
