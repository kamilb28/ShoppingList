import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensures no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call the register API with the correct data', () => {
    const mockResponse = { message: 'User registered successfully' };
    const username = 'testuser';
    const password = 'password123';

    service.register(username, password).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://127.0.0.1:8000/register/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username, password });

    req.flush(mockResponse);
  });

  it('should call the login API with the correct data', () => {
    const mockResponse = { access_token: 'test-token' };
    const username = 'testuser';
    const password = 'password123';

    service.login(username, password).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://127.0.0.1:8000/login/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username, password });

    req.flush(mockResponse);
  });

  it('should return the access token from localStorage', () => {
    const token = 'test-token';
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(token);

    const result = service.getToken();
    expect(result).toBe(token);
    expect(Storage.prototype.getItem).toHaveBeenCalledWith('access_token');
  });

  it('should return true if the user is logged in', () => {
    jest.spyOn(service, 'getToken').mockReturnValue('test-token');

    const result = service.isLoggedIn();
    expect(result).toBe(true);
  });

  it('should return false if the user is not logged in', () => {
    jest.spyOn(service, 'getToken').mockReturnValue(null);

    const result = service.isLoggedIn();
    expect(result).toBe(false);
  });

  it('should remove the access token from localStorage on logout', () => {
    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

    service.logout();

    expect(removeItemSpy).toHaveBeenCalledWith('access_token');
  });
});
