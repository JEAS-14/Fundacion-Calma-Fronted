import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  template: `
    <div class="admin-container">
      <h1>🔐 Panel de Administración</h1>
      <p>Bienvenido, {{ userName }}!</p>
      
      <div class="admin-cards">
        <div class="card">
          <h3>📊 Estadísticas</h3>
          <p>Ver datos generales del sistema</p>
        </div>
        <div class="card">
          <h3>👥 Usuarios</h3>
          <p>Gestionar usuarios del sistema</p>
        </div>
        <div class="card">
          <h3>⚙️ Configuración</h3>
          <p>Ajustes del sistema</p>
        </div>
      </div>
    </div>
  `,
  styleUrl: './admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent {
  authService = inject(AuthService);
  userName = this.authService.getCurrentUser()?.nombre || 'Admin';
}
