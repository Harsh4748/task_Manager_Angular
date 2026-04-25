import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [FormsModule, RouterLink, CommonModule]   // ✅ VERY IMPORTANT
})

export class Login {

  email = '';
  password = '';
  showPassword = false;
  submitted = false;
  emailError = '';
  passwordError = '';
  loginError = '';


  constructor(
    private auth: AuthService,
    private router: Router,
    private zone: NgZone
  ) { }

login() {

  this.submitted = true;
  this.emailError = '';
  this.passwordError = '';
  this.loginError = '';

  if (!this.email || !this.password) return;

  this.auth.login({
    email: this.email,
    password: this.password
  })
  .then(() => {
    this.router.navigate(['/dashboard']); // ✅ WORKS
  })
  .catch(err => {

    const message =
      err?.error?.error ||
      err?.error?.message ||
      'Invalid login credentials';

    if (message === 'User not found') {
      this.emailError = message;
    }
    else if (message === 'Invalid email or password') {
      this.passwordError = message;
    }
    else {
      this.loginError = message;
    }

  });
}
}
