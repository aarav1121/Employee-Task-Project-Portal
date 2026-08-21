import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { StorageService } from './storage.service';

import { DeclineReason, Task, TaskPriority, TaskStatus } from '../models/task.model';

import { Activity, ActivityAction } from '../models/activity.model';

import { SubTask } from '../models/subtask.model';

import { mockTasks } from '../../data/mock-data';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  // STORAGE

  private readonly storageService = inject(StorageService);

  private readonly storageKey = 'tasks';

  // LOAD TASKS

  private loadTasks(): Task[] {
    const savedTasks = this.storageService.get<Task[]>(this.storageKey);

    return savedTasks ?? mockTasks;
  }

  // SAVE TASKS

  private saveTasks(tasks: Task[]): void {
    this.storageService.set(this.storageKey, tasks);
  }

  // REACTIVE STATE

  private readonly tasksSubject = new BehaviorSubject<Task[]>(this.loadTasks());

  readonly tasks$: Observable<Task[]> = this.tasksSubject.asObservable();

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

  // CREATE

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

    // Update application state

    this.tasksSubject.next(updatedTasks);

    // Persist data

    this.saveTasks(updatedTasks);
  }

  // UPDATE

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

    // Update application state

    this.tasksSubject.next(updatedTasks);

    // Persist data

    this.saveTasks(updatedTasks);
  }

  // DELETE

  deleteTask(taskId: string): void {
    const updatedTasks = this.tasksSubject.value.filter((task) => task.id !== taskId);

    // Update application state

    this.tasksSubject.next(updatedTasks);

    // Persist data

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
