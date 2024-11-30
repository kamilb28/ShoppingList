import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShoppingService {
  private apiUrl = 'http://127.0.0.1:8000'; // URL FastAPI

  constructor(private http: HttpClient) {}

  getShoppingLists(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/shopping-lists/`);
  }

  createShoppingList(data: { name: string; due_date: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/shopping-lists/`, data);
  }

  addItemToList(listId: number, data: { name: string; quantity: number; unit: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/shopping-lists/${listId}/items/`, data);
  }

  toggleItemCompletion(listId: number, itemId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/shopping-lists/${listId}/items/${itemId}/`, {});
  }

  deleteShoppingList(listId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/shopping-lists/${listId}/`);
  }
}

