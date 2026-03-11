import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. Importamos las herramientas necesarias para los formularios y el calendario
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  // 2. Metemos las herramientas en la maleta de "imports"
  imports: [CommonModule, FormsModule, DatePicker],
  templateUrl: './user.component.html',
  styleUrls: ['./user.scss']
})
export class UserComponent {
  // 3. Creamos la variable que el HTML está buscando para marcar el día de hoy
  fechaActual: Date = new Date();
}