import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
  imports: [
    FormsModule,
    RouterLink,
    CommonModule
  ]
})
export class Signup {

  name = '';
  email = '';
  password = '';
  showPassword = false;

  submitted = false;
  signupError = '';
  showSuccessPopup = false;
  isLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  signup() {

    this.submitted = true;
    this.signupError = '';

    // frontend validation
    if (!this.name || !this.email || !this.password) {
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (!emailRegex.test(this.email) || !passwordRegex.test(this.password)) {
      return;
    }

    this.isLoading = true;

    this.auth.signup({
      name: this.name,
      email: this.email,
      password: this.password
    })
    .then(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
      this.showSuccessPopup = true;
       setTimeout(() => {
    this.goToLogin();
  }, 5000);
    })
    .catch(err => {
      this.isLoading = false;
      this.cdr.detectChanges();
      // ✅ BACKEND ERROR HANDLING
      const errorMessage =
        typeof err?.error === 'string'
          ? err.error
          : err?.error?.error || err?.error?.message || 'Signup failed';

      this.signupError = errorMessage;
      
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: errorMessage,
        confirmButtonColor: '#9333ea',
      });
    });
  }
    goToLogin() {
    this.showSuccessPopup = false;
    this.router.navigate(['/login']);
  }
}


