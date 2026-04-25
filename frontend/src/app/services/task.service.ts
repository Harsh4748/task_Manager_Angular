import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {

  api = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  addTask(data: any) {
    return firstValueFrom(
      this.http.post(`${this.api}/add`, data, {
        withCredentials: true
      })
    );
  }

  getTasks() {
    return firstValueFrom(
      this.http.get(`${this.api}/list`, {
        withCredentials: true
      })
    );
  }

  updateTask(id: string, data: any) {
    return firstValueFrom(
      this.http.put(`${this.api}/update/${id}`, data, {
        withCredentials: true
      })
    );
  }

  deleteTask(id: string) {
    return firstValueFrom(
      this.http.delete(`${this.api}/delete/${id}`, {
        withCredentials: true
      })
    );
  }

  deleteAll() {
    return firstValueFrom(
      this.http.delete(`${this.api}/delete-all`, {
        withCredentials: true
      })
    );
  }

  toggleComplete(id: string) {
  return firstValueFrom(
    this.http.patch(
      `${this.api}/toggle/${id}`,
      {},
      { withCredentials: true }
    )
  );
}

}
