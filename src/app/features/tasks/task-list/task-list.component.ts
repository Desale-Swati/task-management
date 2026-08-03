import { TitleCasePipe } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TaskStateService } from '../../../core/services/task-state.service';
import { Task, TaskPriority, TaskStatus } from '../../../core/models/task.model';
import { isOverdue } from '../../../core/utils/task.utils';
import { DashboardSummaryComponent } from '../../dashboard/dashboard-summary.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [FormsModule, RouterLink, TitleCasePipe, DashboardSummaryComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent {
  private readonly state = inject(TaskStateService);

  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly successMessage = this.state.successMessage;
  readonly filteredTasks = this.state.filteredTasks;
  readonly filters = this.state.filters;

  readonly statusOptions: (TaskStatus | 'all')[] = ['all', 'todo', 'in-progress', 'completed'];
  readonly priorityOptions: (TaskPriority | 'all')[] = ['all', 'low', 'medium', 'high'];

  showError = false;
  showSuccess = false;
  errorText = '';
  successText = '';
  taskToDelete: Task | null = null;

  constructor() {
    this.state.loadTasks();

    effect(() => {
      const error = this.error();
      if (error) {
        this.errorText = error;
        this.showError = true;
        this.state.clearMessages();
        setTimeout(() => (this.showError = false), 5000);
      }
    });

    effect(() => {
      const success = this.successMessage();
      if (success) {
        this.successText = success;
        this.showSuccess = true;
        this.state.clearMessages();
        setTimeout(() => (this.showSuccess = false), 3000);
      }
    });
  }

  isOverdue = isOverdue;

  onSearchChange(value: string): void {
    this.state.setFilters({ search: value });
  }

  onStatusChange(value: TaskStatus | 'all'): void {
    this.state.setFilters({ status: value });
  }

  onPriorityChange(value: TaskPriority | 'all'): void {
    this.state.setFilters({ priority: value });
  }

  confirmDelete(task: Task): void {
    this.taskToDelete = task;
  }

  cancelDelete(): void {
    this.taskToDelete = null;
  }

  deleteTask(): void {
    if (this.taskToDelete) {
      this.state.deleteTask(this.taskToDelete.id);
      this.taskToDelete = null;
    }
  }

  dismissAlert(): void {
    this.showError = false;
    this.showSuccess = false;
  }

  formatStatus(status: string): string {
    return status.replace('-', ' ');
  }

  getStatusBadgeClass(status: TaskStatus): string {
    const map: Record<TaskStatus, string> = {
      todo: 'bg-secondary',
      'in-progress': 'bg-primary',
      completed: 'bg-success',
    };
    return map[status];
  }

  getPriorityBadgeClass(priority: TaskPriority): string {
    const map: Record<TaskPriority, string> = {
      low: 'bg-success-subtle text-success',
      medium: 'bg-warning-subtle text-warning-emphasis',
      high: 'bg-danger-subtle text-danger',
    };
    return map[priority];
  }
}
