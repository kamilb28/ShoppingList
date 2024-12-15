import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) {}

  onLogin(username: string, password: string, event: Event): void {
    event.preventDefault();
    this.authService.login(username, password).subscribe({
      next: (response) => {
        localStorage.setItem('access_token', response.access_token);
        this.router.navigate(['/list']);
      },
      error: (err) => {
        alert('Invalid username or password');
        console.error(err);
      },
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}

