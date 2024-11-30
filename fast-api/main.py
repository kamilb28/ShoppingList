from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from models.user import User
from models.shoppinglist import ShoppingItem, ShoppingList
from schemas import shoppinglistrepo, userrepo
import auth
from pydantic import BaseModel

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

# # Get all shopping lists
# @app.get("/shopping-lists/", response_model=list[shoppinglistrepo.ShoppingList])
# def get_shopping_lists(db: Session = Depends(get_db)):
#     return db.query(shoppinglist.ShoppingList).all()

# # Create a new shopping list
# @app.post("/shopping-lists/", response_model=shoppinglistrepo.ShoppingList)
# def create_shopping_list(list_data: shoppinglistrepo.ShoppingListCreate, db: Session = Depends(get_db)):
#     new_list = shoppinglist.ShoppingList(**list_data.dict())
#     db.add(new_list)
#     db.commit()
#     db.refresh(new_list)
#     return new_list

@app.get("/shopping-lists/", response_model=list[shoppinglistrepo.ShoppingList])
def get_shopping_lists(
    db: Session = Depends(get_db), username: str = Depends(auth.get_current_user)
):
    user = db.query(User).filter(User.username == username).first()
    if user is None:
            raise HTTPException(status_code=401, detail="User not found")
    return db.query(ShoppingList).filter(ShoppingList.owner_id == user.id).all()

@app.post("/shopping-lists/", response_model=shoppinglistrepo.ShoppingList)
def create_shopping_list(
    list_data: shoppinglistrepo.ShoppingListCreate,
    db: Session = Depends(get_db),
    username: str = Depends(auth.get_current_user),
):
    user = db.query(User).filter(User.username == username).first()
    if user is None:
            raise HTTPException(status_code=401, detail="User not found")
    new_list = ShoppingList(**list_data.dict(), owner_id=user.id)
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return new_list

# Add an item to a shopping list
@app.post("/shopping-lists/{list_id}/items/", response_model=shoppinglistrepo.ShoppingItem)
def add_item_to_list(list_id: int, item_data: shoppinglistrepo.ShoppingItemCreate, db: Session = Depends(get_db)):
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    new_item = ShoppingItem(**item_data.dict(), list_id=list_id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

# Mark an item as completed
@app.put("/shopping-lists/{list_id}/items/{item_id}/", response_model=shoppinglistrepo.ShoppingItem)
def toggle_item_completion(list_id: int, item_id: int, db: Session = Depends(get_db)):
    item = db.query(ShoppingItem).filter(ShoppingItem.id == item_id, ShoppingItem.list_id == list_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.completed = not item.completed
    db.commit()
    db.refresh(item)
    return item

# Delete a shopping list
@app.delete("/shopping-lists/{list_id}/")
def delete_shopping_list(list_id: int, db: Session = Depends(get_db)):
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    db.delete(shopping_list)
    db.commit()
    return {"message": "Shopping list deleted successfully"}

@app.post("/register/", response_model=userrepo.UserCreate)
def register_user(_user: userrepo.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == _user.username).first()
    if db_user:
        raise HTTPException(status_code=409, detail="Username already registered")
    hashed_password = auth.get_password_hash(_user.password)
    new_user = User(username=_user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login/")
def login_user(data: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == data.username).first()
    if not db_user or not auth.verify_password(data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    access_token = auth.create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}
