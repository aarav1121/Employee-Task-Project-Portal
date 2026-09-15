import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  ViewChild,
  inject
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';

declare global {
  interface Window {
    google?: any;
  }
}

interface LoginResponse {
  message: string;
  accessToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    department: string;
    role: string;
    authProvider: string;
  };
}

interface GoogleLoginResponse {
  message: string;
  accessToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    department: string;
    role: string;
    authProvider: string;
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements AfterViewInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  // GOOGLE BUTTON

  @ViewChild('googleButton', { static: true })
  googleButton!: ElementRef<HTMLDivElement>;

  // LOGIN STATE

  showPassword = false;
  loginError = '';

  // LOGIN FORM

  loginForm = this.formBuilder.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    password: [
      '',
      [
        Validators.required
      ]
    ]
  });

  // GOOGLE LOGIN INITIALIZATION

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.initializeGoogleLogin();
  }

  private initializeGoogleLogin(): void {
    if (window.google) {
      this.renderGoogleButton();
      return;
    }

    const googleScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (!googleScript) {
      this.loginError = 'Google Sign-In could not be loaded.';
      this.cdr.detectChanges();
      return;
    }

    googleScript.addEventListener(
      'load',
      () => {
        this.ngZone.run(() => {
          this.renderGoogleButton();
        });
      },
      { once: true }
    );
  }

  private renderGoogleButton(): void {
    if (!window.google) {
      this.loginError = 'Google Sign-In is not available.';
      this.cdr.detectChanges();
      return;
    }

    window.google.accounts.id.initialize({
      client_id: '479066428240-7200umn2fb311kk67l168hi5kif3nlrn.apps.googleusercontent.com',

      callback: (response: any) => {
        this.ngZone.run(() => {
          this.handleGoogleLogin(response);
        });
      }
    });

    window.google.accounts.id.renderButton(
      this.googleButton.nativeElement,
      {
        theme: 'outline',
        size: 'large',
        width: 350,
        text: 'signin_with'
      }
    );
  }

  // TOGGLE PASSWORD

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // LOGIN

  login(): void {
    this.loginError = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();

    // SEND LOGIN REQUEST

    this.http.post<LoginResponse>(
      'http://localhost:3000/auth/login',
      {
        email,
        password
      }
    ).subscribe({
      next: (result) => {
        // STORE LOGIN STATE

        localStorage.setItem('isLoggedIn', 'true');

        localStorage.setItem(
          'accessToken',
          result.accessToken
        );

        localStorage.setItem(
          'userRole',
          result.user.role
        );

        localStorage.setItem(
          'userName',
          result.user.name
        );

        localStorage.setItem(
          'userEmail',
          result.user.email
        );

        // NAVIGATE TO DASHBOARD

        this.router.navigate(['/dashboard']);
      },

      error: (error) => {
        console.error('Login error:', error);

        this.loginError =
          error?.error?.message ??
          'Invalid email or password';

        this.cdr.detectChanges();
      }
    });
  }

  // GOOGLE LOGIN

  private handleGoogleLogin(response: any): void {
    this.loginError = '';

    if (!response?.credential) {
      this.loginError = 'Google login failed. Please try again.';
      this.cdr.detectChanges();
      return;
    }

    // SEND GOOGLE CREDENTIAL TO BACKEND

    this.http.post<GoogleLoginResponse>(
      'http://localhost:3000/auth/google',
      {
        credential: response.credential
      }
    ).subscribe({
      next: (result) => {
        // STORE LOGIN STATE

        localStorage.setItem('isLoggedIn', 'true');

        localStorage.setItem(
          'accessToken',
          result.accessToken
        );

        localStorage.setItem(
          'userRole',
          result.user.role
        );

        localStorage.setItem(
          'userName',
          result.user.name
        );

        localStorage.setItem(
          'userEmail',
          result.user.email
        );

        // NAVIGATE TO DASHBOARD

        this.router.navigate(['/dashboard']);
      },

      error: (error) => {
        console.error('Google login error:', error);

        this.loginError =
          error?.error?.message ??
          'Google login failed. Please try again.';

        this.cdr.detectChanges();
      }
    });
  }
}