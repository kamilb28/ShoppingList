import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShoppingService } from '../services/shopping-list.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent implements OnInit {
  shoppingLists: any[] = [];

  constructor(private shoppingService: ShoppingService) {}

  ngOnInit(): void {
    this.shoppingService.getShoppingLists().subscribe((data) => {
      this.shoppingLists = data;
    });
  }

  addNewList(name: string, dueDate: string, event: Event): void {
    event.preventDefault();
    const newList = { name, due_date: dueDate };
    this.shoppingService.createShoppingList(newList).subscribe((list) => {
      this.shoppingLists.push(list);
    });
  }

  addItemToList(listId: number, name: string, quantity: number, unit: string, event: Event): void {
    event.preventDefault();
    const newItem = { name, quantity, unit };
    this.shoppingService.addItemToList(listId, newItem).subscribe((item) => {
      const list = this.shoppingLists.find((l) => l.id === listId);
      if (list) {
        list.items.push(item);
      }
    });
  }

  toggleCompleted(listId: number, itemId: number): void {
    const list = this.shoppingLists.find((l) => l.id === listId);
    if (list) {
      const item = list.items.find((i: any) => i.id === itemId);
      if (item) {
        this.shoppingService.toggleItemCompletion(listId, itemId).subscribe(
          (updatedItem) => {
            item.completed = updatedItem.completed;
          },
          (error) => {
            console.error('Failed to toggle completion:', error);
            alert('Could not toggle item completion. Please try again.');
          }
        );
      }
    }
  }

  deleteList(listId: number): void {
    this.shoppingService.deleteShoppingList(listId).subscribe(() => {
      this.shoppingLists = this.shoppingLists.filter((list) => list.id !== listId);
    });
  }
}
