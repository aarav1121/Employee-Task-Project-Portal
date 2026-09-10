import { Routes } from '@angular/router';

import { ShellComponent } from './layout/shell/shell';

export const routes: Routes = [

  // LOGIN
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login')
        .then(m => m.LoginComponent)
  },

  // APPLICATION
  {
    path: '',
    component: ShellComponent,

    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // DASHBOARD
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.DashboardComponent)
      },

      // USER LIST
      {
        path: 'usersList',
        loadComponent: () =>
          import('./features/userlist/userlist')
            .then(m => m.Userlist)
      },

      // TASKS
      {
        path: 'tasks',
        loadComponent: () =>
          import('./features/tasks/tasks')
            .then(m => m.TasksComponent)
      }

    ]
  },

  // UNKNOWN ROUTES
  {
    path: '**',
    redirectTo: 'login'
  }

];