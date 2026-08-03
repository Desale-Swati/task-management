import { Task, TaskFilters } from '../models/task.model';

export function isOverdue(task: Task): boolean {
  if (task.status === 'completed') {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const search = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesSearch = !search || task.title.toLowerCase().includes(search);
    const matchesStatus = filters.status === 'all' || task.status === filters.status;
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
    return matchesSearch && matchesStatus && matchesPriority;
  });
}

export function computeTaskStats(tasks: Task[]): {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
} {
  return {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    overdue: tasks.filter((t) => isOverdue(t)).length,
  };
}
