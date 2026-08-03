import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Task, TaskFilters, TaskFormValue } from '../models/task.model';
import { TaskApiService } from './task-api.service';
import { computeTaskStats, filterTasks } from '../utils/task.utils';

@Injectable({ providedIn: 'root' })
export class TaskStateService {
  private readonly api = inject(TaskApiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _tasks = signal<Task[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _successMessage = signal<string | null>(null);
  private readonly _filters = signal<TaskFilters>({
    search: '',
    status: 'all',
    priority: 'all',
  });

  readonly tasks = this._tasks.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly successMessage = this._successMessage.asReadonly();
  readonly filters = this._filters.asReadonly();

  readonly filteredTasks = computed(() =>
    filterTasks(this._tasks(), this._filters())
  );

  readonly stats = computed(() => computeTaskStats(this._tasks()));

  loadTasks(): void {
    this._loading.set(true);
    this._error.set(null);

    this.api
      .getTasks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tasks) => {
          this._tasks.set(tasks);
          this._loading.set(false);
        },
        error: (err: Error) => {
          this._error.set(err.message || 'Failed to load tasks');
          this._loading.set(false);
        },
      });
  }

  createTask(data: TaskFormValue, onSuccess?: () => void): void {
    this._loading.set(true);
    this._error.set(null);

    this.api
      .createTask(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (task) => {
          this._tasks.update((tasks) => [...tasks, task]);
          this._loading.set(false);
          this._successMessage.set('Task created successfully');
          onSuccess?.();
        },
        error: (err: Error) => {
          this._error.set(err.message || 'Failed to create task');
          this._loading.set(false);
        },
      });
  }

  updateTask(id: string, data: TaskFormValue, onSuccess?: () => void): void {
    this._loading.set(true);
    this._error.set(null);

    this.api
      .updateTask(id, data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (task) => {
          this._tasks.update((tasks) =>
            tasks.map((t) => (t.id === id ? task : t))
          );
          this._loading.set(false);
          this._successMessage.set('Task updated successfully');
          onSuccess?.();
        },
        error: (err: Error) => {
          this._error.set(err.message || 'Failed to update task');
          this._loading.set(false);
        },
      });
  }

  deleteTask(id: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.api
      .deleteTask(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this._tasks.update((tasks) => tasks.filter((t) => t.id !== id));
          this._loading.set(false);
          this._successMessage.set('Task deleted successfully');
        },
        error: (err: Error) => {
          this._error.set(err.message || 'Failed to delete task');
          this._loading.set(false);
        },
      });
  }

  setFilters(filters: Partial<TaskFilters>): void {
    this._filters.update((current) => ({ ...current, ...filters }));
  }

  clearMessages(): void {
    this._error.set(null);
    this._successMessage.set(null);
  }
}
