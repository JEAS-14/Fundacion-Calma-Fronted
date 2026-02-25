import { Routes } from '@angular/router';

/**
 * Rutas principales de la aplicación
 * Arquitectura modular con lazy loading
 */
export const routes: Routes = [
  {
    path: 'comercial',
    loadChildren: () => 
      import('./modules/area-estrategia-desarrollo-comercial/comercial.routes').then(m => m.COMERCIAL_ROUTES)
  },
  // TODO: Agregar más módulos (académico, financiero, rrhh, etc.)
  {
    path: '',
    redirectTo: 'comercial',
    pathMatch: 'full'
  }
];
