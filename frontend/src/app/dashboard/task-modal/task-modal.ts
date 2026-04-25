import { Component, OnInit, NgZone, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { ThemeService } from '../../services/theme.service';
import { SocketService } from '../../services/socket.service';
import { TaskChart } from '../task-chart/task-chart';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskChart],
  templateUrl: './task-modal.html',
  styleUrls: ['./task-modal.css'],
  encapsulation: ViewEncapsulation.None
})
export class TaskModal implements OnInit {

  taskName = '';
  assignedTo = '';
  category = '';
  date = '';
  currentUserId: string = '';
  activeTab: 'assignedByMe' | 'assignedToMe' = 'assignedByMe';
  loading = false;

  // popups
  showFilterPopup = false;
  showEditPopup = false;

  // ✅ EDIT POPUP MODEL
  editTask: any = null;

  // filters
  searchText = '';
  filterCategory = '';
  filterStatus = '';
  filterSingleDate = '';
  filterFromDate = '';
  filterToDate = '';

  filteredTasks: any[] = [];
  tasks: any[] = [];
  users: any[] = [];

  submitted = false;
  submittedAdd = false;
  submittedEdit = false;
  loadingAdd = false;
  loadingEdit = false;
  loadingCategory = false;
  newCategoryName = '';
  showAddCategory = false;
  pageSize = 10;
  currentPage = 1;
today = new Date().toISOString().split('T')[0];


  categories: any[] = [];

  get totalPages(): number {
    return Math.ceil(this.filteredTasks.length / this.pageSize);
  }


