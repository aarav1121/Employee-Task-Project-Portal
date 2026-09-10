import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';

import {
  Subject,
  takeUntil,
} from 'rxjs';

import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/uses.model';

@Component({
  selector: 'app-userlist',
  standalone: true,

  imports: [
    ReactiveFormsModule,
  ],

  templateUrl: './userlist.html',
  styleUrl: './userlist.css',
})
export class Userlist implements OnInit, OnDestroy {

  // SERVICES

  private userService =
    inject(UserService);

  private fb =
    inject(FormBuilder);

  private changeDetectorRef =
    inject(ChangeDetectorRef);

  // DESTROY SUBJECT

  private destroy$ =
    new Subject<void>();

  // USERS

  users: User[] = [];

  // PAGINATION

  currentPage = 1;

  pageSize = 6;

  totalUsers = 0;

  totalPages = 0;

  // USER FORM VISIBILITY

  showUserForm = false;

  // PASSWORD VISIBILITY

  showPassword = false;

  // REACTIVE FORM

  userForm =
    this.fb.nonNullable.group({

      name: [
        '',
        Validators.required,
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ],

      department: [
        '',
        Validators.required,
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
      ],

    });

  // COMPONENT INITIALIZATION

  ngOnInit(): void {
    this.loadUsersPage(1);
  }

  // LOAD USERS PAGE

  loadUsersPage(page: number): void {

    this.userService
      .getUsers(
        page,
        this.pageSize
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({

        next: (response) => {

          // UPDATE TABLE DATA

          this.users =
            response.data;

          // UPDATE PAGINATION INFORMATION

          this.totalUsers =
            response.total;

          this.currentPage =
            response.page;

          this.pageSize =
            response.limit;

          this.totalPages =
            response.totalPages;

          // REFRESH VIEW

          this.changeDetectorRef.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error loading users:',
            error
          );

        },

      });
  }

  // NEXT PAGE

  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.loadUsersPage(
        this.currentPage + 1
      );

    }

  }

  // PREVIOUS PAGE

  previousPage(): void {

    if (
      this.currentPage >
      1
    ) {

      this.loadUsersPage(
        this.currentPage - 1
      );

    }

  }

  // COMPONENT DESTROY

  ngOnDestroy(): void {

    this.destroy$.next();
    this.destroy$.complete();

  }

  // OPEN USER FORM

  openUserForm(): void {

    this.userForm.reset();

    this.showPassword = false;

    this.showUserForm = true;

  }

  // CLOSE USER FORM

  closeUserForm(): void {

    this.showUserForm = false;

    this.showPassword = false;

    this.userForm.reset();

  }

  // TOGGLE PASSWORD

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;

  }

  // CREATE USER

  createUser(): void {

    // VALIDATION

    if (this.userForm.invalid) {

      this.userForm.markAllAsTouched();

      return;

    }

    const userData =
      this.userForm.getRawValue();

    this.userService
      .createUser(userData)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({

        next: () => {

          this.closeUserForm();

          this.loadUsersPage(
            this.currentPage
          );

        },

        error: (error) => {

          console.error(
            'Error creating user:',
            error
          );

        },

      });

  }
}