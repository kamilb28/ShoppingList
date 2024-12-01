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

        await render(RegisterComponent, {
            imports: [FormsModule, HttpClientTestingModule],
            providers: [
                { provide: Router, useValue: { navigate: navigateMock } },
                AuthService,
            ],
        });

        httpMock = TestBed.inject(HttpTestingController);
        mockRouter = TestBed.inject(Router);
    });

    it('should register a user successfully', async () => {
        const username = 'test@user';
        const password = 'testpassword';

        // Simulate user input
        const usernameInput = screen.getByPlaceholderText('Email');
        const passwordInput = screen.getByPlaceholderText('Password');
        const registerButton = screen.getByRole('button', { name: 'Register' });

        fireEvent.input(usernameInput, { target: { value: username } });
        fireEvent.input(passwordInput, { target: { value: password } });
        fireEvent.click(registerButton);

        // Assert the POST request
        const req = httpMock.expectOne('http://127.0.0.1:8000/register/');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ username, password });
        req.flush({}, { status: 201, statusText: 'Created' });

        // Assert the success
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should show an error message if the username is already taken', async () => {
        const username = 'test@user';
        const password = 'testpassword';

        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

        // Simulate user input
        const usernameInput = screen.getByPlaceholderText('Email');
        const passwordInput = screen.getByPlaceholderText('Password');
        const registerButton = screen.getByRole('button', { name: 'Register' });

        fireEvent.input(usernameInput, { target: { value: username } });
        fireEvent.input(passwordInput, { target: { value: password } });
        fireEvent.click(registerButton);

        // Assert the POST request and mock error response
        const req = httpMock.expectOne('http://127.0.0.1:8000/register/');
        expect(req.request.method).toBe('POST');
        req.flush({ detail: 'Username already registered' }, { status: 409, statusText: 'Conflict' });

        // Assert the error message
        expect(alertMock).toHaveBeenCalledWith('Registration failed');
        alertMock.mockRestore();
    });
});

