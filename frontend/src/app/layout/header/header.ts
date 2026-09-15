import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {

  // SERVICES

  private authService = inject(AuthService);

  private platformId = inject(PLATFORM_ID);

  // USER MENU

  showUserMenu = false;

  // USER INFORMATION

  userName = 'User';

  userRole = 'Team Lead';

  // AVATAR

  get userInitial(): string {
    return this.userName
      .charAt(0)
      .toUpperCase();
  }

  // COMPONENT INITIALIZATION

  ngOnInit(): void {

    if (
      isPlatformBrowser(this.platformId)
    ) {

      this.userName =
        localStorage.getItem('userName') ||
        'User';

      this.userRole =
        localStorage.getItem('userRole') ||
        'Team Lead';

    }

  }

  // TOGGLE MENU

  toggleUserMenu(): void {
    this.showUserMenu =
      !this.showUserMenu;
  }

  // CLOSE MENU

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  // PROFILE

  openProfile(): void {
    this.closeUserMenu();

    console.log('Profile clicked');
  }

  // LOGOUT

  logout(): void {
    this.authService.logout();
  }

}