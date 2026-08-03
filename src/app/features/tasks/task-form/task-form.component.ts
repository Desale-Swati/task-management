import { TitleCasePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskApiService } from '../../../core/services/task-api.service';
import { TaskStateService } from '../../../core/services/task-state.service';
import { TaskFormValue, TaskPriority, TaskStatus } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TitleCasePipe],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(TaskApiService);
  private readonly state = inject(TaskStateService);

  readonly loading = this.state.loading;

  isEditMode = false;
  taskId: string | null = null;
  loadingTask = false;

  readonly statusOptions: TaskStatus[] = ['todo', 'in-progress', 'completed'];
  readonly priorityOptions: TaskPriority[] = ['low', 'medium', 'high'];

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    status: ['todo' as TaskStatus, Validators.required],
    priority: ['medium' as TaskPriority, Validators.required],
    dueDate: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.taskId = id;
      this.loadTask(id);
    }
  }

  private loadTask(id: string): void {
    this.loadingTask = true;
    this.api.getTaskById(id).subscribe({
      next: (task) => {
        if (task) {
          this.form.patchValue({
            title: task.title,
            description: task.description ?? '',
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
          });
        } else {
          this.router.navigate(['/not-found']);
        }
        this.loadingTask = false;
      },
      error: () => {
        this.loadingTask = false;
        this.router.navigate(['/not-found']);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as TaskFormValue;

    if (this.isEditMode && this.taskId) {
      this.state.updateTask(this.taskId, value, () =>
        this.router.navigate(['/tasks'])
      );
    } else {
      this.state.createTask(value, () => this.router.navigate(['/tasks']));
    }
  }

  get title() {
    return this.form.controls.title;
  }

  get status() {
    return this.form.controls.status;
  }

  get priority() {
    return this.form.controls.priority;
  }

  get dueDate() {
    return this.form.controls.dueDate;
  }

  formatStatus(status: string): string {
    return status.replace('-', ' ');
  }
}
