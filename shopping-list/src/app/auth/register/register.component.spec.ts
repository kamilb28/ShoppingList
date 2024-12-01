import { render, screen, fireEvent, waitFor } from '@testing-library/angular';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let mockAuthService: Partial<AuthService>;
  let mockRouter: Partial<Router>;

  beforeEach(() => {
    mockAuthService = {
      register: jest.fn(),
    };
    mockRouter = {
      navigate: jest.fn(),
    };
  });

  it('should create the component', async () => {
    const { fixture } = await render(RegisterComponent, {
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call AuthService register method on form submit', async () => {
    const registerSpy = jest.spyOn(mockAuthService, 'register').mockReturnValue(of(null));

    await render(RegisterComponent, {
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Register' });

    fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(registerSpy).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should navigate to login on successful registration', async () => {
    jest.spyOn(mockAuthService, 'register').mockReturnValue(of(null));
    const navigateSpy = jest.spyOn(mockRouter, 'navigate');

    await render(RegisterComponent, {
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Register' });

    fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  it('should show an alert on registration failure', async () => {
    jest.spyOn(mockAuthService, 'register').mockReturnValue(throwError(() => new Error('Registration failed')));
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    await render(RegisterComponent, {
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Register' });

    fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Registration failed');
    });
  });
});
