import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router,RouterModule  } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule,RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword {

  email = '';
  submitted = false;
  loading = false;

  successMsg = '';
  errorMsg = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  sendOtp() {

    this.submitted = true;
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.email) return;

    this.loading = true;
    this.auth.forgotPassword({ email: this.email })
      .then((res: any) => {
        this.loading = false;

        this.successMsg = res.message;

        // store email for next step
        localStorage.setItem('resetEmail', this.email);

        setTimeout(() => {
          this.router.navigate(['/verify-otp']);
        }, 1500);

      })
      .catch(err => {
        this.loading = false;
        this.errorMsg =
          err?.error?.error ||
          'Email not registered';
      });
  }
}
