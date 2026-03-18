import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NotificacionesService } from '../../services/notificaciones.service';

export type TipoNotificacion = 'comunicado' | 'alerta';

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  creado_at: Date;
  leido: boolean;
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.scss'],
})
export class Notificaciones implements OnInit {

  filtroSeleccionado: 'todos' | TipoNotificacion = 'todos';
  notificaciones: Notificacion[] = [];

  notificacionSeleccionada: Notificacion | null = null;

  constructor(private service: NotificacionesService) {}

  ngOnInit(): void {
    this.cargarNotificaciones();
  }

  cargarNotificaciones(): void {
    this.service.listar().subscribe({
      next: (data) => {
        this.notificaciones = data;
      },
      error: (err) => {
        console.error('Error cargando notificaciones', err);
      }
    });
  }

  get cantidadNoLeidas(): number {
    return this.notificaciones.filter(n => !n.leido).length;
  }


  cambiarFiltro(filtro: 'todos' | TipoNotificacion): void {
    this.filtroSeleccionado = filtro;
  }

  get notificacionesFiltradas(): Notificacion[] {
    if (this.filtroSeleccionado === 'todos') {
      return this.notificaciones;
    }
    return this.notificaciones.filter(n => n.tipo === this.filtroSeleccionado);
  }

  toggleLeido(n: Notificacion): void {
    const nuevoEstado = !n.leido;

    this.service.marcarLeido(n.id, nuevoEstado).subscribe({
      next: () => {
        n.leido = nuevoEstado;
      },
      error: (err) => {
        console.error('Error al cambiar estado', err);
      }
    });
  }

  eliminarNotificacion(id: number): void {
    this.service.eliminar(id).subscribe({
      next: () => {
        this.notificaciones = this.notificaciones.filter(n => n.id !== id);
      },
      error: (err) => {
        console.error('Error al eliminar', err);
      }
    });
  }

  crearNotificacion(): void {
    const nueva = {
      titulo: 'Prueba ' + new Date().getTime(),
      mensaje: 'Mensaje de prueba',
      tipo: 'comunicado'
    };

    this.service.crear(nueva).subscribe({
      next: () => {
        this.cargarNotificaciones();
      },
      error: (err) => {
        console.error('Error al crear', err);
      }
    });
  }

  abrirDetalle(n: Notificacion): void {
    console.log('CLICK ', n);
    this.notificacionSeleccionada = n;
  }

  cerrarModal(): void {
    this.notificacionSeleccionada = null;
  }

}