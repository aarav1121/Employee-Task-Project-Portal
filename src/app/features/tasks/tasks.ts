import { Component, DestroyRef, inject } from '@angular/core';
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

import { Employee } from '../../core/models/employee.model';
import { mockEmployees } from '../../data/mock-data';
import { TaskService } from '../../core/services/task.service';

@Component({
  selector: 'app-tasks',
  standalone: true,

  imports: [
    ReactiveFormsModule,
    DatePipe,
  ],

  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class TasksComponent {

  // =========================================================
  // VIEW TASK
  // =========================================================

  selectedTask: Task | null = null;

  showTaskDetails = false;

  viewTask(taskId: string): void {
    const task = this.taskService.getTaskById(taskId);

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

  // =========================================================
  // COMPONENT STATE
  // =========================================================

  showAssignmentForm = false;

  // =========================================================
  // EDIT STATE
  // =========================================================

  editingTaskId: string | null = null;

  // =========================================================
  // TASK DATA
  // =========================================================

  tasks: Task[] = [];

  filteredTasks: Task[] = [];

  // =========================================================
  // FILTER STATE
  // =========================================================

  searchTerm = '';

  selectedStatus = 'All';

  selectedPriority = 'All';

  selectedEmployee = 'All';

  // =========================================================
  // TASK SUMMARY
  // =========================================================

  totalTasks = 0;

  inProgressTasks = 0;

  pendingAcceptanceTasks = 0;

  completedTasks = 0;

  // =========================================================
  // FORM
  // =========================================================

  assignmentForm: FormGroup;

  // =========================================================
  // DATA
  // =========================================================

  employees: Employee[] = mockEmployees;

  priorities = Object.values(TaskPriority);

  statuses = Object.values(TaskStatus);

  // =========================================================
  // LIFECYCLE
  // =========================================================

  private readonly destroyRef = inject(DestroyRef);

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly taskService: TaskService,
  ) {

    // =======================================================
    // ASSIGNMENT FORM
    // =======================================================

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

    // =======================================================
    // TASK STATE
    // =======================================================

    this.taskService.tasks$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((tasks) => {

        this.tasks = tasks;

        // Re-apply the current filters whenever the task data
        // changes because of create, edit, delete, etc.
        this.applyFilters();

        // =====================================================
        // UPDATE TASK SUMMARY
        // =====================================================

        this.totalTasks = tasks.length;

        this.inProgressTasks = tasks.filter(
          (task) => task.status === TaskStatus.InProgress,
        ).length;

        this.pendingAcceptanceTasks = tasks.filter(
          (task) => task.status === TaskStatus.PendingAcceptance,
        ).length;

        this.completedTasks = tasks.filter(
          (task) => task.status === TaskStatus.Completed,
        ).length;

        // =====================================================
        // KEEP OPENED TASK DETAILS SYNCHRONIZED
        // =====================================================

        if (this.selectedTask) {

          const updatedTask = tasks.find(
            (task) => task.id === this.selectedTask?.id,
          );

          if (updatedTask) {
            this.selectedTask = updatedTask;
          }
        }
      });
  }

  // =========================================================
  // FILTERING
  // =========================================================

  applyFilters(): void {

    const search = this.searchTerm
      .trim()
      .toLowerCase();

    this.filteredTasks = this.tasks.filter((task) => {

      // =====================================================
      // SEARCH FILTER
      // =====================================================

      const employeeName = this
        .getEmployeeName(task.assignedEmployeeId)
        .toLowerCase();

      const matchesSearch =
        search === '' ||
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search) ||
        employeeName.includes(search);

      // =====================================================
      // STATUS FILTER
      // =====================================================

      const matchesStatus =
        this.selectedStatus === 'All' ||
        task.status === this.selectedStatus;

      // =====================================================
      // PRIORITY FILTER
      // =====================================================

      const matchesPriority =
        this.selectedPriority === 'All' ||
        task.priority === this.selectedPriority;

      // =====================================================
      // EMPLOYEE FILTER
      // =====================================================

      const matchesEmployee =
        this.selectedEmployee === 'All' ||
        task.assignedEmployeeId === this.selectedEmployee;

      // =====================================================
      // TASK MUST MATCH ALL ACTIVE FILTERS
      // =====================================================

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesEmployee
      );
    });
  }

  // =========================================================
  // SEARCH
  // =========================================================

  onSearchChange(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.searchTerm = input.value;

    this.applyFilters();
  }

  // =========================================================
  // STATUS FILTER
  // =========================================================

  onStatusChange(event: Event): void {

    const select = event.target as HTMLSelectElement;

    this.selectedStatus = select.value;

    this.applyFilters();
  }

  // =========================================================
  // PRIORITY FILTER
  // =========================================================

  onPriorityChange(event: Event): void {

    const select = event.target as HTMLSelectElement;

    this.selectedPriority = select.value;

    this.applyFilters();
  }

  // =========================================================
  // EMPLOYEE FILTER
  // =========================================================

  onEmployeeChange(event: Event): void {

    const select = event.target as HTMLSelectElement;

    this.selectedEmployee = select.value;

    this.applyFilters();
  }

  // =========================================================
  // ACTIVE FILTER CHECK
  // =========================================================

  get hasActiveFilters(): boolean {

    return (
      this.searchTerm.trim() !== '' ||
      this.selectedStatus !== 'All' ||
      this.selectedPriority !== 'All' ||
      this.selectedEmployee !== 'All'
    );
  }

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedStatus = 'All';

    this.selectedPriority = 'All';

    this.selectedEmployee = 'All';

    this.applyFilters();
  }

  // =========================================================
  // ASSIGNMENT FORM
  // =========================================================

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

  // =========================================================
  // EDIT TASK
  // =========================================================

  editTask(taskId: string): void {

    const task = this.taskService.getTaskById(taskId);

    if (!task) {
      return;
    }

    this.editingTaskId = taskId;

    this.showAssignmentForm = true;

    this.assignmentForm.patchValue({
      title: task.title,
      description: task.description,
      assignedEmployeeId: task.assignedEmployeeId,
      priority: task.priority,
      dueDate: this.formatDateTimeLocal(task.dueDate),
      acceptanceDeadline: this.formatDateTimeLocal(
        task.acceptanceDeadline,
      ),
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  // =========================================================
  // CREATE / UPDATE TASK
  // =========================================================

  createTask(): void {

    if (this.assignmentForm.invalid) {

      this.assignmentForm.markAllAsTouched();

      return;
    }

    const formValue = this.assignmentForm.getRawValue();

    const assignedEmployee = this.employees.find(
      (employee) =>
        employee.id === formValue.assignedEmployeeId,
    );

    if (!assignedEmployee) {
      return;
    }

    // =======================================================
    // EDIT EXISTING TASK
    // =======================================================

    if (this.editingTaskId) {

      this.taskService.updateTask(
        this.editingTaskId,
        {
          title: formValue.title,
          description: formValue.description,
          assignedEmployeeId: formValue.assignedEmployeeId,
          priority: formValue.priority as TaskPriority,
          dueDate: formValue.dueDate,
          acceptanceDeadline: formValue.acceptanceDeadline,
        },
      );

      this.closeAssignmentForm();

      return;
    }

    // =======================================================
    // CREATE NEW TASK
    // =======================================================

    this.taskService.createTask(
      {
        title: formValue.title,
        description: formValue.description,
        assignedEmployeeId: formValue.assignedEmployeeId,
        priority: formValue.priority as TaskPriority,
        dueDate: formValue.dueDate,
        acceptanceDeadline: formValue.acceptanceDeadline,
      },

      assignedEmployee.name,
    );

    this.closeAssignmentForm();
  }

  // =========================================================
  // TASK HELPERS
  // =========================================================

  getEmployeeName(employeeId: string): string {

    const employee = this.employees.find(
      (employee) => employee.id === employeeId,
    );

    return employee?.name ?? 'Unknown Employee';
  }

  getTaskProgress(task: Task): number {

    if (task.subtasks.length === 0) {
      return 0;
    }

    const completedSubtasks = task.subtasks.filter(
      (subTask) => subTask.completed,
    ).length;

    return Math.round(
      (completedSubtasks / task.subtasks.length) * 100,
    );
  }

  // =========================================================
  // DELETE TASK
  // =========================================================

  deleteTask(taskId: string): void {

    const task = this.taskService.getTaskById(taskId);

    if (!task) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    this.taskService.deleteTask(taskId);

    // Close details if the deleted task
    // was currently being viewed.
    if (this.selectedTask?.id === taskId) {
      this.closeTaskDetails();
    }
  }

  // =========================================================
  // DATE FORMATTER
  // =========================================================

  formatDate(date: string): string {

    if (!date) {
      return '-';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );
  }

  // =========================================================
  // DATETIME LOCAL FORMATTER
  // =========================================================

  private formatDateTimeLocal(date: string): string {

    if (!date) {
      return '';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    const year = parsedDate.getFullYear();

    const month = String(
      parsedDate.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
      parsedDate.getDate(),
    ).padStart(2, '0');

    const hours = String(
      parsedDate.getHours(),
    ).padStart(2, '0');

    const minutes = String(
      parsedDate.getMinutes(),
    ).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // =========================================================
  // VALIDATION
  // =========================================================

  isFieldInvalid(fieldName: string): boolean {

    const field = this.assignmentForm.get(fieldName);

    return !!(
      field &&
      field.invalid &&
      field.touched
    );
  }
}