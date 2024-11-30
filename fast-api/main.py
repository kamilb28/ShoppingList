from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from models import shoppinglist
from schemas import shoppinglistrepo

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dodaj CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Zezwól na połączenia z Angulara
    allow_credentials=True,
    allow_methods=["*"],  # Zezwól na wszystkie metody (GET, POST, PUT, DELETE, itp.)
    allow_headers=["*"],  # Zezwól na wszystkie nagłówki
)

Base.metadata.create_all(bind=engine)

# Get all shopping lists
@app.get("/shopping-lists/", response_model=list[shoppinglistrepo.ShoppingList])
def get_shopping_lists(db: Session = Depends(get_db)):
    return db.query(shoppinglist.ShoppingList).all()

# Create a new shopping list
@app.post("/shopping-lists/", response_model=shoppinglistrepo.ShoppingList)
def create_shopping_list(list_data: shoppinglistrepo.ShoppingListCreate, db: Session = Depends(get_db)):
    new_list = shoppinglist.ShoppingList(**list_data.dict())
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return new_list

# Add an item to a shopping list
@app.post("/shopping-lists/{list_id}/items/", response_model=shoppinglistrepo.ShoppingItem)
def add_item_to_list(list_id: int, item_data: shoppinglistrepo.ShoppingItemCreate, db: Session = Depends(get_db)):
    shopping_list = db.query(shoppinglist.ShoppingList).filter(shoppinglist.ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    new_item = shoppinglist.ShoppingItem(**item_data.dict(), list_id=list_id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

# Mark an item as completed
@app.put("/shopping-lists/{list_id}/items/{item_id}/", response_model=shoppinglistrepo.ShoppingItem)
def toggle_item_completion(list_id: int, item_id: int, db: Session = Depends(get_db)):
    item = db.query(shoppinglist.ShoppingItem).filter(shoppinglist.ShoppingItem.id == item_id, shoppinglist.ShoppingItem.list_id == list_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.completed = not item.completed
    db.commit()
    db.refresh(item)
    return item

# Delete a shopping list
@app.delete("/shopping-lists/{list_id}/")
def delete_shopping_list(list_id: int, db: Session = Depends(get_db)):
    shopping_list = db.query(shoppinglist.ShoppingList).filter(shoppinglist.ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    db.delete(shopping_list)
    db.commit()
    return {"message": "Shopping list deleted successfully"}
