import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-list',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent {
  shoppingLists = [
    {
      id: 1,
      name: 'Groceries',
      dueDate: '2024-12-01',
      items: [
        { name: 'Milk', quantity: 1, unit: 'Liter', completed: false },
        { name: 'Bread', quantity: 2, unit: 'Loaf', completed: true },
      ],
    },
    {
      id: 2,
      name: 'Party Supplies',
      dueDate: '2024-12-10',
      items: [
        { name: 'Chips', quantity: 3, unit: 'Pack', completed: false },
        { name: 'Soda', quantity: 2, unit: 'Bottle', completed: false },
      ],
    },
  ];

  toggleCompleted(listId: number, itemName: string): void {
    const list = this.shoppingLists.find((l) => l.id === listId);
    if (list) {
      const item = list.items.find((i) => i.name === itemName);
      if (item) {
        item.completed = !item.completed;
      }
    }
  }
  
  addNewList(name: string, dueDate: string, event: Event): void {

    event.preventDefault(); // Zapobiega przeładowaniu strony
    const newId = this.shoppingLists.length + 1;

    this.shoppingLists.push({
      id: newId,
      name,
      dueDate,
      items: [],
    });
  }
  
  deleteList(listId: number): void {
    this.shoppingLists = this.shoppingLists.filter((list) => list.id !== listId);
  }

  addItemToList(listId: number, name: string, quantity: number, unit: string, event: Event): void {
    event.preventDefault(); // Zapobiega przeładowaniu strony
  
    const list = this.shoppingLists.find((l) => l.id === listId);
    if (list && name && quantity > 0 && unit) {
      list.items.push({
        name,
        quantity,
        unit,
        completed: false,
      });
    }
  }
  
}

