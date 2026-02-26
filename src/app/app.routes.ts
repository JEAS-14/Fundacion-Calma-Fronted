import { Routes } from '@angular/router';

/**
 * Rutas principales de la aplicación
 * Arquitectura modular con lazy loading
 */
export const routes: Routes = [
  // 1. Módulo Público (Login)
  {
    path: 'auth',
    loadChildren: () => 
      import('./modules/auth/auth-module').then(m => m.AuthModule)
  },
  
  // 2. Módulos Privados / Protegidos
  {
    path: 'comercial',
    loadChildren: () => 
      import('./modules/area-estrategia-desarrollo-comercial/comercial.routes').then(m => m.COMERCIAL_ROUTES)
    // TODO: Más adelante agregaremos un "canActivate: [AuthGuard]" aquí
  },
  
  // TODO: Agregar más módulos (académico, financiero, rrhh, etc.)

  // 3. Redirección por defecto al Login
  {
    path: '',
    redirectTo: 'auth', // O 'auth/login' dependiendo de cómo configures las rutas hijas del auth
    pathMatch: 'full'
  },

  // 4. Ruta comodín (Catch-all) por si escriben una URL que no existe
  {
    path: '**',
    redirectTo: 'auth'
  }
];