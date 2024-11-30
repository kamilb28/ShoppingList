import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [RouterModule],
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
}