  get paginatedTasks() {

    const start =
      (this.currentPage - 1) * this.pageSize;

    const end =
      start + this.pageSize;

    return this.filteredTasks.slice(start, end);
  }

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private categoryService: CategoryService,
    public theme: ThemeService,
    private socketService: SocketService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef 
  ) { }

  ngOnInit() {
    this.fetchCurrentUser();
    this.loadTasks();
    this.loadUsers();
    this.loadCategories();
    this.setupSocket();
  }

  setupSocket() {
    this.socketService.onTaskUpdated().subscribe(() => {
      this.zone.run(() => {
        this.loadTasks(); // Refresh list on any change
      });
    });

    // ✅ Real-time category sync — when any user adds a category, all users see it
    this.socketService.onCategoryUpdated().subscribe(() => {
      this.zone.run(() => {
        this.loadCategories();
      });
    });
  }

  fetchCurrentUser() {
    this.authService.userdetails().then((res: any) => {
      this.zone.run(() => {
        this.currentUserId = res.user.id;
      });
    });
  }

  loadTasks() {
    this.loading = true;
    console.time('LoadTasks');
    this.taskService.getTasks().then((res: any) => {
      this.zone.run(() => {
        this.loading = false;
        console.timeEnd('LoadTasks');
        this.tasks = res;
        this.applyFilter(false); 
        this.cdr.detectChanges(); // ✅ Force UI refresh
      });
    }).catch(err => {
      this.loading = false;
      console.timeEnd('LoadTasks');
      console.error("Load tasks failed:", err);
    });
  }


  loadUsers() {
  this.authService.getAllUsers().then((res: any) => {
    this.zone.run(() => {
      this.users = res;
    });
  });
}

  loadCategories() {
    this.categoryService.getCategories().then((res: any) => {
      this.zone.run(() => {
        this.categories = res.map((c: any) => c.name);
        
        // If empty, add some defaults optionally or just leave empty
        if (this.categories.length === 0) {
           this.categories = ['Work', 'Personal', 'Study', 'Urgent'];
        }
      });
    });
  }

  addCategory() {
    if (!this.newCategoryName.trim()) return;

    const addedName = this.newCategoryName.trim(); // ✅ Save name before clearing
    this.loadingCategory = true;
    this.categoryService.addCategory(addedName).then((res: any) => {
      this.zone.run(() => {
        this.loadingCategory = false;
        this.newCategoryName = '';
        this.showAddCategory = false;

        // ✅ Refresh categories and auto-select the new one
        this.categoryService.getCategories().then((catRes: any) => {
          this.zone.run(() => {
            this.categories = catRes.map((c: any) => c.name);
            if (this.categories.length === 0) {
              this.categories = ['Work', 'Personal', 'Study', 'Urgent'];
            }
            this.category = addedName; // ✅ Auto-select newly added category
            this.cdr.detectChanges();
          });
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Category Added',
          timer: 1000,
          showConfirmButton: false
        });
      });
    }).catch(err => {
      this.loadingCategory = false;
      Swal.fire('Error', err.error?.message || 'Failed to add category', 'error');
    });
  }


  saveTask() {

    // ======================
    // ✏️ EDIT MODE
    // ======================
    // if (this.editTask) {

    //   this.submittedEdit = true;

    //   if (
    //     !this.editTask.taskName ||
    //     !this.editTask.assignedTo ||
    //     !this.editTask.category ||
    //     !this.editTask.date
    //   ) {
    //     return;
    //   }

    //   const data = {
    //     taskName: this.editTask.taskName,
    //     assignedTo: this.editTask.assignedTo,
    //     category: this.editTask.category,
    //     date: this.editTask.date
    //   };

    //   this.taskService.updateTask(this.editTask._id, data).then(() => {

    //     this.zone.run(() => {

    //       // ✅ SHOW SUCCESS POPUP
    //       Swal.fire({
    //         icon: 'success',
    //         title: 'Updated',
    //         text: 'Task updated successfully',
    //         timer: 1200,
    //         showConfirmButton: false
    //       }).then(() => {

    //         // ✅ AUTO CLOSE EDIT POPUP AFTER ALERT
    //         this.showEditPopup = false;
    //         this.editTask = null;
    //         this.submittedEdit = false;

    //         this.loadTasks();
    //       });

    //     });

    //   });

    //   return;
    // }


    // ==========================
    // ➕ ADD MODE
    // ==========================
    this.submittedAdd = true;

    if (
      !this.taskName ||
      !this.assignedTo ||
      !this.category ||
      !this.date
    ) {
      return;
    }

    const data = {
      taskName: this.taskName,
      assignedTo: this.assignedTo,
      category: this.category,
      date: this.date
    };

    this.loadingAdd = true;
    console.time('AddTask');
    this.taskService.addTask(data).then(() => {
      this.zone.run(() => {
        console.timeEnd('AddTask');
        // ✅ SUCCESS! Clear flags immediately
        this.loadingAdd = false;
        this.submittedAdd = false;
        this.reset();
        this.currentPage = 1;

        // ✅ REFRESH LIST NOW
        this.loadTasks();

        // ✅ SHOW ALERT (Background)
        Swal.fire({
          icon: 'success',
          title: 'Task Added',
          timer: 1200,
          showConfirmButton: false
        });

        this.cdr.detectChanges(); // ✅ Force update
      });
    }).catch(err => {
      this.zone.run(() => {
        console.timeEnd('AddTask');
        this.loadingAdd = false;
        console.error("Error adding task:", err);
        Swal.fire('Error', 'Could not add task', 'error');
        this.cdr.detectChanges();
      });
    });
  }

  updateTask() {

    this.submittedEdit = true;

    if (
      !this.editTask?.taskName ||
      !this.editTask?.assignedTo ||
      !this.editTask?.category ||
      !this.editTask?.date
    ) {
      return;
    }

    const data = {
      taskName: this.editTask.taskName,
      assignedTo: this.editTask.assignedTo,
      category: this.editTask.category,
      date: this.editTask.date
    };

    this.loadingEdit = true;
    console.time('UpdateTask');
    this.taskService.updateTask(this.editTask._id, data).then(() => {
      this.zone.run(() => {
        console.timeEnd('UpdateTask');
        // ✅ SUCCESS! Clear flags immediately
        this.loadingEdit = false;
        this.showEditPopup = false;
        this.submittedEdit = false;

        // ✅ REFRESH LIST NOW
        this.loadTasks();

        // ✅ SHOW ALERT (Background)
        Swal.fire({
          icon: 'success',
          title: 'Updated',
          text: 'Task updated successfully',
          timer: 1200,
          showConfirmButton: false
        });

        // ✅ CLEAR FORM DATA WITH DELAY
        setTimeout(() => {
          this.editTask = null;
          this.cdr.detectChanges();
        }, 100);

        this.cdr.detectChanges(); // ✅ Force update
      });
    }).catch(err => {
      this.zone.run(() => {
        console.timeEnd('UpdateTask');
        this.loadingEdit = false;
        console.error("Error updating task:", err);
        Swal.fire('Error', 'Could not update task', 'error');
        this.cdr.detectChanges();
      });
    });
  }

  closeEditPopup() {
    this.showEditPopup = false;
    this.submittedEdit = false;

    // delay prevents ngModel error
    setTimeout(() => {
      this.editTask = null;
    }, 100);
  }

  edit(task: any) {

    this.editTask = {
      _id: task._id,
      taskName: task.taskName,
      assignedTo: task.assignedTo?._id,
      category: task.category,
      date: task.date.substring(0, 10)
    };

    this.showEditPopup = true;
  }

  logout() {

    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout'
    }).then((result) => {

      if (result.isConfirmed) {

        this.authService.logout().then(() => {
          this.zone.run(() => {
            // ✅ clear login data
            localStorage.clear();
            sessionStorage.clear();

            // ✅ redirect to login page
            window.location.href = '/login';
          });
        }).catch(err => {
          console.error("Logout failed:", err);
          window.location.href = '/login';
        });

      }

    });
  }


  delete(id: string) {
    Swal.fire({
      title: 'Delete task?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete'
    }).then(result => {
      if (result.isConfirmed) {
        console.time('DeleteTask');
        this.taskService.deleteTask(id).then(() => {
          this.zone.run(() => {
            console.timeEnd('DeleteTask');
            // ✅ REFRESH LIST NOW
            this.loadTasks();

            // ✅ Non-blocking alert
            Swal.fire({
              icon: 'success',
              title: 'Deleted',
              timer: 1000,
              showConfirmButton: false
            });

            this.cdr.detectChanges(); // ✅ Force Update
          });
        }).catch(err => {
          this.zone.run(() => {
            console.timeEnd('DeleteTask');
            console.error("Delete failed:", err);
            Swal.fire('Error', 'Could not delete task', 'error');
            this.cdr.detectChanges();
          });
        });
      }
    });
  }

  deleteAll() {
    Swal.fire({
      title: 'Delete all tasks?',
      text: 'This will remove all tasks you created.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Delete All'
    }).then(result => {
      if (result.isConfirmed) {
        console.time('DeleteAllTasks');
        this.taskService.deleteAll().then(() => {
          this.zone.run(() => {
            console.timeEnd('DeleteAllTasks');
            Swal.fire({
              icon: 'success',
              title: 'Deleted',
              text: 'All tasks removed',
              timer: 1200,
              showConfirmButton: false
            });
            this.loadTasks();
            this.cdr.detectChanges();
          });
        }).catch(err => {
          this.zone.run(() => {
            console.timeEnd('DeleteAllTasks');
            console.error("Delete All failed:", err);
            this.cdr.detectChanges();
          });
        });
      }
    });
  }

