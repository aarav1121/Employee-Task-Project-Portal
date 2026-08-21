import { Activity } from './activity.model';
import { Employee } from './employee.model';
import { SubTask } from './subtask.model';

export enum TaskStatus {
  PendingAcceptance = 'Pending Acceptance',
  Accepted = 'Accepted',
  InProgress = 'In Progress',
  UnderReview = 'Under Review',
  Completed = 'Completed',
  Declined = 'Declined',
  Cancelled = 'Cancelled'
}

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum DeclineReason {
  CapacityBottleneck = 'Capacity Bottleneck',
  UnclearRequirements = 'Unclear Requirements',
  TightDeadline = 'Tight Deadline'
}

export interface Task {
  id: string;

  title: string;
  description: string;

  assignedEmployeeId: string;

  priority: TaskPriority;
  status: TaskStatus;

  dueDate: string;
  acceptanceDeadline: string;

  subtasks: SubTask[];

  activities: Activity[];

  declineReason?: DeclineReason;
  declineComment?: string;

  createdAt: string;
  updatedAt: string;
}
