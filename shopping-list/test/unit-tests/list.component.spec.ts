import { render, screen, fireEvent, waitFor, within } from '@testing-library/angular';
import { ListComponent } from '../../src/app/list/list.component';
import { ShoppingService } from '../../src/app/services/shopping-list.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

describe('ListComponent', () => {
  let mockShoppingService = {
    getShoppingLists: jest.fn().mockReturnValue(of([])),
    createShoppingList: jest.fn(),
    addItemToList: jest.fn(),
    toggleItemCompletion: jest.fn(),
    deleteShoppingList: jest.fn(),
  };

  beforeEach(() => {
    mockShoppingService = {
      getShoppingLists: jest.fn().mockReturnValue(of([])),
      createShoppingList: jest.fn(),
      addItemToList: jest.fn(),
      toggleItemCompletion: jest.fn(),
      deleteShoppingList: jest.fn(),
    };
  });

  it('should create the component', async () => {
    const { fixture } = await render(ListComponent, {
      imports: [FormsModule],
      providers: [{ provide: ShoppingService, useValue: mockShoppingService }],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should fetch and display shopping lists on initialization', async () => {
    const mockLists = [
      { id: 1, name: 'Groceries', due_date: '2024-12-31', items: [] },
      { id: 2, name: 'Electronics', due_date: '2024-11-30', items: [] },
    ];
    mockShoppingService.getShoppingLists.mockReturnValue(of(mockLists));

  await render(ListComponent, {
    imports: [FormsModule],
    providers: [{ provide: ShoppingService, useValue: mockShoppingService }],
  });

  await waitFor(() => {
    expect(mockShoppingService.getShoppingLists).toHaveBeenCalled();

    const shoppingLists = screen.getAllByTestId('shoppingLists');
    expect(shoppingLists.length).toBe(mockLists.length);

    mockLists.forEach((list, index) => {
      const shoppingListDiv = shoppingLists[index];
      const h3 = within(shoppingListDiv).getByText(
        `${list.name} (Due: ${list.due_date})`
      );
      expect(h3).toBeTruthy();
    });
  });
  });

  it('should add a new shopping list when the user submits the form', async () => {
    const newList = { id: 3, name: 'Party Supplies', due_date: '2024-10-10' };
    mockShoppingService.getShoppingLists.mockReturnValue(of([]));
    mockShoppingService.createShoppingList.mockReturnValue(of(newList));

    await render(ListComponent, {
      imports: [FormsModule],
      providers: [{ provide: ShoppingService, useValue: mockShoppingService }],
    });

    const nameInput = screen.getByPlaceholderText('Enter List Name');
    const dateInput = screen.getByTestId('due-date-input');
    const submitButton = screen.getByText('Add List');

    fireEvent.input(nameInput, { target: { value: newList.name } });
    fireEvent.input(dateInput, { target: { value: newList.due_date } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockShoppingService.createShoppingList).toHaveBeenCalledWith({
        name: newList.name,
        due_date: newList.due_date,
      });

      const shoppingLists = screen.getAllByTestId('shoppingLists');
      expect(shoppingLists.length).toBe(1);

      const shoppingListDiv = shoppingLists[0];
      const h3 = within(shoppingListDiv).getByText(
        `${newList.name} (Due: ${newList.due_date})`
      );
      expect(h3).toBeTruthy()
    });
  });

  it('should add a new item to a shopping list when the user submits the form', async () => {
    const mockList = { id: 1, name: 'Groceries', due_date: '2024-12-31', items: [] };
    const newItem = { id: 101, name: 'Milk', quantity: 2, unit: 'liters', completed: false };
  
    mockShoppingService.getShoppingLists.mockReturnValue(of([mockList]));
    mockShoppingService.addItemToList = jest.fn().mockReturnValue(of(newItem));
  
    await render(ListComponent, {
      imports: [FormsModule],
      providers: [{ provide: ShoppingService, useValue: mockShoppingService }],
    });
  
    const shoppingList = screen.getAllByTestId('shoppingLists')[0];
  
    const nameInput = within(shoppingList).getByPlaceholderText('Item Name');
    const quantityInput = within(shoppingList).getByPlaceholderText('Quantity');
    const unitInput = within(shoppingList).getByPlaceholderText('Unit (e.g. kg, szt)');
    const submitButton = within(shoppingList).getByText('Add Item');
  
    fireEvent.input(nameInput, { target: { value: newItem.name } });
    fireEvent.input(quantityInput, { target: { value: newItem.quantity.toString() } });
    fireEvent.input(unitInput, { target: { value: newItem.unit } });
  
    fireEvent.click(submitButton);
  
    await waitFor(() => {
      expect(mockShoppingService.addItemToList).toHaveBeenCalledWith(mockList.id, {
        name: newItem.name,
        quantity: newItem.quantity,
        unit: newItem.unit,
      });
  
      const items = within(shoppingList).getAllByText(newItem.name + " - " + newItem.quantity + " " + newItem.unit);
      expect(items.length).toBe(1);
    });
  });
  
  it('should toggle the completed status of an item', async () => {
    const mockList = {
      id: 1,
      name: 'Groceries',
      due_date: '2024-12-31',
      items: [{ id: 101, name: 'Milk', quantity: 2, unit: 'liters', completed: false }],
    };
    const updatedItem = { ...mockList.items[0], completed: true };
  
    mockShoppingService.getShoppingLists.mockReturnValue(of([mockList]));
    mockShoppingService.toggleItemCompletion = jest.fn().mockReturnValue(of(updatedItem));
  
    await render(ListComponent, {
      imports: [FormsModule],
      providers: [{ provide: ShoppingService, useValue: mockShoppingService }],
    });
  
    const shoppingList = screen.getAllByTestId('shoppingLists')[0];
    const toggleButton = within(shoppingList).getByText('Complete');
  
    fireEvent.click(toggleButton);
  
    await waitFor(() => {
      expect(mockShoppingService.toggleItemCompletion).toHaveBeenCalledWith(mockList.id, updatedItem.id);
  
      const updatedButton = within(shoppingList).getByText('Undo');
      expect(updatedButton).toBeTruthy();
    });
  });

  it('should delete a shopping list when the delete button is clicked', async () => {
    const mockLists = [
      { id: 1, name: 'Groceries', due_date: '2024-12-31', items: [] },
      { id: 2, name: 'Electronics', due_date: '2024-11-30', items: [] },
    ];
  
    mockShoppingService.getShoppingLists.mockReturnValue(of(mockLists));
    mockShoppingService.deleteShoppingList = jest.fn().mockReturnValue(of(null));
  
    await render(ListComponent, {
      imports: [FormsModule],
      providers: [{ provide: ShoppingService, useValue: mockShoppingService }],
    });
  
    const shoppingList = screen.getAllByTestId('shoppingLists')[0];
    const deleteButton = within(shoppingList).getByText('Delete List');
  
    fireEvent.click(deleteButton);
  
    await waitFor(() => {
      expect(mockShoppingService.deleteShoppingList).toHaveBeenCalledWith(mockLists[0].id);
  
      const remainingLists = screen.getAllByTestId('shoppingLists');
      expect(remainingLists.length).toBe(1);
    });
  });
  
  it('should log out the user and navigate to the login page', async () => {
    const mockRouter = {
      navigate: jest.fn(),
    };
  
    await render(ListComponent, {
      imports: [FormsModule],
      providers: [
        { provide: ShoppingService, useValue: mockShoppingService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
  
    await waitFor(() => {
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  it('should redirect to login on unauthorized error during initialization', async () => {
    const mockRouter = {
      navigate: jest.fn(),
    };
  
    mockShoppingService.getShoppingLists.mockReturnValue(
      throwError(() => ({ status: 401 }))
    );
  
    await render(ListComponent, {
      imports: [FormsModule],
      providers: [
        { provide: ShoppingService, useValue: mockShoppingService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  
    await waitFor(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });
});

