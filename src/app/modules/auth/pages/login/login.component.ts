import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  standalone: true, // <--- Esto es vital en Angular 18
  imports: [CommonModule, ButtonModule],
  templateUrl: './login.component.html', // Verifica que el archivo sea .html
  styleUrls: ['./login.component.scss']   // Verifica que el archivo sea .scss
})
export class LoginComponent { }