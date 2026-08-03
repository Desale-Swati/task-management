import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { Task, TaskFormValue } from '../models/task.model';

const STORAGE_KEY = 'task-manager-tasks';
const NEXT_ID_KEY = 'task-manager-next-id';

const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'Set up project repository',
    description: 'Initialize Angular app and folder structure',
    status: 'completed',
    priority: 'high',
    dueDate: '2026-07-20',
  },
  {
    id: '2',
    title: 'Implement task list',
    description: 'Display tasks with search and filters',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-08-05',
  },
  {
    id: '3',
    title: 'Add form validation',
    description: 'Validate required fields and show error messages',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-08-10',
  },
  {
    id: '4',
    title: 'Review overdue items',
    description: 'Check tasks past due date',
    status: 'todo',
    priority: 'low',
    dueDate: '2026-07-01',
  },
];

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private tasks: Task[];
  private nextId: number;

  constructor() {
    const stored = this.loadFromStorage();
    this.tasks = stored.tasks;
    this.nextId = stored.nextId;
  }

  getTasks(): Observable<Task[]> {
    return of([...this.tasks]).pipe(delay(300));
  }

  createTask(data: TaskFormValue): Observable<Task> {
    const task: Task = { id: String(this.nextId++), ...data };
    this.tasks = [...this.tasks, task];
    this.saveToStorage();
    return of(task).pipe(delay(300));
  }

  updateTask(id: string, data: TaskFormValue): Observable<Task> {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return throwError(() => new Error('Task not found')).pipe(delay(300));
    }
    const updated: Task = { id, ...data };
    this.tasks = this.tasks.map((t) => (t.id === id ? updated : t));
    this.saveToStorage();
    return of(updated).pipe(delay(300));
  }

  deleteTask(id: string): Observable<void> {
    const exists = this.tasks.some((t) => t.id === id);
    if (!exists) {
      return throwError(() => new Error('Task not found')).pipe(delay(300));
    }
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.saveToStorage();
    return of(void 0).pipe(delay(300));
  }

  getTaskById(id: string): Observable<Task | undefined> {
    return of(this.tasks.find((t) => t.id === id)).pipe(delay(200));
  }

  private loadFromStorage(): { tasks: Task[]; nextId: number } {
    try {
      const storedTasks = localStorage.getItem(STORAGE_KEY);
      const storedNextId = localStorage.getItem(NEXT_ID_KEY);

      if (storedTasks) {
        const tasks = JSON.parse(storedTasks) as Task[];
        const nextId = storedNextId
          ? Number(storedNextId)
          : this.computeNextId(tasks);
        return { tasks, nextId };
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(NEXT_ID_KEY);
    }

    const tasks = [...DEFAULT_TASKS];
    const nextId = this.computeNextId(tasks);
    this.persist(tasks, nextId);
    return { tasks, nextId };
  }

  private saveToStorage(): void {
    this.persist(this.tasks, this.nextId);
  }

  private persist(tasks: Task[], nextId: number): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    localStorage.setItem(NEXT_ID_KEY, String(nextId));
  }

  private computeNextId(tasks: Task[]): number {
    const maxId = tasks.reduce(
      (max, task) => Math.max(max, Number(task.id) || 0),
      0
    );
    return maxId + 1;
  }
}
