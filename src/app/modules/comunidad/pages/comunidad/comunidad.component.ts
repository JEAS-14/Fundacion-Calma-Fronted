import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comunidad',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2>Comunidad Calma</h2>
      <p>Módulo en construcción...</p>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
  `]
})
export class ComunidadComponent {}
