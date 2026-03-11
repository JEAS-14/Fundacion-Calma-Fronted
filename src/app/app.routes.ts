import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './modules/auth/services/auth.service';
import { LoginComponent } from './modules/auth/pages/login/login.component';
import { LogoutComponent } from './modules/auth/pages/logout/logout.component';
import { authGuard, adminGuard } from './core/guards/auth.guard';
import { AdminComponent } from './modules/dashboard/pages/admin/admin.component';
import { UserComponent } from './modules/dashboard/pages/user/user.component';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout';

// Nuevos componentes importados
import { ComunicacionesComponent } from './modules/comunicaciones/pages/comunicaciones/comunicaciones.component';
import { ComunidadComponent } from './modules/comunidad/pages/comunidad/comunidad.component';
import { RepositorioComponent } from './modules/repositorio/pages/repositorio/repositorio.component';
import { SalasTrabajoComponent } from './modules/salas-trabajo/pages/salas-trabajo/salas-trabajo.component';
import { NotificacionesComponent } from './modules/notificaciones/pages/notificaciones/notificaciones.component';

export const routes: Routes = [
  // 1. Redirigir raíz al login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 2. Login (sin protección)
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },

  // 3. Dashboard protegido con el layout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        children: [
          // Dashboard de Admin (solo admins)
          {
            path: 'admin',
            component: AdminComponent,
            canActivate: [adminGuard],
          },
          // Dashboard de Usuario (cualquier usuario autenticado)
          {
            path: 'usuario',
            component: UserComponent,
            canActivate: [authGuard],
          },
          {
            path: 'comercial',
            loadChildren: () =>
              import('./modules/area-estrategia-desarrollo-comercial/comercial.routes').then(
                (m) => m.COMERCIAL_ROUTES,
              ),
          },
          // Redirigir dashboard raíz según el rol
          {
            path: '',
            redirectTo: () => {
              const authService = inject(AuthService);
              return authService.isAdmin() ? 'admin' : 'usuario';
            },
            pathMatch: 'full',
          },
        ]
      },
      // Nuevas rutas agregadas del Sidebar
      {
        path: 'comunicaciones',
        component: ComunicacionesComponent
      },
      {
        path: 'comunidad-calma',
        component: ComunidadComponent
      },
      {
        path: 'repositorio',
        component: RepositorioComponent
      },
      {
        path: 'salas-trabajo',
        component: SalasTrabajoComponent
      },
      {
        path: 'notificaciones',
        component: NotificacionesComponent
      }
    ],
  },

  // 5. Comodín
  { path: '**', redirectTo: 'login' },
];