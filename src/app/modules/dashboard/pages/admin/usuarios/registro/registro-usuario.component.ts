import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../auth/services/auth.service';
import { RegistroService } from './services/registro.service';

@Component({
  selector: 'app-registro-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-usuario.component.html',
  styleUrls: ['./registro-usuario.component.scss']
})
export class RegistroUsuarioComponent implements OnInit {
  registroForm: FormGroup;
  cargando = false;
  mensaje: { tipo: 'exito' | 'error', texto: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private registroService: RegistroService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      rol: ['usuario', Validators.required],
      puesto: [''],
      fecha_fin_contrato: ['']
    });
  }

  ngOnInit(): void {
    // Protección adicional: si por alguna razón entra alguien que no es admin, lo expulsamos
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensaje = null;

    const userData = { ...this.registroForm.value };
    
    // El backend ahora pide enviar cadena vacía en lugar de null/omitir
    if (!userData.fecha_fin_contrato) {
      userData.fecha_fin_contrato = "";
    }
    if (!userData.puesto) {
      userData.puesto = "";
    }

    this.registroService.register(userData).subscribe({
      next: (response: any) => {
        this.cargando = false;
        this.mensaje = {
          tipo: 'exito',
          texto: 'Usuario creado exitosamente. Se ha enviado un correo con instrucciones.'
        };
        this.registroForm.reset({ rol: 'usuario' }); // Limpiar formu y dejar rol default
      },
      error: (err: any) => {
        this.cargando = false;
        let msjError = 'Ocurrió un error inesperado al crear el usuario.';
        
        if (err.status === 409) msjError = 'Este correo electrónico ya está registrado.';
        if (err.status === 401 || err.status === 403) msjError = 'Acceso denegado: No tienes permisos de administrador.';
        
        this.mensaje = { tipo: 'error', texto: msjError };
        console.error('Error en registro:', err);
      }
    });
  }
}
