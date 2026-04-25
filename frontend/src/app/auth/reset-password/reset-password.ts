import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPassword {

  password = '';
  confirmPassword = '';

  submitted = false;
  loading = false;

  errorMsg = '';
  successMsg = '';

  email = localStorage.getItem('resetEmail');
  otp = localStorage.getItem('resetOtp');

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  resetPassword() {

    this.submitted = true;
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.password || !this.confirmPassword) return;

    if (this.password.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.auth.resetPassword({
      email: this.email,
      password: this.password,
      otp: this.otp
    })
    .then((res: any) => {
      this.loading = false;
      this.successMsg = res.message;

      localStorage.removeItem('resetEmail');
      localStorage.removeItem('resetOtp');

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);

    })
    .catch((err: any) => {
      this.loading = false;
      this.errorMsg =
        err?.error?.error ||
        'Failed to reset password';
    });
  }
}
