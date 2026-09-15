import { Component, inject } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class SettingsComponent {

  // SERVICES

  private authService = inject(AuthService);

  // LOGOUT

  logout(): void {
    this.authService.logout();
  }

}