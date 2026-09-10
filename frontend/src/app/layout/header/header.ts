
import { Component, inject } from '@angular/core';

import { Router } from '@angular/router';

@Component({

  selector: 'app-header',

  standalone: true,

  imports: [],

  templateUrl: './header.html',

  styleUrl: './header.css'

})

export class HeaderComponent {

  private readonly router = inject(Router);

  // PROFILE MENU

  showProfileMenu = false;

  
  // TOGGLE PROFILE MENU

  toggleProfileMenu(): void {

    this.showProfileMenu =
      !this.showProfileMenu;

  }

  // LOGOUT

  Logout(): void{
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');

    this.showProfileMenu = false;
    this.router.navigate(['/login']);

  }
}