import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {

  api = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getCategories() {
    return firstValueFrom(
      this.http.get(`${this.api}/list`, {
        withCredentials: true
      })
    );
  }

  addCategory(name: string) {
    return firstValueFrom(
      this.http.post(`${this.api}/add`, { name }, {
        withCredentials: true
      })
    );
  }

}
