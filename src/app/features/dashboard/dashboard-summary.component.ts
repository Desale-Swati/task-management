import { Component, inject } from '@angular/core';
import { TaskStateService } from '../../core/services/task-state.service';

@Component({
  selector: 'app-dashboard-summary',
  standalone: true,
  templateUrl: './dashboard-summary.component.html',
  styleUrl: './dashboard-summary.component.scss',
})
export class DashboardSummaryComponent {
  private readonly state = inject(TaskStateService);
  readonly stats = this.state.stats;
}
