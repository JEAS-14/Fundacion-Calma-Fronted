import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/pages/login/login.component';
import { LogoutComponent } from './modules/auth/pages/logout/logout.component';
import { authGuard, adminGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './shared/layouts/dashboard/dashboard.component';
import { AdminDashboardComponent } from './shared/layouts/dashboard/pages/admin/admin.component';
import { UserDashboardComponent } from './shared/layouts/dashboard/pages/user/user.component';

export const routes: Routes = [
  // 1. Redirigir raíz al login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // 2. Login (sin protección)
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },

  // 3. Dashboard protegido con el layout
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      // Dashboard de Admin (solo admins)
      {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [adminGuard]
      },
      // Dashboard de Usuario (cualquier usuario autenticado)
      {
        path: 'usuario',
        component: UserDashboardComponent,
        canActivate: [authGuard]
      },
      // Redirigir dashboard raíz según el rol
      {
        path: '',
        redirectTo: 'usuario',
        pathMatch: 'full'
      }
    ]
  },

  // 4. Comercial con Lazy Loading
  {
    path: 'comercial',
    loadChildren: () => import('./modules/area-estrategia-desarrollo-comercial/comercial.routes').then(m => m.COMERCIAL_ROUTES),
    canActivate: [authGuard]
  },

  // 5. Comodín
  { path: '**', redirectTo: 'login' }
];