import {
    render,
    screen,
    fireEvent,
    waitFor,
    within,
} from '@testing-library/angular';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RegisterComponent } from '../../src/app/auth/register/register.component';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from '../../src/app/auth/login/login.component';
import { AuthService } from '../../src/app/services/auth.service';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';

describe('RegisterComponent (Integration)', () => {
    let httpMock: HttpTestingController;
    let mockRouter: Router;

    beforeEach(async () => {
        const navigateMock = jest.fn();

        await render(LoginComponent, {
            imports: [FormsModule, HttpClientTestingModule],
            providers: [
                { provide: Router, useValue: { navigate: navigateMock } },
                AuthService,
            ],
        });

        httpMock = TestBed.inject(HttpTestingController);
        mockRouter = TestBed.inject(Router);
    });

    it('should log in successfully and navigate to the shopping list page', async () => {
        const username = 'test@user';
        const password = 'testpassword';

        const usernameInput = screen.getByPlaceholderText('Email');
        const passwordInput = screen.getByPlaceholderText('Password');
        const loginButton = screen.getByRole('button', { name: 'Login' });

        fireEvent.input(usernameInput, { target: { value: username } });
        fireEvent.input(passwordInput, { target: { value: password } });
        fireEvent.click(loginButton);

        // Assert the POST request
        const req = httpMock.expectOne('http://127.0.0.1:8000/login/');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ username, password });

        // Mock successful login response
        req.flush({ access_token: 'mock-token', token_type: 'bearer' });

        // Assert local storage and navigation
        await waitFor(() => {
            expect(localStorage.getItem('access_token')).toBe('mock-token');
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/list']);
        });
    });

    it('should show an error message for invalid credentials', async () => {
        const username = 'test@user';
        const password = 'testpassword';

        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

        const usernameInput = screen.getByPlaceholderText('Email');
        const passwordInput = screen.getByPlaceholderText('Password');
        const loginButton = screen.getByRole('button', { name: 'Login' });

        fireEvent.input(usernameInput, { target: { value: username } });
        fireEvent.input(passwordInput, { target: { value: password } });
        fireEvent.click(loginButton);

        // Assert the POST request and mock error response
        const req = httpMock.expectOne('http://127.0.0.1:8000/login/');
        expect(req.request.method).toBe('POST');
        req.flush({ detail: 'Invalid username or password' }, { status: 401, statusText: 'Unauthorized' });

        // Assert the error message
        expect(alertMock).toHaveBeenCalledWith('Invalid username or password');
        alertMock.mockRestore();
    });
});