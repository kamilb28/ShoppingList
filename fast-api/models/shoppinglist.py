from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class ShoppingList(Base):
    __tablename__ = "shopping_lists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    due_date = Column(String, index=True)
    items = relationship("ShoppingItem", back_populates="list")


class ShoppingItem(Base):
    __tablename__ = "shopping_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    quantity = Column(Integer)
    unit = Column(String)
    completed = Column(Boolean, default=False)
    list_id = Column(Integer, ForeignKey("shopping_lists.id"))

    list = relationship("ShoppingList", back_populates="items")