toggle(task: any) {
  console.time('ToggleTask');
  this.taskService.toggleComplete(task._id).then(() => {
    this.zone.run(() => {
      console.timeEnd('ToggleTask');
      this.loadTasks(); // ✅ Refresh list to ensure filters (like 'pending') are re-applied
      this.cdr.detectChanges();
    });
  }).catch(err => {
    console.timeEnd('ToggleTask');
    console.error("Toggle failed:", err);
    this.cdr.detectChanges();
  });
}


  // get filteredTasks() {
  //   return this.tasks.filter(task => {

  //     if (!this.showCompleted && task.completed)
  //       return false;

  //     if (
  //       this.filterCategory &&
  //       task.category !== this.filterCategory
  //     )
  //       return false;

  //     if (
  //       this.filterDate &&
  //       task.date.substring(0, 10) !== this.filterDate
  //     )
  //       return false;

  //     if (
  //       this.searchText &&
  //       !task.taskName
  //         .toLowerCase()
  //         .includes(this.searchText.toLowerCase())
  //     )
  //       return false;

  //     return true;
  //   });
  // }

  applyFilter(closePopup = true) {
    this.filteredTasks = this.tasks.filter(task => {
      // Tab filter
      if (this.activeTab === 'assignedByMe') {
        if (task.userId !== this.currentUserId) return false;
      } else {
        if (task.assignedTo?._id !== this.currentUserId) return false;
      }

      // category
      if (this.filterCategory && task.category !== this.filterCategory) {
        return false;
      }
      
      // status
      if (this.filterStatus === 'completed' && !task.completed) return false;
      if (this.filterStatus === 'pending' && task.completed) return false;

      // search
      if (this.searchText && !task.taskName.toLowerCase().includes(this.searchText.toLowerCase())) {
        return false;
      }

      // single date
      if (this.filterSingleDate) {
        const taskDate = task.date.substring(0, 10);
        if (taskDate !== this.filterSingleDate) return false;
      }

      // date range
      if (this.filterFromDate && this.filterToDate) {
        const taskDate = new Date(task.date);
        const from = new Date(this.filterFromDate);
        const to = new Date(this.filterToDate);
        if (taskDate < from || taskDate > to) return false;
      }
      return true;
    });

    // ✅ Adjust pagination if current page is now empty
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }

    if (closePopup) {
      this.showFilterPopup = false;
    }
  }

  resetFilter() {

    this.filterCategory = '';
    this.filterStatus = '';
    this.filterSingleDate = '';
    this.filterFromDate = '';
    this.filterToDate = '';

    this.filteredTasks = this.tasks;
    this.showFilterPopup = false;
  }

  reset() {
    this.taskName = '';
    this.assignedTo = '';
    this.category = '';
    this.date = '';
    this.editTask = null;
    this.submitted = false;
    this.showEditPopup = false;
  }

  refreshTasks() {
    this.resetFilter();
    this.reset(); // ✅ Clear Add Task form fields
    this.searchText = '';
    this.showAddCategory = false; // ✅ Hide add category input
    this.newCategoryName = ''; // ✅ Clear category input
    this.loadTasks();
    this.loadCategories(); // ✅ Refresh categories too

    Swal.fire({
      icon: 'success',
      title: 'Refreshed',
      text: 'Task list refreshed',
      timer: 1000,
      showConfirmButton: false
    });
  }

  changeTab(tab: 'assignedByMe' | 'assignedToMe') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.applyFilter(false);
  }

}
