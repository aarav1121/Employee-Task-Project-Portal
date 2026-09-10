export enum TaskStatus {
  PendingAcceptance = 'Pending Acceptance',
  Accepted = 'Accepted',
  InProgress = 'In Progress',
  UnderReview = 'Under Review',
  Completed = 'Completed',
  Declined = 'Declined',
  Cancelled = 'Cancelled',
}

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum DeclineReason {
  CapacityBottleneck = 'Capacity Bottleneck',
  UnclearRequirements = 'Unclear Requirements',
  TightDeadline = 'Tight Deadline',
}
