import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  template: `
    <div class="user-container">
      <h1>📋 Mi Panel</h1>
      <p>Bienvenido, {{ userName }}!</p>
      
      <div class="user-cards">
        <div class="card">
          <h3>📝 Mis Solicitudes</h3>
          <p>Ver mis solicitudes pendientes</p>
        </div>
        <div class="card">
          <h3>📅 Calendario</h3>
          <p>Ver actividades programadas</p>
        </div>
        <div class="card">
          <h3>💬 Notificaciones</h3>
          <p>Ver mis notificaciones</p>
        </div>
      </div>
    </div>
  `,
  styleUrl: './user.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDashboardComponent {
  authService = inject(AuthService);
  userName = this.authService.getCurrentUser()?.nombre || 'Usuario';
}
