import { render, screen, fireEvent, waitFor, within } from '@testing-library/angular';
import { ListComponent } from './list.component';
import { ShoppingService } from '../services/shopping-list.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('ListComponent', () => {
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
});

