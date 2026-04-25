import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskModal } from '../task-modal/task-modal';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TaskModal],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  encapsulation: ViewEncapsulation.None
})
export class Home implements OnInit {

  userName = '';

  constructor(
    private auth: AuthService,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.auth.userdetails().then((res: any) => {
      this.zone.run(() => {
        this.userName = res.user.name;
      });
    });
  }

  logout() {

    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout'
    }).then(result => {

      if (result.isConfirmed) {
        this.auth.logout().then(() => {
          this.zone.run(() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login';
          });
        }).catch(err => {
          console.error("Logout failed:", err);
          // Still redirect even if logout fails
          window.location.href = '/login';
        });
      }

    });
  }
}

