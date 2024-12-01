import { render, screen, fireEvent, waitFor } from '@testing-library/angular';
import { ListComponent } from './list.component';
import { ShoppingService } from '../services/shopping-list.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('ShoppingListComponent', () => {
  let mockShoppingService = {
    getShoppingLists: jest.fn().mockReturnValue(of([])),
    createShoppingList: jest.fn(),
  };

  beforeEach(() => {
    mockShoppingService = {
      getShoppingLists: jest.fn().mockReturnValue(of([])),
      createShoppingList: jest.fn(),
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
      { id: 1, name: 'Groceries', due_date: '2024-12-31' },
      { id: 2, name: 'Electronics', due_date: '2024-11-30' },
    ];
    mockShoppingService.getShoppingLists.mockReturnValue(of(mockLists));

    await render(ListComponent, {
      imports: [FormsModule],
      providers: [{ provide: ShoppingService, useValue: mockShoppingService }],
    });

    expect(mockShoppingService.getShoppingLists).toHaveBeenCalled();

    for (let list of mockLists) {
      expect(screen.getByText(list.name)).toBeTruthy();
    }
  });

  it('should display an error message if fetching lists fails', async () => {
    mockShoppingService.getShoppingLists.mockReturnValue(
      throwError(() => new Error('Error fetching lists'))
    );

    await render(ListComponent, {
      imports: [FormsModule],
      providers: [{ provide: ShoppingService, useValue: mockShoppingService }],
    });

    expect(mockShoppingService.getShoppingLists).toHaveBeenCalled();
    expect(
      screen.getByText('An error occurred: Error: Error fetching lists')
    ).toBeTruthy();
  });

  it('should add a new shopping list when the user submits the form', async () => {
    const newList = { id: 3, name: 'Party Supplies', due_date: '2024-10-10' };
    mockShoppingService.getShoppingLists.mockReturnValue(of([]));
    mockShoppingService.createShoppingList.mockReturnValue(of(newList));

    await render(ListComponent, {
      imports: [FormsModule],
      providers: [{ provide: ShoppingService, useValue: mockShoppingService }],
    });

    const nameInput = screen.getByPlaceholderText('List Name');
    const dateInput = screen.getByPlaceholderText('Due Date');
    const submitButton = screen.getByText('Add List');

    fireEvent.input(nameInput, { target: { value: newList.name } });
    fireEvent.input(dateInput, { target: { value: newList.due_date } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockShoppingService.createShoppingList).toHaveBeenCalledWith({
        name: newList.name,
        due_date: newList.due_date,
      });

      expect(screen.getByText(newList.name)).toBeTruthy();
    });
  });
});

