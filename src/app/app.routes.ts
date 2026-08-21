import { Routes } from '@angular/router';

import { ShellComponent } from './layout/shell/shell';

export const routes: Routes = [

  {
    path: '',
    component: ShellComponent,

    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.DashboardComponent)
      },

      {
        path: 'tasks',
        loadComponent: () =>
          import('./features/tasks/tasks')
            .then(m => m.TasksComponent)
      }

    ]
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }

];