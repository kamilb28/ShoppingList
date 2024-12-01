import { render, screen, fireEvent, waitFor } from '@testing-library/angular';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

class DummyComponent {}

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

  const renderLoginComponent = async () => {
    return await render(LoginComponent, {
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  };

  it('should create the component', async () => {
    const { fixture } = await renderLoginComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call AuthService login method on form submit', async () => {
    const loginSpy = jest.spyOn(mockAuthService, 'login').mockReturnValue(of({ access_token: 'test-token' }));

    await renderLoginComponent();

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
    jest.spyOn(mockAuthService, 'login').mockReturnValue(of({ 'access_token': 'test-token' }));
    const navigateSpy = jest.spyOn(mockRouter, 'navigate');
    const localStorageMock = jest.spyOn(Storage.prototype, 'setItem');

    await renderLoginComponent();

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorageMock).toHaveBeenCalledWith('access_token', 'test-token');
      expect(navigateSpy).toHaveBeenCalledWith(['/list']);
    });
  });

  it('should show an alert on login failure', async () => {
    jest.spyOn(mockAuthService, 'login').mockReturnValue(throwError(() => new Error('Invalid username or password')));
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    await renderLoginComponent();

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

    await renderLoginComponent();

    const registerButton = screen.getByRole('button', { name: 'Register' });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith(['/auth/register']);
    });
  });
});


