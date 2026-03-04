import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../modules/auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  // ✅ Inyectamos los servicios usando inject()
  private router = inject(Router);
  private authService = inject(AuthService);

  // 🆕 Método para cerrar sesión
  cerrarSesion(): void {
    console.log('🔐 Iniciando cierre de sesión...');
    
    // 1. Llamamos al servicio para limpiar el token
    this.authService.logout();
    
    // 2. Redirigimos al login
    this.router.navigate(['/login']);
  }
}

