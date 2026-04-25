import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(data: any) {
    return firstValueFrom(
      this.http.post(
        `${this.api}/login`,
        data,
        { withCredentials: true }
      )
    );
  }

  signup(data: any) {
    return firstValueFrom(
      this.http.post(
        `${this.api}/signup`,
        data,
        { withCredentials: true }
      )
    );
  }

  forgotPassword(data: any) {
  return firstValueFrom(
    this.http.post(
      `${this.api}/forgot-password`,
      data,
      { withCredentials: true }
    )
  );
}

verifyOtp(data: any) {
  return firstValueFrom(
    this.http.post(
      `${this.api}/verify-otp`,
      data,
      { withCredentials: true }
    )
  );
}

resetPassword(data: any) {
  return firstValueFrom(
    this.http.post(
      `${this.api}/reset-password`,
      data,
      { withCredentials: true }
    )
  );
}

userdetails() {
  return firstValueFrom(
    this.http.get(
      `${this.api}/userdetails`,
      { withCredentials: true }
    )
  );
}

  getAllUsers() {
    return firstValueFrom(
      this.http.get(`${this.api}/all-users`, {
        withCredentials: true
      })
    );
  }

  logout() {
    return firstValueFrom(
      this.http.post(
        `${this.api}/logout`,
        {},
        { withCredentials: true }
      )
    );
  }


}
