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
  todasLasAreas: any[] = [];
  subareasDisponibles: any[] = [];
  minDate: string = '';
  maxDate: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private registroService: RegistroService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      rol: ['usuario', Validators.required],
      area_id: [null, Validators.required], // Por defecto requerido para usuario/director
      subarea_id: [null],
      puesto: [''],
      fecha_fin_contrato: ['']
    });

    this.registroForm.get('rol')?.valueChanges.subscribe(rol => {
      const areaControl = this.registroForm.get('area_id');
      const subareaControl = this.registroForm.get('subarea_id');
      if (rol === 'admin') {
        areaControl?.clearValidators();
        areaControl?.setValue(null);
        subareaControl?.setValue(null);
      } else {
        areaControl?.setValidators(Validators.required);
      }
      areaControl?.updateValueAndValidity();
    });

    this.registroForm.get('area_id')?.valueChanges.subscribe(areaId => {
      this.registroForm.get('subarea_id')?.setValue(null);
      if (areaId) {
        const areaSeleccionada = this.todasLasAreas.find(a => a.id === Number(areaId));
        this.subareasDisponibles = areaSeleccionada?.subareas || [];
      } else {
        this.subareasDisponibles = [];
      }
    });
  }

  ngOnInit(): void {
    const hoy = new Date();
    this.minDate = hoy.toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 10);
    this.maxDate = maxDate.toISOString().split('T')[0];

    // Protección adicional: si por alguna razón entra alguien que no es admin, lo expulsamos
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.cargarAreas();
  }

  cargarAreas(): void {
    this.registroService.getAreas().subscribe(areas => {
      this.todasLasAreas = areas;
      // Re-trigger value change just in case area_id is already set
      const areaId = this.registroForm.get('area_id')?.value;
      if (areaId) {
        const areaSeleccionada = this.todasLasAreas.find(a => a.id === Number(areaId));
        this.subareasDisponibles = areaSeleccionada?.subareas || [];
      }
    });
  }

  onInputLetras(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const valorOriginal = input.value;
    // Solo permitimos letras, acentos y espacios
    const valorLimpio = valorOriginal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    
    if (valorOriginal !== valorLimpio) {
      input.value = valorLimpio;
      this.registroForm.get(controlName)?.setValue(valorLimpio);
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
    const areaId = userData.area_id;
    const subareaId = userData.subarea_id;
    delete userData.area_id; // Frontend cleanup, register payload doesnt need area_id
    delete userData.subarea_id;
    
    // El backend ahora pide enviar cadena vacía en lugar de null/omitir
    if (!userData.fecha_fin_contrato) {
      userData.fecha_fin_contrato = "";
    }
    if (!userData.puesto) {
      userData.puesto = "";
    }

    this.registroService.register(userData).subscribe({
      next: (response: any) => {
        const nuevoUsuarioId = response.usuario?.id;
        const rolSeleccionado = userData.rol;
        
        if (nuevoUsuarioId && rolSeleccionado !== 'admin' && areaId) {
          this.registroService.asignarAreaUsuario(nuevoUsuarioId, areaId, subareaId).subscribe({
            next: () => this.finalizarExito(),
            error: (err) => {
              this.cargando = false;
              this.mensaje = {
                tipo: 'error',
                texto: 'Usuario creado correctamente, pero hubo un error al asignarle el área. Ve a Editar Usuario para corregirlo.'
              };
              console.error('Error asignando área:', err);
            }
          });
        } else {
          this.finalizarExito();
        }
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

  finalizarExito(): void {
    this.cargando = false;
    this.mensaje = {
      tipo: 'exito',
      texto: 'Usuario creado exitosamente con sus accesos. Se ha enviado un correo con instrucciones.'
    };
    this.registroForm.reset({ rol: 'usuario', puesto: '', fecha_fin_contrato: '', nombre: '', apellido: '', email: '', area_id: null, subarea_id: null });
  }
}
