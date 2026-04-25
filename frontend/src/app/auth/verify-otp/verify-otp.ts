import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-otp.html',
  styleUrls: ['./verify-otp.css']
})

export class VerifyOtp {

  otp = ['', '', '', '', '', ''];
  email = localStorage.getItem('resetEmail');

  loading = false;
  loadingResend = false;

  errorMsg = '';
  successMsg = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

onOtpInput(event: any, index: number) {

  event.preventDefault();
  event.stopPropagation();

  const value = event.target.value;

  // allow only 1 digit
  if (!/^[0-9]$/.test(value)) {
    event.target.value = '';
    return;
  }

  // set only current box
  this.otp[index] = value;

  // move focus AFTER input completes
  setTimeout(() => {
    if (index < 5) {
      const next =
        event.target.parentElement.children[index + 1];
      next.focus();
      next.value = ''; // 🔥 VERY IMPORTANT
    }
  });
}


  onBackspace(event: any, index: number) {

  event.preventDefault();
  event.stopPropagation();

  if (this.otp[index]) {
    this.otp[index] = '';
    return;
  }

  if (index > 0) {
    const prev =
      event.target.parentElement.children[index - 1];
    prev.focus();
  }
}


  verifyOtp() {

    const finalOtp = this.otp.join('');

    if (finalOtp.length !== 6) {
      this.errorMsg = 'Enter complete OTP';
      return;
    }

    this.loading = true;
    this.auth.verifyOtp({
      email: this.email,
      otp: finalOtp
    })
    .then((res: any) => {
      this.loading = false;

      this.successMsg = res.message;
      localStorage.setItem('resetOtp', finalOtp);

      setTimeout(() => {
        this.router.navigate(['/reset-password']);
      }, 1200);

    })
    .catch((err: any) => {
      this.loading = false;
      this.errorMsg =
        err?.error?.error ||
        'Invalid or expired OTP';
    });
  }

  resendOtp() {
    this.loadingResend = true;
    this.auth.forgotPassword({ email: this.email })
      .then(() => {
        this.loadingResend = false;
        this.successMsg = 'OTP resent successfully';
      })
      .catch(() => {
        this.loadingResend = false;
        this.errorMsg = 'Failed to resend OTP';
      });
  }
}

