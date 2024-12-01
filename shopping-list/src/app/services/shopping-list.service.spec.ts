import { TestBed } from '@angular/core/testing';
import { ShoppingService } from './shopping-list.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ShoppingService', () => {
  let service: ShoppingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ShoppingService],
    });

    service = TestBed.inject(ShoppingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensures no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch shopping lists', () => {
    const mockResponse = [
      { id: 1, name: 'Groceries', due_date: '2024-12-01', items: [] },
      { id: 2, name: 'Electronics', due_date: '2024-12-02', items: [] },
    ];

    service.getShoppingLists().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://127.0.0.1:8000/shopping-lists/');
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('should create a new shopping list', () => {
    const mockResponse = { id: 3, name: 'Party Supplies', due_date: '2024-12-03' };
    const requestData = { name: 'Party Supplies', due_date: '2024-12-03' };

    service.createShoppingList(requestData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://127.0.0.1:8000/shopping-lists/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(requestData);

    req.flush(mockResponse);
  });

  it('should add an item to a shopping list', () => {
    const mockResponse = { id: 101, name: 'Milk', quantity: 2, unit: 'liters', completed: false };
    const listId = 1;
    const requestData = { name: 'Milk', quantity: 2, unit: 'liters' };

    service.addItemToList(listId, requestData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`http://127.0.0.1:8000/shopping-lists/${listId}/items/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(requestData);

    req.flush(mockResponse);
  });

  it('should toggle the completion status of an item', () => {
    const mockResponse = { id: 101, name: 'Milk', quantity: 2, unit: 'liters', completed: true };
    const listId = 1;
    const itemId = 101;

    service.toggleItemCompletion(listId, itemId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`http://127.0.0.1:8000/shopping-lists/${listId}/items/${itemId}/`);
    expect(req.request.method).toBe('PUT');

    req.flush(mockResponse);
  });

  it('should delete a shopping list', () => {
    const listId = 1;

    service.deleteShoppingList(listId).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`http://127.0.0.1:8000/shopping-lists/${listId}/`);
    expect(req.request.method).toBe('DELETE');

    req.flush(null);
  });
});
