import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../modules/auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  // estado del submenú comercial
  isComercialOpen = false;

  toggleComercial(): void {
    this.isComercialOpen = !this.isComercialOpen;
  }

  cerrarSesion(): void {
    console.log('🔐 Iniciando cierre de sesión...');

    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
