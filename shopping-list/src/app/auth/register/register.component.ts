import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  constructor(private router: Router) {}

  onRegister(email: string, password: string, event: Event): void {
    event.preventDefault();

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! You can now log in.');
    this.router.navigate(['/auth/login']);
  }
}
