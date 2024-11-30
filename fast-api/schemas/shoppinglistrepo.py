from pydantic import BaseModel
from typing import List, Optional

class ShoppingItemBase(BaseModel):
    name: str
    quantity: int
    unit: str
    completed: Optional[bool] = False

class ShoppingItemCreate(ShoppingItemBase):
    pass

class ShoppingItem(ShoppingItemBase):
    id: int
    list_id: int

    class Config:
        orm_mode = True

class ShoppingListBase(BaseModel):
    name: str
    due_date: str

class ShoppingListCreate(ShoppingListBase):
    pass

class ShoppingList(ShoppingListBase):
    id: int
    items: List[ShoppingItem] = []

    class Config:
        orm_mode = True
