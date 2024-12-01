import { render, screen, fireEvent, waitFor } from '@testing-library/angular';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let mockAuthService: Partial<AuthService>;
  let mockRouter: Partial<Router>;

  beforeEach(() => {
    mockAuthService = {
      login: jest.fn(),
    };
    mockRouter = {
      navigate: jest.fn(),
    };
  });

  it('should create the component', async () => {
    const { fixture } = await render(LoginComponent, {
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call AuthService login method on form submit', async () => {
    const loginSpy = jest.spyOn(mockAuthService, 'login').mockReturnValue(of({ access_token: 'test-token' }));

    await render(LoginComponent, {
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should store access token and navigate to list on successful login', async () => {
    jest.spyOn(mockAuthService, 'login').mockReturnValue(of({ access_token: 'test-token' }));
    const navigateSpy = jest.spyOn(mockRouter, 'navigate');
    const localStorageSpy = jest.spyOn(localStorage, 'setItem');

    await render(LoginComponent, {
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorageSpy).toHaveBeenCalledWith('access_token', 'test-token');
      expect(navigateSpy).toHaveBeenCalledWith(['/list']);
    });
  });

  it('should show an alert on login failure', async () => {
    jest.spyOn(mockAuthService, 'login').mockReturnValue(throwError(() => new Error('Invalid username or password')));
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    await render(LoginComponent, {
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.input(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.input(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Invalid username or password');
    });
  });

  it('should navigate to register page when Register button is clicked', async () => {
    const navigateSpy = jest.spyOn(mockRouter, 'navigate');

    await render(LoginComponent, {
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    const registerButton = screen.getByRole('button', { name: 'Register' });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith(['/auth/register']);
    });
  });
});

