import { Activity, ActivityAction } from '../core/models/activity.model';
import { Employee, EmployeeRole } from '../core/models/employee.model';
import { SubTask } from '../core/models/subtask.model';
import {
  DeclineReason,
  Task,
  TaskPriority,
  TaskStatus,
} from '../core/models/task.model';

// EMPLOYEES

export const mockEmployees: Employee[] = [
  {
    id: 'EMP001',
    name: 'Rahul Sharma',
    email: 'rahul@company.com',
    role: EmployeeRole.Employee,
    department: 'Engineering'
  },
  {
    id: 'EMP002',
    name: 'Priya Verma',
    email: 'priya@company.com',
    role: EmployeeRole.Employee,
    department: 'Design'
  },
  {
    id: 'EMP003',
    name: 'Aman Gupta',
    email: 'aman@company.com',
    role: EmployeeRole.Employee,
    department: 'Engineering'
  },
  {
    id: 'EMP004',
    name: 'Neha Singh',
    email: 'neha@company.com',
    role: EmployeeRole.Employee,
    department: 'Product'
  },
  {
    id: 'EMP005',
    name: 'Vikram Mehta',
    email: 'vikram@company.com',
    role: EmployeeRole.TeamLead,
    department: 'Engineering'
  }
];


// SUBTASKS

const dashboardSubtasks: SubTask[] = [
  {
    id: 'SUB001',
    title: 'Create dashboard layout',
    completed: true
  },
  {
    id: 'SUB002',
    title: 'Build KPI cards',
    completed: true
  },
  {
    id: 'SUB003',
    title: 'Add responsive design',
    completed: false
  },
  {
    id: 'SUB004',
    title: 'Test mobile layout',
    completed: false
  }
];

const loginSubtasks: SubTask[] = [
  {
    id: 'SUB005',
    title: 'Create login form',
    completed: true
  },
  {
    id: 'SUB006',
    title: 'Add form validation',
    completed: false
  },
  {
    id: 'SUB007',
    title: 'Connect authentication state',
    completed: false
  }
];

const analyticsSubtasks: SubTask[] = [
  {
    id: 'SUB008',
    title: 'Create analytics layout',
    completed: true
  },
  {
    id: 'SUB009',
    title: 'Build status chart',
    completed: true
  },
  {
    id: 'SUB010',
    title: 'Build workload chart',
    completed: false
  }
];

const apiSubtasks: SubTask[] = [
  {
    id: 'SUB011',
    title: 'Document endpoints',
    completed: true
  },
  {
    id: 'SUB012',
    title: 'Add request examples',
    completed: true
  },
  {
    id: 'SUB013',
    title: 'Review documentation',
    completed: true
  }
];


// ACTIVITY HELPERS

const createActivity = (
  id: string,
  action: ActivityAction,
  message: string,
  performedBy: string,
  timestamp: string
): Activity => ({
  id,
  action,
  message,
  performedBy,
  timestamp
});


// TASKS

