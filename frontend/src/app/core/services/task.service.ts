import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, tap } from 'rxjs';

import { StorageService } from './storage.service';

import { DeclineReason, Task, TaskPriority, TaskStatus } from '../models/task.model';

import { Activity, RecentActivity, ActivityAction } from '../models/activity.model';

import { SubTask } from '../models/subtask.model';

// import { mockTasks } from '../mocks/tasks.mock';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  // HTTP

  private readonly http = inject(HttpClient);

  // STORAGE

  private readonly storageService = inject(StorageService);

  private readonly storageKey = 'tasks';

  // BACKEND API

  private readonly apiUrl = 'http://localhost:3000/tasks';

  // LOAD TASKS

  private loadTasks(): Task[] {
    const savedTasks = this.storageService.get<Task[]>(this.storageKey);

    return savedTasks ?? [];
  }

  // SAVE TASKS

  private saveTasks(tasks: Task[]): void {
    this.storageService.set(this.storageKey, tasks);
  }

  // REACTIVE STATE

  private readonly tasksSubject = new BehaviorSubject<Task[]>(this.loadTasks());

  readonly tasks$: Observable<Task[]> = this.tasksSubject.asObservable();

  // GET RECENT ACTIVITIES
  getRecentActivities(): Observable<RecentActivity[]> {
    return this.http.get<RecentActivity[]>(`${this.apiUrl}/activity`);
  }

  // READ

  getTasks(): Task[] {
    return this.tasksSubject.value;
  }

  getTaskById(id: string): Task | undefined {
    return this.tasksSubject.value.find((task) => task.id === id);
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasksSubject.value.filter((task) => task.status === status);
  }

  getTasksByEmployee(employeeId: string): Task[] {
    return this.tasksSubject.value.filter((task) => task.assignedEmployeeId === employeeId);
  }

  // PAGINATED TASKS FROM BACKEND

  getTasksPage(page: number = 1, limit: number = 6): Observable<PaginatedTasksResponse> {
    return this.http.get<PaginatedTasksResponse>(this.apiUrl, {
      params: {
        page,
        limit,
      },
    });
  }

  // GET DASHBOARD METRICS
  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/dashboard`);
  }

  // CREATE TASK - BACKEND

  createTaskOnBackend(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  // UPDATE TASK - BACKEND

  updateTaskOnBackend(id: string, task: Partial<CreateTaskRequest>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, task);
  }

  // DELETE TASK - BACKEND

  deleteTaskOnBackend(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const updatedTasks = this.tasksSubject.value.filter((task) => task.id !== id);

        this.tasksSubject.next(updatedTasks);

        this.saveTasks(updatedTasks);
      }),
    );
  }

  // CREATE TASK - OLD LOCAL VERSION

  createTask(
    task: Omit<Task, 'id' | 'status' | 'subtasks' | 'activities' | 'createdAt' | 'updatedAt'>,
    assignedEmployeeName: string,
  ): void {
    const now = new Date().toISOString();

    const createdActivity: Activity = {
      id: this.generateId('ACT'),
      action: ActivityAction.Created,
      message: 'Task was created.',
      performedBy: 'Vikram Mehta',
      timestamp: now,
    };

    const assignedActivity: Activity = {
      id: this.generateId('ACT'),
      action: ActivityAction.Assigned,
      message: `Task was assigned to ${assignedEmployeeName}.`,
      performedBy: 'Vikram Mehta',
      timestamp: now,
    };

    const newTask: Task = {
      id: this.generateId('TASK'),
      title: task.title,
      description: task.description,
      assignedEmployeeId: task.assignedEmployeeId,
      priority: task.priority,
      status: TaskStatus.PendingAcceptance,
      dueDate: task.dueDate,
      acceptanceDeadline: task.acceptanceDeadline,
      subtasks: [],
      activities: [createdActivity, assignedActivity],
      createdAt: now,
      updatedAt: now,
    };

    const updatedTasks = [...this.tasksSubject.value, newTask];

    this.tasksSubject.next(updatedTasks);

    this.saveTasks(updatedTasks);
  }

  // UPDATE - OLD LOCAL VERSION

  updateTask(taskId: string, changes: Partial<Task>): void {
    const updatedTasks = this.tasksSubject.value.map((task) => {
      if (task.id !== taskId) {
        return task;
      }

      return {
        ...task,
        ...changes,
        updatedAt: new Date().toISOString(),
      };
    });

    this.tasksSubject.next(updatedTasks);

    this.saveTasks(updatedTasks);
  }

  // DELETE - OLD LOCAL VERSION

  deleteTask(taskId: string): void {
    const updatedTasks = this.tasksSubject.value.filter((task) => task.id !== taskId);

    this.tasksSubject.next(updatedTasks);

    this.saveTasks(updatedTasks);
  }

  // STATUS

  updateStatus(taskId: string, status: TaskStatus, performedBy: string): void {
    const task = this.getTaskById(taskId);

    if (!task) {
      return;
    }

    const activity: Activity = {
      id: this.generateId('ACT'),
      action: ActivityAction.StatusChanged,
      message: `Task status changed to ${status}.`,
      performedBy,
      timestamp: new Date().toISOString(),
    };

    this.updateTask(taskId, {
      status,
      activities: [...task.activities, activity],
    });
  }

  // ACCEPT TASK

  acceptTask(taskId: string, employeeName: string): void {
    const task = this.getTaskById(taskId);

    if (!task) {
      return;
    }

    const activity: Activity = {
      id: this.generateId('ACT'),
      action: ActivityAction.Accepted,
      message: `${employeeName} accepted the task.`,
      performedBy: employeeName,
      timestamp: new Date().toISOString(),
    };

    this.updateTask(taskId, {
      status: TaskStatus.Accepted,
      activities: [...task.activities, activity],
    });
  }

  // DECLINE TASK

  declineTask(taskId: string, reason: DeclineReason, comment: string, employeeName: string): void {
    const task = this.getTaskById(taskId);

    if (!task) {
      return;
    }

    const activity: Activity = {
      id: this.generateId('ACT'),
      action: ActivityAction.Declined,
      message: `${employeeName} declined the task: ${reason}.`,
      performedBy: employeeName,
      timestamp: new Date().toISOString(),
    };

    this.updateTask(taskId, {
      status: TaskStatus.Declined,
      declineReason: reason,
      declineComment: comment,
      activities: [...task.activities, activity],
    });
  }

  // REASSIGN TASK

  reassignTask(taskId: string, employeeId: string, performedBy: string): void {
    const task = this.getTaskById(taskId);

    if (!task) {
      return;
    }

    const activity: Activity = {
      id: this.generateId('ACT'),
      action: ActivityAction.Reassigned,
      message: `Task was reassigned to employee ${employeeId}.`,
      performedBy,
      timestamp: new Date().toISOString(),
    };

    this.updateTask(taskId, {
      assignedEmployeeId: employeeId,
      status: TaskStatus.PendingAcceptance,
      activities: [...task.activities, activity],
    });
  }

  // EXTEND DUE DATE

  extendDueDate(taskId: string, newDueDate: string, performedBy: string): void {
    const task = this.getTaskById(taskId);

    if (!task) {
      return;
    }

    const activity: Activity = {
      id: this.generateId('ACT'),
      action: ActivityAction.DueDateExtended,
      message: `Due date extended to ${newDueDate}.`,
      performedBy,
      timestamp: new Date().toISOString(),
    };

    this.updateTask(taskId, {
      dueDate: newDueDate,
      activities: [...task.activities, activity],
    });
  }

  // SUBTASK

  toggleSubTask(taskId: string, subTaskId: string, performedBy: string): void {
    const task = this.getTaskById(taskId);

    if (!task) {
      return;
    }

    const updatedSubtasks: SubTask[] = task.subtasks.map((subTask) => {
      if (subTask.id !== subTaskId) {
        return subTask;
      }

      return {
        ...subTask,
        completed: !subTask.completed,
      };
    });

    const activity: Activity = {
      id: this.generateId('ACT'),
      action: ActivityAction.SubTaskUpdated,
      message: 'A subtask was updated.',
      performedBy,
      timestamp: new Date().toISOString(),
    };

    this.updateTask(taskId, {
      subtasks: updatedSubtasks,
      activities: [...task.activities, activity],
    });
  }

  // HELPER

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }
}

// BACKEND CREATE TASK REQUEST

interface CreateTaskRequest {
  title: string;
  description: string;
  assignedEmployeeId: number;
  priority: TaskPriority;
  status?: TaskStatus;
  dueDate: string;
  acceptanceDeadline: string;
}

// PAGINATION RESPONSE

interface PaginatedTasksResponse {
  data: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DashboardMetrics {
  totalAssignedTasks: number;

  acceptanceRate: number;

  onTimeCompletion: number;

  activeTasksCount: number;
  teamCapacity: number;
  remainingCapacity: number;

  pendingAcceptanceTasks: number;
  acceptedTasks: number;
  inProgressTasks: number;
  underReviewTasks: number;
  completedTasks: number;

  criticalTasks: number;
  highTasks: number;
  mediumTasks: number;
  lowTasks: number;

  criticalPercentage: number;
  highPercentage: number;
  mediumPercentage: number;
  lowPercentage: number;
}
