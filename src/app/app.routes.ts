import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/pages/login/login.component';

export const routes: Routes = [
  // 1. Al entrar, manda al login de una vez
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // 2. Ruta directa al componente
  { path: 'login', component: LoginComponent },

  // 3. Ruta para el área comercial (Lazy Loading)
  {
    path: 'comercial',
    loadChildren: () => import('./modules/area-estrategia-desarrollo-comercial/comercial.routes').then(m => m.COMERCIAL_ROUTES)
  },

  // 4. Cualquier otra cosa, al login
  { path: '**', redirectTo: 'login' }
];