export const mockTasks: Task[] = [

  {
    id: 'TASK001',
    title: 'Build Employee Dashboard',
    description:
      'Create the main employee dashboard with KPI cards, recent activity and task summary.',
    assignedEmployeeId: 'EMP001',
    priority: TaskPriority.High,
    status: TaskStatus.InProgress,
    dueDate: '2026-08-20T18:00:00',
    acceptanceDeadline: '2026-08-17T18:00:00',

    subtasks: dashboardSubtasks,

    activities: [
      createActivity(
        'ACT001',
        ActivityAction.Created,
        'Task was created.',
        'Vikram Mehta',
        '2026-08-17T09:00:00'
      ),
      createActivity(
        'ACT002',
        ActivityAction.Assigned,
        'Task was assigned to Rahul Sharma.',
        'Vikram Mehta',
        '2026-08-17T09:05:00'
      ),
      createActivity(
        'ACT003',
        ActivityAction.Accepted,
        'Rahul Sharma accepted the task.',
        'Rahul Sharma',
        '2026-08-17T09:30:00'
      ),
      createActivity(
        'ACT004',
        ActivityAction.StatusChanged,
        'Task moved to In Progress.',
        'Rahul Sharma',
        '2026-08-17T10:00:00'
      )
    ],

    createdAt: '2026-08-17T09:00:00',
    updatedAt: '2026-08-17T10:00:00'
  },


  {
    id: 'TASK002',
    title: 'Design Login Experience',
    description:
      'Design and implement the login experience with responsive layouts and validation states.',
    assignedEmployeeId: 'EMP002',
    priority: TaskPriority.Medium,
    status: TaskStatus.Accepted,
    dueDate: '2026-08-21T18:00:00',
    acceptanceDeadline: '2026-08-18T12:00:00',

    subtasks: loginSubtasks,

    activities: [
      createActivity(
        'ACT005',
        ActivityAction.Created,
        'Task was created.',
        'Vikram Mehta',
        '2026-08-17T08:30:00'
      ),
      createActivity(
        'ACT006',
        ActivityAction.Assigned,
        'Task was assigned to Priya Verma.',
        'Vikram Mehta',
        '2026-08-17T08:35:00'
      ),
      createActivity(
        'ACT007',
        ActivityAction.Accepted,
        'Priya Verma accepted the task.',
        'Priya Verma',
        '2026-08-17T09:15:00'
      )
    ],

    createdAt: '2026-08-17T08:30:00',
    updatedAt: '2026-08-17T09:15:00'
  },


  {
    id: 'TASK003',
    title: 'Implement Analytics Module',
    description:
      'Build the analytics module with task distribution, priority breakdown and workload metrics.',
    assignedEmployeeId: 'EMP003',
    priority: TaskPriority.Critical,
    status: TaskStatus.InProgress,
    dueDate: '2026-08-19T18:00:00',
    acceptanceDeadline: '2026-08-17T16:00:00',

    subtasks: analyticsSubtasks,

    activities: [
      createActivity(
        'ACT008',
        ActivityAction.Created,
        'Task was created.',
        'Vikram Mehta',
        '2026-08-16T14:00:00'
      ),
      createActivity(
        'ACT009',
        ActivityAction.Assigned,
        'Task was assigned to Aman Gupta.',
        'Vikram Mehta',
        '2026-08-16T14:05:00'
      ),
      createActivity(
        'ACT010',
        ActivityAction.Accepted,
        'Aman Gupta accepted the task.',
        'Aman Gupta',
        '2026-08-16T14:30:00'
      ),
      createActivity(
        'ACT011',
        ActivityAction.StatusChanged,
        'Task moved to In Progress.',
        'Aman Gupta',
        '2026-08-16T15:00:00'
      )
    ],

    createdAt: '2026-08-16T14:00:00',
    updatedAt: '2026-08-16T15:00:00'
  },


  {
    id: 'TASK004',
    title: 'API Documentation',
    description:
      'Prepare complete technical documentation for the employee task management APIs.',
    assignedEmployeeId: 'EMP004',
    priority: TaskPriority.Low,
    status: TaskStatus.Completed,
    dueDate: '2026-08-18T18:00:00',
    acceptanceDeadline: '2026-08-16T12:00:00',

    subtasks: apiSubtasks,

    activities: [
      createActivity(
        'ACT012',
        ActivityAction.Created,
        'Task was created.',
        'Vikram Mehta',
        '2026-08-15T10:00:00'
      ),
      createActivity(
        'ACT013',
        ActivityAction.Assigned,
        'Task was assigned to Neha Singh.',
        'Vikram Mehta',
        '2026-08-15T10:05:00'
      ),
      createActivity(
        'ACT014',
        ActivityAction.Accepted,
        'Neha Singh accepted the task.',
        'Neha Singh',
        '2026-08-15T10:30:00'
      ),
      createActivity(
        'ACT015',
        ActivityAction.StatusChanged,
        'Task moved to Under Review.',
        'Neha Singh',
        '2026-08-17T11:00:00'
      ),
      createActivity(
        'ACT016',
        ActivityAction.Completed,
        'Task was completed.',
        'Vikram Mehta',
        '2026-08-17T13:00:00'
      )
    ],

    createdAt: '2026-08-15T10:00:00',
    updatedAt: '2026-08-17T13:00:00'
  },


  {
    id: 'TASK005',
    title: 'Responsive Layout Fixes',
    description:
      'Fix responsive issues across dashboard, task table and task detail views.',
    assignedEmployeeId: 'EMP001',
    priority: TaskPriority.High,
    status: TaskStatus.UnderReview,
    dueDate: '2026-08-18T18:00:00',
    acceptanceDeadline: '2026-08-16T17:00:00',

    subtasks: [
      {
        id: 'SUB014',
        title: 'Fix tablet layout',
        completed: true
      },
      {
        id: 'SUB015',
        title: 'Fix mobile navigation',
        completed: true
      },
      {
        id: 'SUB016',
        title: 'Test multiple screen sizes',
        completed: true
      }
    ],

    activities: [
      createActivity(
        'ACT017',
        ActivityAction.Created,
        'Task was created.',
        'Vikram Mehta',
        '2026-08-16T09:00:00'
      ),
      createActivity(
        'ACT018',
        ActivityAction.Assigned,
        'Task was assigned to Rahul Sharma.',
        'Vikram Mehta',
        '2026-08-16T09:05:00'
      ),
      createActivity(
        'ACT019',
        ActivityAction.Accepted,
        'Rahul Sharma accepted the task.',
        'Rahul Sharma',
        '2026-08-16T09:30:00'
      ),
      createActivity(
        'ACT020',
        ActivityAction.StatusChanged,
        'Task moved to Under Review.',
        'Rahul Sharma',
        '2026-08-17T12:00:00'
      )
    ],

    createdAt: '2026-08-16T09:00:00',
    updatedAt: '2026-08-17T12:00:00'
  },


  {
    id: 'TASK006',
    title: 'Create Task Assignment Form',
    description:
      'Build the reactive form used by team leads to assign new tasks to employees.',
    assignedEmployeeId: 'EMP003',
    priority: TaskPriority.High,
    status: TaskStatus.PendingAcceptance,
    dueDate: '2026-08-22T18:00:00',
    acceptanceDeadline: '2026-08-18T18:00:00',

    subtasks: [
      {
        id: 'SUB017',
        title: 'Create form structure',
        completed: true
      },
      {
        id: 'SUB018',
        title: 'Add validation',
        completed: false
      },
      {
        id: 'SUB019',
        title: 'Add employee selector',
        completed: false
      }
    ],

    activities: [
      createActivity(
        'ACT021',
        ActivityAction.Created,
        'Task was created.',
        'Vikram Mehta',
        '2026-08-17T12:00:00'
      ),
      createActivity(
        'ACT022',
        ActivityAction.Assigned,
        'Task was assigned to Aman Gupta.',
        'Vikram Mehta',
        '2026-08-17T12:05:00'
      )
    ],

    createdAt: '2026-08-17T12:00:00',
    updatedAt: '2026-08-17T12:05:00'
  },


  {
    id: 'TASK007',
    title: 'Review Security Requirements',
    description:
      'Review security requirements for task assignment and employee access controls.',
    assignedEmployeeId: 'EMP004',
    priority: TaskPriority.Critical,
    status: TaskStatus.PendingAcceptance,
    dueDate: '2026-08-23T18:00:00',
    acceptanceDeadline: '2026-08-18T10:00:00',

    subtasks: [
      {
        id: 'SUB020',
        title: 'Review access roles',
        completed: false
      },
      {
        id: 'SUB021',
        title: 'Review permission rules',
        completed: false
      }
    ],

    activities: [
      createActivity(
        'ACT023',
        ActivityAction.Created,
        'Task was created.',
        'Vikram Mehta',
        '2026-08-17T13:00:00'
      ),
      createActivity(
        'ACT024',
        ActivityAction.Assigned,
        'Task was assigned to Neha Singh.',
        'Vikram Mehta',
        '2026-08-17T13:05:00'
      )
    ],

    createdAt: '2026-08-17T13:00:00',
    updatedAt: '2026-08-17T13:05:00'
  },


  {
    id: 'TASK008',
    title: 'Employee Notification UI',
    description:
      'Create the notification interface for task assignments, status updates and SLA warnings.',
    assignedEmployeeId: 'EMP002',
    priority: TaskPriority.Medium,
    status: TaskStatus.Declined,
    dueDate: '2026-08-20T18:00:00',
    acceptanceDeadline: '2026-08-17T11:00:00',

    subtasks: [
      {
        id: 'SUB022',
        title: 'Create notification list',
        completed: false
      },
      {
        id: 'SUB023',
        title: 'Add unread state',
        completed: false
      }
    ],

    declineReason: DeclineReason.CapacityBottleneck,
    declineComment:
      'Currently handling multiple high-priority design tasks.',

    activities: [
      createActivity(
        'ACT025',
        ActivityAction.Created,
        'Task was created.',
        'Vikram Mehta',
        '2026-08-17T08:00:00'
      ),
      createActivity(
        'ACT026',
        ActivityAction.Assigned,
        'Task was assigned to Priya Verma.',
        'Vikram Mehta',
        '2026-08-17T08:05:00'
      ),
      createActivity(
        'ACT027',
        ActivityAction.Declined,
        'Priya Verma declined the task due to a capacity bottleneck.',
        'Priya Verma',
        '2026-08-17T09:00:00'
      )
    ],

    createdAt: '2026-08-17T08:00:00',
    updatedAt: '2026-08-17T09:00:00'
  }
];