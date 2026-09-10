export enum ActivityAction {
  Created = 'Created',
  Assigned = 'Assigned',
  Accepted = 'Accepted',
  Declined = 'Declined',
  StatusChanged = 'Status Changed',
  DueDateExtended = 'Due Date Extended',
  Reassigned = 'Reassigned',
  SubTaskUpdated = 'Subtask Updated',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export interface Activity {
  id: string;
  action: ActivityAction;
  message: string;
  performedBy: string;
  timestamp: string;
}

export interface RecentActivity {
  id: string;
  title: string;
  description: string;
  taskId: string;
  createdAt: string;
}