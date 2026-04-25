import { Routes } from '@angular/router';

import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { VerifyOtp } from './auth/verify-otp/verify-otp';
import { ResetPassword } from './auth/reset-password/reset-password';

import { Home } from './dashboard/home/home';
import { AuthGuard } from './guards/auth-guard';
export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'signup', component: Signup },

  { path: 'forgot-password', component: ForgotPassword },
  { path: 'verify-otp', component: VerifyOtp },
  { path: 'reset-password', component: ResetPassword },

  {
    path: 'dashboard',
    component: Home,
    canActivate: [AuthGuard]
  }

];
