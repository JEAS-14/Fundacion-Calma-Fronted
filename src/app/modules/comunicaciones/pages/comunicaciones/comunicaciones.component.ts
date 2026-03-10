import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comunicaciones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2>Comunicaciones</h2>
      <p>Módulo en construcción...</p>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
  `]
})
export class ComunicacionesComponent {}
