import {
    render,
    screen,
    fireEvent,
    waitFor,
    within,
  } from '@testing-library/angular';
  import { TestBed } from '@angular/core/testing';
  import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
  import { ListComponent } from '../../src/app/list/list.component';
  import { ShoppingService } from '../../src/app/services/shopping-list.service';
  import { FormsModule } from '@angular/forms';
  
  describe('ListComponent (Integration)', () => {
    let httpMock: HttpTestingController;
  
    beforeEach(async () => {
      await render(ListComponent, {
        imports: [FormsModule, HttpClientTestingModule],
        providers: [ShoppingService],
      });
      httpMock = TestBed.inject(HttpTestingController);
    });
  
    it('should fetch and display shopping lists', async () => {
      // Simulate backend response
      const mockLists = [
        { id: 1, name: 'Groceries', due_date: '2024-12-31' },
        { id: 2, name: 'Electronics', due_date: '2024-11-30' },
      ];
  
      // Assert that the component makes the correct API call
      const req = httpMock.expectOne('http://127.0.0.1:8000/shopping-lists/');
      expect(req.request.method).toBe('GET');
      req.flush(mockLists);

      const shoppingLists = await screen.findAllByTestId('shoppingLists');
      expect(shoppingLists.length).toBe(mockLists.length);
  
      // Assert that the shopping lists are displayed
      mockLists.forEach((list, index) => {
        const shoppingListDiv = shoppingLists[index];
        const h3 = within(shoppingListDiv).getByText(
          `${list.name} (Due: ${list.due_date})`
        );
        expect(h3).toBeTruthy();
      });    
    });
  
    it('should add a new shopping list and display it', async () => {
      const newList = { id: 3, name: 'Party Supplies', due_date: '2024-10-10' };
  
      // Simulate user input
      const nameInput = screen.getByPlaceholderText('Enter List Name');
      const dateInput = screen.getByTestId('due-date-input');
      const submitButton = screen.getByText('Add List');
  
      fireEvent.input(nameInput, { target: { value: newList.name } });
      fireEvent.input(dateInput, { target: { value: newList.due_date } });
  
      fireEvent.click(submitButton);
  
      // Assert the POST request
      const requests = httpMock.match('http://127.0.0.1:8000/shopping-lists/');
      const getReq = requests[0];
      expect(getReq.request.method).toBe('GET');
      const postReq = requests[1];
      expect(postReq.request.method).toBe('POST');
      expect(postReq.request.body).toEqual({
        name: newList.name,
        due_date: newList.due_date,
      });
      postReq.flush(newList);

      const shoppingLists = await screen.findAllByTestId('shoppingLists');
      const shoppingListDiv = shoppingLists[0];
      const h3 = within(shoppingListDiv).getByText(
        `${newList.name} (Due: ${newList.due_date})`
      );
      expect(h3).toBeTruthy();
    });
  
    it('should fetch and display items', async () => {
      const mockItems = [
        { id: 1, name: 'Milk', quantity: 2, unit: 'liters', completed: false, list_id: 1 },
        { id: 2, name: 'Bread', quantity: 1, unit: 'loaf', completed: true, list_id: 1 },
      ];
      const mockLists = [{ id: 1, name: 'Groceries', due_date: '2024-12-31', items: mockItems }];
  
      // Assert the GET request
      const req = httpMock.expectOne('http://127.0.0.1:8000/shopping-lists/');
      expect(req.request.method).toBe('GET');
      req.flush(mockLists);

      const shoppingLists = await screen.findAllByTestId('shoppingLists');
      const shoppingListDiv = shoppingLists[0];
      const h3 = within(shoppingListDiv).getByText(
        `${mockLists[0].name} (Due: ${mockLists[0].due_date})`
      );
      expect(h3).toBeTruthy();
  
      for (const item of mockItems) {
        expect(screen.getByText(`${item.name} - ${item.quantity} ${item.unit}`)).toBeTruthy();
      }
    });
  
    it('should add a new item to the list', async () => {
      const mockLists = [{ id: 1, name: 'Groceries', due_date: '2024-12-31', items: [] }];
      const newItem = { id: 3, name: 'Eggs', quantity: 12, unit: 'pieces' };

      // Assert the GET request
      const req = httpMock.expectOne('http://127.0.0.1:8000/shopping-lists/');
      expect(req.request.method).toBe('GET');
      req.flush(mockLists);

      const shoppingLists = await screen.findAllByTestId('shoppingLists');
      const shoppingListDiv = shoppingLists[0];
      const h3 = within(shoppingListDiv).getByText(
        `${mockLists[0].name} (Due: ${mockLists[0].due_date})`
      );
      expect(h3).toBeTruthy();
        
      // Simulate user input
      const nameInput = screen.getByPlaceholderText('Item Name');
      const quantityInput = screen.getByPlaceholderText('Quantity');
      const unitInput = screen.getByPlaceholderText('Unit (e.g. kg, szt)');
      const submitButton = screen.getByText('Add Item');
  
      fireEvent.input(nameInput, { target: { value: newItem.name } });
      fireEvent.input(quantityInput, { target: { value: newItem.quantity } });
      fireEvent.input(unitInput, { target: { value: newItem.unit } });
  
      fireEvent.click(submitButton);
  
      // Assert the POST request
      const postReq = httpMock.expectOne('http://127.0.0.1:8000/shopping-lists/1/items/');
      expect(postReq.request.method).toBe('POST');
      expect(postReq.request.body).toEqual({
        name: newItem.name,
        quantity: newItem.quantity,
        unit: newItem.unit,
      });
      postReq.flush(newItem);
    });
  
    it('should toggle the completion status of an item', async () => {
      const item = {
        id: 1,
        name: 'Milk',
        quantity: 2,
        unit: 'liters',
        completed: false,
      };
      const mockLists = [{ id: 1, name: 'Groceries', due_date: '2024-12-31', items: [item] }];

      const req = httpMock.expectOne('http://127.0.0.1:8000/shopping-lists/');
      expect(req.request.method).toBe('GET');
      req.flush(mockLists);

      const shoppingLists = await screen.findAllByTestId('shoppingLists');
      const shoppingListDiv = shoppingLists[0];
      const h3 = within(shoppingListDiv).getByText(
        `${mockLists[0].name} (Due: ${mockLists[0].due_date})`
      );
      expect(h3).toBeTruthy();
  
      // Simulate toggling the completion status
      const toggleButton = screen.getByText('Complete');
      fireEvent.click(toggleButton);
  
      // Assert the PUT request
      const putReq = httpMock.expectOne('http://127.0.0.1:8000/shopping-lists/1/items/1/');
      expect(putReq.request.method).toBe('PUT');
      putReq.flush({ ...item, completed: true });
  
      // Assert the item's status is updated
      await waitFor(() => {
        expect(screen.getByText('Undo')).toBeTruthy();
      });
    });
  });
  