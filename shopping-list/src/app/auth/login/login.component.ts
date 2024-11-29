import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private router: Router) {}

  onLogin(email: string, password: string, event: Event): void {
    event.preventDefault();

    // Dummy logika do logowania
    if ((email === 'test@example.com' && password === 'password') || password === 'admin') {
      localStorage.setItem('user', JSON.stringify({ email }));
      this.router.navigate(['/list']);
    } else {
      alert('Invalid email or password');
    }
  }
}

