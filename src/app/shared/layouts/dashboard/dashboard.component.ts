import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { AuthService } from '../../../modules/auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, RouterOutlet],
  template: `
    <div class="dashboard-container">
      <app-sidebar></app-sidebar>
      
      <main class="dashboard-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  authService = inject(AuthService);
  
  // Obtener el rol del usuario actual
  userRole = this.authService.getUserRole();
  userName = this.authService.getCurrentUser()?.nombre;
}
