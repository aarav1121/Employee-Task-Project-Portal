import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  Task,
  TaskPriority,
  TaskStatus,
} from '../../core/models/task.model';

import { User } from '../../core/models/uses.model';
import { UserService } from '../../core/services/user.service';
import { TaskService } from '../../core/services/task.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class TasksComponent {
  // VIEW TASK

  selectedTask: Task | null = null;

  showTaskDetails = false;

  viewTask(taskId: string): void {
    const task = this.tasks.find(
      (task) => task.id === taskId,
    );

    if (!task) {
      return;
    }

    this.selectedTask = task;
    this.showTaskDetails = true;
  }

  closeTaskDetails(): void {
    this.showTaskDetails = false;
    this.selectedTask = null;
  }

  // COMPONENT STATE

  showAssignmentForm = false;

  // EDIT STATE

  editingTaskId: string | null = null;

  // TASK DATA

  tasks: Task[] = [];

  filteredTasks: Task[] = [];

  // PAGINATION

  currentPage = 1;

  pageSize = 6;

  totalTaskRecords = 0;

  totalPages = 0;

  // FILTER STATE

  searchTerm = '';

  selectedStatus = 'All';

  selectedPriority = 'All';

  selectedEmployee = 'All';

  // TASK SUMMARY

  totalTasks = 0;

  inProgressTasks = 0;

  pendingAcceptanceTasks = 0;

  completedTasks = 0;

  // FORM

  assignmentForm: FormGroup;

  // EMPLOYEE DATA

  employees: User[] = [];

  priorities = Object.values(TaskPriority);

  statuses = Object.values(TaskStatus);

  // LIFECYCLE

  private readonly destroyRef = inject(DestroyRef);

  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);

  // CONSTRUCTOR

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly taskService: TaskService,
    private readonly userService: UserService,
  ) {
    // ASSIGNMENT FORM

    this.assignmentForm = this.formBuilder.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
        ],
      ],

      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
        ],
      ],

      assignedEmployeeId: [
        '',
        Validators.required,
      ],

      priority: [
        TaskPriority.Medium,
        Validators.required,
      ],

      dueDate: [
        '',
        Validators.required,
      ],

      acceptanceDeadline: [
        '',
        Validators.required,
      ],
    });

    // USER / EMPLOYEE STATE

    this.userService.users$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((users) => {
        this.employees = users;

        this.applyFilters();

        this.changeDetectorRef.markForCheck();
      });

    // LOAD USERS

    this.userService.loadUsers();

    // LOAD FIRST TASK PAGE

    this.loadTasksPage(1);
  }

  // LOAD PAGINATED TASKS FROM BACKEND

  loadTasksPage(
    page: number = this.currentPage,
  ): void {
    this.taskService
      .getTasksPage(page, this.pageSize)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.tasks = response.data;

          this.totalTaskRecords =
            response.total;

          this.totalPages =
            response.totalPages;

          this.currentPage =
            response.page;

          this.updateTaskDisplay();

          this.changeDetectorRef.markForCheck();
        },

        error: (error) => {
          console.error(
            'Failed to load tasks:',
            error,
          );
        },
      });
  }

  // UPDATE TASK DISPLAY

  private updateTaskDisplay(): void {
    this.applyFilters();

    this.totalTasks =
      this.totalTaskRecords;

    this.inProgressTasks =
      this.tasks.filter(
        (task) =>
          task.status ===
          TaskStatus.InProgress,
      ).length;

    this.pendingAcceptanceTasks =
      this.tasks.filter(
        (task) =>
          task.status ===
          TaskStatus.PendingAcceptance,
      ).length;

    this.completedTasks =
      this.tasks.filter(
        (task) =>
          task.status ===
          TaskStatus.Completed,
      ).length;

    if (this.selectedTask) {
      const updatedTask =
        this.tasks.find(
          (task) =>
            task.id ===
            this.selectedTask?.id,
        );

      if (updatedTask) {
        this.selectedTask =
          updatedTask;
      }
    }
  }

  // NEXT PAGE

  nextPage(): void {
    if (
      this.currentPage >=
      this.totalPages
    ) {
      return;
    }

    this.loadTasksPage(
      this.currentPage + 1,
    );
  }

  // PREVIOUS PAGE

  previousPage(): void {
    if (this.currentPage <= 1) {
      return;
    }

    this.loadTasksPage(
      this.currentPage - 1,
    );
  }

  // FILTERING

  applyFilters(): void {
    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    this.filteredTasks =
      this.tasks.filter((task) => {
        const employeeName =
          this.getEmployeeName(
            task.assignedEmployeeId,
          ).toLowerCase();

        const matchesSearch =
          search === '' ||
          task.title
            .toLowerCase()
            .includes(search) ||
          task.description
            .toLowerCase()
            .includes(search) ||
          employeeName.includes(search);

        const matchesStatus =
          this.selectedStatus ===
            'All' ||
          task.status ===
            this.selectedStatus;

        const matchesPriority =
          this.selectedPriority ===
            'All' ||
          task.priority ===
            this.selectedPriority;

        const matchesEmployee =
          this.selectedEmployee ===
            'All' ||
          String(
            task.assignedEmployeeId,
          ) ===
            String(
              this.selectedEmployee,
            );

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority &&
          matchesEmployee
        );
      });
  }

  // SEARCH

  onSearchChange(
    event: Event,
  ): void {
    const input =
      event.target as HTMLInputElement;

    this.searchTerm =
      input.value;

    this.applyFilters();
  }

  // STATUS FILTER

  onStatusChange(
    event: Event,
  ): void {
    const select =
      event.target as HTMLSelectElement;

    this.selectedStatus =
      select.value;

    this.applyFilters();
  }

  // PRIORITY FILTER

  onPriorityChange(
    event: Event,
  ): void {
    const select =
      event.target as HTMLSelectElement;

    this.selectedPriority =
      select.value;

    this.applyFilters();
  }

  // EMPLOYEE FILTER

  onEmployeeChange(
    event: Event,
  ): void {
    const select =
      event.target as HTMLSelectElement;

    this.selectedEmployee =
      select.value;

    this.applyFilters();
  }

  // ACTIVE FILTER CHECK

  get hasActiveFilters(): boolean {
    return (
      this.searchTerm
        .trim() !== '' ||
      this.selectedStatus !==
        'All' ||
      this.selectedPriority !==
        'All' ||
      this.selectedEmployee !==
        'All'
    );
  }

  // CLEAR FILTERS

  clearFilters(): void {
    this.searchTerm = '';

    this.selectedStatus = 'All';

    this.selectedPriority = 'All';

    this.selectedEmployee = 'All';

    this.applyFilters();
  }

  // ASSIGNMENT FORM

  openAssignmentForm(): void {
    this.editingTaskId = null;

    this.showAssignmentForm = true;

    this.resetAssignmentForm();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  closeAssignmentForm(): void {
    this.showAssignmentForm = false;

    this.editingTaskId = null;

    this.resetAssignmentForm();
  }

  private resetAssignmentForm(): void {
    this.assignmentForm.reset({
      title: '',
      description: '',
      assignedEmployeeId: '',
      priority: TaskPriority.Medium,
      dueDate: '',
      acceptanceDeadline: '',
    });
  }

  // FORM VALIDATION

  isFieldInvalid(
    fieldName: string,
  ): boolean {
    const control =
      this.assignmentForm.get(
        fieldName,
      );

    return !!(
      control &&
      control.invalid &&
      (control.dirty ||
        control.touched)
    );
  }

  // EDIT TASK

  editTask(
    taskId: string,
  ): void {
    const task = this.tasks.find(
      (task) =>
        task.id === taskId,
    );

    if (!task) {
      console.error(
        'Task not found:',
        taskId,
      );

      return;
    }

    this.editingTaskId =
      taskId;

    this.showAssignmentForm =
      true;

    this.assignmentForm.patchValue({
      title: task.title,

      description:
        task.description,

      assignedEmployeeId:
        String(
          task.assignedEmployeeId,
        ),

      priority:
        task.priority,

      dueDate:
        this.formatDateTimeLocal(
          task.dueDate,
        ),

      acceptanceDeadline:
        this.formatDateTimeLocal(
          task.acceptanceDeadline,
        ),
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  // DATE FORMATTING

  private formatDateTimeLocal(
    value: string,
  ): string {
    if (!value) {
      return value;
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return value;
    }

    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
      date.getDate(),
    ).padStart(2, '0');

    const hours = String(
      date.getHours(),
    ).padStart(2, '0');

    const minutes = String(
      date.getMinutes(),
    ).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // CREATE / UPDATE TASK

  createTask(): void {
    if (
      this.assignmentForm.invalid
    ) {
      this.assignmentForm.markAllAsTouched();

      return;
    }

    const formValue =
      this.assignmentForm.getRawValue();

    // GET EMPLOYEE

    const assignedEmployee =
      this.employees.find(
        (employee) =>
          String(employee.id) ===
          String(
            formValue.assignedEmployeeId,
          ),
      );

    if (!assignedEmployee) {
      console.error(
        'Assigned employee not found:',
        formValue.assignedEmployeeId,
      );

      return;
    }

    // EDIT EXISTING TASK

    if (this.editingTaskId) {
      const updateTaskRequest = {
        title: formValue.title,

        description:
          formValue.description,

        assignedEmployeeId:
          Number(
            formValue.assignedEmployeeId,
          ),

        priority:
          formValue.priority as TaskPriority,

        dueDate:
          formValue.dueDate,

        acceptanceDeadline:
          formValue.acceptanceDeadline,
      };

      console.log(
        'Updating task:',
        this.editingTaskId,
        updateTaskRequest,
      );

      this.taskService
        .updateTaskOnBackend(
          this.editingTaskId,
          updateTaskRequest,
        )
        .pipe(
          takeUntilDestroyed(
            this.destroyRef,
          ),
        )
        .subscribe({
          next: (
            updatedTask,
          ) => {
            console.log(
              'Task updated successfully:',
              updatedTask,
            );

            // UPDATE TASK IN CURRENT PAGE

            const taskIndex =
              this.tasks.findIndex(
                (task) =>
                  task.id ===
                  updatedTask.id,
              );

            if (taskIndex !== -1) {
              this.tasks[
                taskIndex
              ] = updatedTask;
            }

            // UPDATE SELECTED TASK

            if (
              this.selectedTask?.id ===
              updatedTask.id
            ) {
              this.selectedTask =
                updatedTask;
            }

            // UPDATE FILTERED TASKS AND SUMMARY

            this.updateTaskDisplay();

            // UPDATE VIEW

            this.changeDetectorRef.markForCheck();

            // CLOSE FORM

            this.closeAssignmentForm();
          },

          error: (error) => {
            console.error(
              'Failed to update task:',
              error,
            );

            window.alert(
              'Failed to update task. Please try again.',
            );
          },
        });

      return;
    }

    // CREATE NEW TASK

    const createTaskRequest = {
      title: formValue.title,

      description:
        formValue.description,

      assignedEmployeeId:
        Number(
          formValue.assignedEmployeeId,
        ),

      priority:
        formValue.priority as TaskPriority,

      status:
        TaskStatus.PendingAcceptance,

      dueDate:
        formValue.dueDate,

      acceptanceDeadline:
        formValue.acceptanceDeadline,
    };

    this.taskService
      .createTaskOnBackend(
        createTaskRequest,
      )
      .pipe(
        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe({
        next: (
          createdTask,
        ) => {
          console.log(
            'Task created successfully:',
            createdTask,
          );

          // ADD CREATED TASK IMMEDIATELY

          this.tasks = [
            createdTask,
            ...this.tasks,
          ];

          // UPDATE TOTAL COUNT

          this.totalTaskRecords++;

          // UPDATE TOTAL PAGES

          this.totalPages =
            Math.ceil(
              this.totalTaskRecords /
                this.pageSize,
            );

          // GO TO FIRST PAGE

          this.currentPage = 1;

          // UPDATE TASK DISPLAY

          this.updateTaskDisplay();

          // UPDATE VIEW

          this.changeDetectorRef.markForCheck();

          // CLOSE FORM

          this.closeAssignmentForm();
        },

        error: (error) => {
          console.error(
            'Failed to create task:',
            error,
          );

          window.alert(
            'Failed to create task. Please try again.',
          );
        },
      });
  }

  // TASK HELPERS

  getEmployeeName(
    employeeId: string | number,
  ): string {
    const employee =
      this.employees.find(
        (employee) =>
          Number(
            employee.id,
          ) ===
          Number(employeeId),
      );

    return (
      employee?.name ??
      'Unknown Employee'
    );
  }

  getTaskProgress(
    task: Task,
  ): number {
    if (
      !task.subtasks ||
      task.subtasks.length === 0
    ) {
      return 0;
    }

    const completedSubtasks =
      task.subtasks.filter(
        (subTask) =>
          subTask.completed,
      ).length;

    return Math.round(
      (completedSubtasks /
        task.subtasks.length) *
        100,
    );
  }

  // DELETE TASK

  deleteTask(
    taskId: string,
  ): void {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this task?',
      );

    if (!confirmed) {
      return;
    }

    this.taskService
      .deleteTaskOnBackend(taskId)
      .pipe(
        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe({
        next: () => {
          // REMOVE TASK FROM CURRENT PAGE IMMEDIATELY

          this.tasks =
            this.tasks.filter(
              (task) =>
                task.id !== taskId,
            );

          // CLOSE TASK DETAILS

          if (
            this.selectedTask?.id ===
            taskId
          ) {
            this.selectedTask = null;
            this.showTaskDetails =
              false;
          }

          // UPDATE TOTAL COUNT

          this.totalTaskRecords =
            Math.max(
              0,
              this.totalTaskRecords - 1,
            );

          // UPDATE TOTAL PAGES

          this.totalPages =
            this.totalTaskRecords > 0
              ? Math.ceil(
                  this.totalTaskRecords /
                    this.pageSize,
                )
              : 0;

          // MOVE TO PREVIOUS PAGE IF NEEDED

          if (
            this.currentPage >
              this.totalPages &&
            this.totalPages > 0
          ) {
            this.currentPage =
              this.totalPages;
          }

          // UPDATE UI IMMEDIATELY

          this.updateTaskDisplay();

          // UPDATE VIEW

          this.changeDetectorRef.markForCheck();

          // REFILL CURRENT PAGE IF NEEDED

          if (
            this.totalTaskRecords >
              0 &&
            this.tasks.length <
              this.pageSize
          ) {
            this.loadTasksPage(
              this.currentPage,
            );
          }
        },

        error: (error) => {
          console.error(
            'Failed to delete task:',
            error,
          );

          window.alert(
            'Failed to delete task. Please try again.',
          );
        },
      });
  }
}