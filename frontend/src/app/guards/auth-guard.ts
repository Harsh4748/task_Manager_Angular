import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async canActivate(): Promise<boolean> {
    try {
      // ✅ Real-time backend session check
      await this.authService.userdetails();
      return true;
    } catch (error) {
      console.error("AuthGuard: Session invalid or expired", error);
      this.router.navigate(['/login']);
      return false;
    }
  }
}
