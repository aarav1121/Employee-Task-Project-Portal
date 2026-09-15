import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';

import { DatePipe } from '@angular/common';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TaskService } from '../../core/services/task.service';

import { RecentActivity } from '../../core/models/activity.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  private readonly taskService = inject(TaskService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);

  totalAssignedTasks = 0;
  acceptanceRate = 0;
  onTimeCompletion = 0;
  teamCapacity = 0;
  activeTasksCount = 0;
  remainingCapacity = 0;

  pendingAcceptanceTasks = 0;
  acceptedTasks = 0;
  inProgressTasks = 0;
  underReviewTasks = 0;
  completedTasks = 0;

  criticalTasks = 0;
  highTasks = 0;
  mediumTasks = 0;
  lowTasks = 0;

  criticalPercentage = 0;
  highPercentage = 0;
  mediumPercentage = 0;
  lowPercentage = 0;

  recentActivities: RecentActivity[] = [];

  constructor() {
    this.loadDashboardMetrics();
    this.loadRecentActivities();
  }

  // LOAD DASHBOARD DATA

  private loadDashboardMetrics(): void {
    this.taskService
      .getDashboardMetrics()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (metrics) => {
          this.totalAssignedTasks =
            metrics.totalAssignedTasks;

          this.acceptanceRate =
            metrics.acceptanceRate;

          this.onTimeCompletion =
            metrics.onTimeCompletion;

          this.teamCapacity =
            metrics.teamCapacity;

          this.activeTasksCount =
            metrics.activeTasksCount;

          this.remainingCapacity =
            metrics.remainingCapacity;

          this.pendingAcceptanceTasks =
            metrics.pendingAcceptanceTasks;

          this.acceptedTasks =
            metrics.acceptedTasks;

          this.inProgressTasks =
            metrics.inProgressTasks;

          this.underReviewTasks =
            metrics.underReviewTasks;

          this.completedTasks =
            metrics.completedTasks;

          this.criticalTasks =
            metrics.criticalTasks;

          this.highTasks =
            metrics.highTasks;

          this.mediumTasks =
            metrics.mediumTasks;

          this.lowTasks =
            metrics.lowTasks;

          this.criticalPercentage =
            metrics.criticalPercentage;

          this.highPercentage =
            metrics.highPercentage;

          this.mediumPercentage =
            metrics.mediumPercentage;

          this.lowPercentage =
            metrics.lowPercentage;

          this.changeDetectorRef.markForCheck();
        },

        error: (error) => {
          console.error(
            'Failed to load dashboard metrics:',
            error,
          );
        },
      });
  }

  // LOAD RECENT ACTIVITIES

  private loadRecentActivities(): void {
    this.taskService
      .getRecentActivities()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (activities) => {
          this.recentActivities =
            activities;

          this.changeDetectorRef.markForCheck();
        },

        error: (error) => {
          console.error(
            'Failed to load recent activities:',
            error,
          );
        },
      });
  }
}