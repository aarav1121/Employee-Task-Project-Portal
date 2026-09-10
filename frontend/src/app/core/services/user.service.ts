
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  BehaviorSubject,
  Observable,
  tap,
} from 'rxjs';

import { User } from '../models/uses.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/users';

  // USERS STATE

  private usersSubject =
    new BehaviorSubject<User[]>([]);

  users$ =
    this.usersSubject.asObservable();

  // GET USERS

  getUsers(
    page: number = 1,
    limit: number = 6
  ): Observable<PaginatedUsersResponse> {

    return this.http.get<PaginatedUsersResponse>(
      this.apiUrl,
      {
        params: {
          page,
          limit,
        },
      }
    );
  }

  // LOAD USERS

  loadUsers(
    page: number = 1,
    limit: number = 6
  ): void {

    this.getUsers(page, limit)
      .subscribe({

        next: (response) => {

          console.log(
            'Users loaded from backend:',
            response
          );

          this.usersSubject.next(
            response.data
          );
        },

        error: (error) => {

          console.error(
            'Error loading users:',
            error
          );
        },

      });
  }

  // GET USER BY ID

  getUserById(
    id: number
  ): Observable<User> {

    return this.http.get<User>(
      `${this.apiUrl}/${id}`
    );
  }

  // GET USER BY EMAIL

  getUserByEmail(
    email: string
  ): Observable<User> {

    return this.http.get<User>(
      `${this.apiUrl}/by-email`,
      {
        params: {
          email,
        },
      }
    );
  }

  // CREATE USER

  createUser(user: {
    name: string;
    email: string;
    department: string;
  }): Observable<CreateUserResponse> {

    return this.http.post<CreateUserResponse>(
      this.apiUrl,
      user
    );
  }

  // UPDATE USER

  updateUser(
    id: number,
    user: {
      name?: string;
      email?: string;
      department?: string;
    },
  ): Observable<UpdateUserResponse> {

    return this.http
      .patch<UpdateUserResponse>(
        `${this.apiUrl}/${id}`,
        user
      )
      .pipe(

        tap((response) => {

          const currentUsers =
            this.usersSubject.value;

          const updatedUsers =
            currentUsers.map(
              (existingUser) => {

                if (
                  existingUser.id === id
                ) {
                  return response.user;
                }

                return existingUser;
              }
            );

          this.usersSubject.next(
            updatedUsers
          );

        }),

      );
  }

  // DELETE USER

  deleteUser(
    id: number
  ): Observable<DeleteUserResponse> {

    return this.http
      .delete<DeleteUserResponse>(
        `${this.apiUrl}/${id}`
      )
      .pipe(

        tap((response) => {

          const currentUsers =
            this.usersSubject.value;

          const updatedUsers =
            currentUsers.filter(
              (user) =>
                user.id !== id
            );

          this.usersSubject.next(
            updatedUsers
          );

        }),

      );
  }
}

// RESPONSE INTERFACES

interface CreateUserResponse {
  message: string;
  user: User;
}

interface UpdateUserResponse {
  message: string;
  user: User;
}

interface DeleteUserResponse {
  message: string;
  user: User;
}

interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

