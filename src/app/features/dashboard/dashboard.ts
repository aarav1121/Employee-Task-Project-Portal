import {
  Component,
  DestroyRef,
  inject
} from '@angular/core';

import { Router } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  Task,
  TaskStatus,
  TaskPriority
} from '../../core/models/task.model';

import { TaskService } from '../../core/services/task.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {

  // =========================================
  // SERVICES
  // =========================================

  private readonly taskService = inject(TaskService);

  private readonly destroyRef = inject(DestroyRef);

  private readonly router = inject(Router);


  // =========================================
  // DASHBOARD METRICS
  // =========================================

  totalAssignedTasks = 0;

  acceptanceRate = 0;

  onTimeCompletion = 0;

  teamCapacity = 0;

  activeTasksCount = 0;

  remainingCapacity = 0;


  // =========================================
  // TASK DISTRIBUTION
  // =========================================

  pendingAcceptanceTasks = 0;

  acceptedTasks = 0;

  inProgressTasks = 0;

  underReviewTasks = 0;

  completedTasks = 0;


  // =========================================
  // TASK PRIORITY COUNTS
  // =========================================

  criticalTasks = 0;

  highTasks = 0;

  mediumTasks = 0;

  lowTasks = 0;


  // =========================================
  // TASK PRIORITY PERCENTAGES
  // =========================================

  criticalPercentage = 0;

  highPercentage = 0;

  mediumPercentage = 0;

  lowPercentage = 0;


  // =========================================
  // COMPONENT INITIALIZATION
  // =========================================

  constructor() {

    this.taskService.tasks$
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(tasks => {

        this.calculateDashboardMetrics(tasks);

      });

  }


  // =========================================
  // CALCULATE ALL DASHBOARD METRICS
  // =========================================

  private calculateDashboardMetrics(
    tasks: Task[]
  ): void {

    this.totalAssignedTasks = tasks.length;

    this.calculateAcceptanceRate(tasks);

    this.calculateOnTimeCompletion(tasks);

    this.calculateTeamCapacity(tasks);

    this.calculateTaskDistribution(tasks);

    this.calculatePriorityDistribution(tasks);

  }


  // =========================================
  // ACCEPTANCE RATE
  // =========================================

  private calculateAcceptanceRate(
    tasks: Task[]
  ): void {

    if (tasks.length === 0) {

      this.acceptanceRate = 0;

      return;

    }


    const respondedTasks = tasks.filter(
      task =>
        task.status !== TaskStatus.PendingAcceptance
    );


    this.acceptanceRate = Math.round(
      (
        respondedTasks.length /
        tasks.length
      ) * 100
    );

  }


  // =========================================
  // ON-TIME COMPLETION
  // =========================================

  private calculateOnTimeCompletion(
    tasks: Task[]
  ): void {

    const completedTasks = tasks.filter(
      task =>
        task.status === TaskStatus.Completed
    );


    if (completedTasks.length === 0) {

      this.onTimeCompletion = 0;

      return;

    }


    const onTimeTasks = completedTasks.filter(
      task => {

        const completionActivity =
          task.activities.find(
            activity =>
              activity.action
                .toLowerCase()
                .includes('completed')
          );


        if (!completionActivity) {

          return false;

        }


        return (
          new Date(
            completionActivity.timestamp
          ) <=
          new Date(task.dueDate)
        );

      }
    );


    this.onTimeCompletion = Math.round(
      (
        onTimeTasks.length /
        completedTasks.length
      ) * 100
    );

  }


  // =========================================
  // TEAM CAPACITY
  // =========================================

  private calculateTeamCapacity(
    tasks: Task[]
  ): void {

    const activeTasks = tasks.filter(
      task =>
        task.status === TaskStatus.InProgress
    );


    /*
     * Temporary capacity model.
     *
     * 5 employees
     * ×
     * 4 active tasks per employee
     *
     * = 20 active tasks maximum.
     *
     * This will later be replaced with
     * real Employee data.
     */

    const maximumCapacity = 20;


    // -----------------------------------------
    // ACTIVE TASK COUNT
    // -----------------------------------------

    this.activeTasksCount =
      activeTasks.length;


    // -----------------------------------------
    // TEAM CAPACITY PERCENTAGE
    // -----------------------------------------

    this.teamCapacity = Math.min(

      Math.round(
        (
          this.activeTasksCount /
          maximumCapacity
        ) * 100
      ),

      100

    );


    // -----------------------------------------
    // REMAINING CAPACITY
    // -----------------------------------------

    this.remainingCapacity = Math.max(

      maximumCapacity -
      this.activeTasksCount,

      0

    );

  }


  // =========================================
  // TASK DISTRIBUTION
  // =========================================

  private calculateTaskDistribution(
    tasks: Task[]
  ): void {

    this.pendingAcceptanceTasks =
      tasks.filter(
        task =>
          task.status === TaskStatus.PendingAcceptance
      ).length;


    this.acceptedTasks =
      tasks.filter(
        task =>
          task.status === TaskStatus.Accepted
      ).length;


    this.inProgressTasks =
      tasks.filter(
        task =>
          task.status === TaskStatus.InProgress
      ).length;


    this.underReviewTasks =
      tasks.filter(
        task =>
          task.status === TaskStatus.UnderReview
      ).length;


    this.completedTasks =
      tasks.filter(
        task =>
          task.status === TaskStatus.Completed
      ).length;

  }


  // =========================================
  // TASK PRIORITY DISTRIBUTION
  // =========================================

  private calculatePriorityDistribution(
    tasks: Task[]
  ): void {

    // -----------------------------------------
    // COUNT TASKS BY PRIORITY
    // -----------------------------------------

    this.criticalTasks =
      tasks.filter(
        task =>
          task.priority === TaskPriority.Critical
      ).length;


    this.highTasks =
      tasks.filter(
        task =>
          task.priority === TaskPriority.High
      ).length;


    this.mediumTasks =
      tasks.filter(
        task =>
          task.priority === TaskPriority.Medium
      ).length;


    this.lowTasks =
      tasks.filter(
        task =>
          task.priority === TaskPriority.Low
      ).length;


    // -----------------------------------------
    // CALCULATE PRIORITY PERCENTAGES
    // -----------------------------------------

    const totalTasks = tasks.length;


    if (totalTasks === 0) {

      this.criticalPercentage = 0;

      this.highPercentage = 0;

      this.mediumPercentage = 0;

      this.lowPercentage = 0;

      return;

    }


    this.criticalPercentage =
      Math.round(
        (
          this.criticalTasks /
          totalTasks
        ) * 100
      );


    this.highPercentage =
      Math.round(
        (
          this.highTasks /
          totalTasks
        ) * 100
      );


    this.mediumPercentage =
      Math.round(
        (
          this.mediumTasks /
          totalTasks
        ) * 100
      );


    this.lowPercentage =
      Math.round(
        (
          this.lowTasks /
          totalTasks
        ) * 100
      );

  }


  // =========================================
  // ASSIGN TASK NAVIGATION
  // =========================================

//   openAssignmentForm(): void {

//     this.router.navigate(['/tasks']);

//   }

// 
}