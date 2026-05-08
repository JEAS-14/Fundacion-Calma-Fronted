import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  Notificacion,
  NotificacionesService,
  TipoNotificacion,
} from '../../services/notificaciones.service';

type TipoToast = 'success' | 'error';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.scss'],
})
export class Notificaciones implements OnInit, OnDestroy {
  private service = inject(NotificacionesService);
  private notificacionTimeout: ReturnType<typeof setTimeout> | null = null;

  mostrarConfirmacion = false;
  idAEliminar: number | null = null;
  filtroSeleccionado: TipoNotificacion = 'comunicados';
  notificacionToast: { tipo: TipoToast; mensaje: string } | null = null;

  notificaciones: Notificacion[] = [];
  notificacionSeleccionada: Notificacion | null = null;

  mostrarFormulario = false;
  archivoImagen: File | null = null;
  guardando = false;

  form = {
    titulo: '',
    mensaje: '',
    enlace: '',
    firma: 'Fundacion Calma',
    tipo: 'comunicados' as TipoNotificacion,
    imagen: null as string | null,
  };

  ngOnInit() {
    this.cargarNotificaciones();
  }

  ngOnDestroy(): void {
    if (this.notificacionTimeout) {
      clearTimeout(this.notificacionTimeout);
    }
  }

  cargarNotificaciones(): void {
    this.service.listar().subscribe({
      next: (data) => {
        this.notificaciones = data;
      },
      error: (err) => console.error('Error al cargar notificaciones:', err),
    });
  }

  get cantidadNoLeidas(): number {
    return this.notificaciones.filter((n) => !n.leido).length;
  }

  get notificacionesFiltradas(): Notificacion[] {
    return this.notificaciones.filter((n) => n.tipo === this.filtroSeleccionado);
  }

  cambiarFiltro(filtro: TipoNotificacion): void {
    this.filtroSeleccionado = filtro;
  }

  abrirDetalle(n: Notificacion): void {
    this.notificacionSeleccionada = n;

    if (!n.leido) {
      this.service.marcarLeido(n.id, true).subscribe({
        next: () => {
          this.notificaciones = this.notificaciones.map((item) =>
            item.id === n.id ? { ...item, leido: true } : item,
          );
          this.service.notificarCambio();
        },
        error: (err) => console.error(err),
      });
    }
  }

  cerrarModal(): void {
    this.notificacionSeleccionada = null;
  }

  toggleLeido(n: Notificacion): void {
    const nuevoEstado = !n.leido;

    this.service.marcarLeido(n.id, nuevoEstado).subscribe({
      next: () => {
        this.notificaciones = this.notificaciones.map((item) =>
          item.id === n.id ? { ...item, leido: nuevoEstado } : item,
        );
        this.service.notificarCambio();
      },
      error: (err) => console.error(err),
    });
  }

  eliminarNotificacion(id: number): void {
    this.service.eliminar(id).subscribe({
      next: () => {
        this.notificaciones = this.notificaciones.filter((n) => n.id !== id);
        this.service.notificarCambio();
        this.mostrarNotificacion('success', 'Notificacion eliminada correctamente.');
      },
      error: (err) => {
        console.error(err);
        this.mostrarNotificacion('error', err?.error?.message || 'Error al eliminar la notificacion.');
      },
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;

    if (this.mostrarFormulario) {
      this.form = {
        titulo: '',
        mensaje: '',
        enlace: '',
        firma: 'Fundacion Calma',
        tipo: 'comunicados',
        imagen: null,
      };

      this.archivoImagen = null;
      this.guardando = false;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.archivoImagen = file;
    this.form.imagen = file.name;
    input.value = '';
  }

  guardarNotificacion(): void {
    if (!this.form.titulo.trim() || !this.form.mensaje.trim()) {
      this.mostrarNotificacion('error', 'Completa titulo y descripcion.');
      return;
    }

    const formData = new FormData();
    formData.append('titulo', this.form.titulo.trim());
    formData.append('mensaje', this.construirMensaje());
    formData.append('tipo', 'comunicados');

    if (this.archivoImagen) {
      formData.append('imagen', this.archivoImagen);
    }

    this.guardando = true;

    this.service.crear(formData).subscribe({
      next: () => {
        this.cargarNotificaciones();
        this.service.notificarCambio();
        this.form = {
          titulo: '',
          mensaje: '',
          enlace: '',
          firma: 'Fundacion Calma',
          tipo: 'comunicados',
          imagen: null,
        };
        this.archivoImagen = null;
        this.mostrarFormulario = false;
        this.guardando = false;
        this.mostrarNotificacion('success', 'Notificacion creada correctamente.');
      },
      error: (err) => {
        console.error('Error al crear notificacion:', err);
        this.guardando = false;
        this.mostrarNotificacion('error', err?.error?.message || 'Error al publicar notificacion.');
      },
    });
  }

  mostrarNotificacion(tipo: TipoToast, mensaje: string): void {
    if (this.notificacionTimeout) {
      clearTimeout(this.notificacionTimeout);
    }

    this.notificacionToast = { tipo, mensaje };
    this.notificacionTimeout = setTimeout(() => {
      this.notificacionToast = null;
      this.notificacionTimeout = null;
    }, 3500);
  }

  cerrarNotificacion(): void {
    if (this.notificacionTimeout) {
      clearTimeout(this.notificacionTimeout);
      this.notificacionTimeout = null;
    }

    this.notificacionToast = null;
  }

  abrirConfirmacion(id: number, event: Event): void {
    event.stopPropagation();
    this.idAEliminar = id;
    this.mostrarConfirmacion = true;
  }

  cancelarEliminar(): void {
    this.mostrarConfirmacion = false;
    this.idAEliminar = null;
  }

  confirmarEliminar(): void {
    if (this.idAEliminar !== null) {
      this.eliminarNotificacion(this.idAEliminar);
    }

    this.cancelarEliminar();
  }

  mensajePrincipal(n: Notificacion | null): string {
    if (!n?.mensaje) {
      return '';
    }

    return n.mensaje
      .split('\n')
      .filter((linea) => !this.esLineaFirma(linea) && !this.esLineaEnlace(linea))
      .join('\n')
      .trim();
  }

  firmaNotificacion(n: Notificacion | null): string | null {
    const linea = this.obtenerLinea(n, (value) => this.esLineaFirma(value));
    return linea ? linea.replace(/^Atte\.?\s*/i, '').trim() : null;
  }

  enlaceNotificacion(n: Notificacion | null): string | null {
    const linea = this.obtenerLinea(n, (value) => this.esLineaEnlace(value));
    const enlace = linea
      ? linea.replace(/^Enlace:\s*/i, '').trim()
      : this.extraerUrl(n?.mensaje ?? '');

    return enlace || null;
  }

  resumenMensaje(n: Notificacion): string {
    const mensaje = this.mensajePrincipal(n);
    return mensaje.length > 180 ? `${mensaje.slice(0, 180).trim()}...` : mensaje;
  }

  esSistema(n: Notificacion | null): boolean {
    return n?.tipo === 'sistema';
  }

  apartadoSistema(n: Notificacion | null): string {
    const texto = `${n?.titulo ?? ''} ${n?.mensaje ?? ''}`.toLowerCase();

    if (texto.includes('convenio')) {
      return 'Convenios';
    }

    if (texto.includes('actividad') || texto.includes('tarea')) {
      return 'Actividades';
    }

    if (texto.includes('archivo') || texto.includes('documento') || texto.includes('repositorio')) {
      return 'Repositorio';
    }

    if (texto.includes('usuario')) {
      return 'Usuarios';
    }

    return 'Sistema';
  }

  private construirMensaje(): string {
    const partes = [this.form.mensaje.trim()];
    const firma = this.form.firma.trim();
    const enlace = this.normalizarUrl(this.form.enlace.trim());

    if (firma) {
      partes.push(`Atte. ${firma}`);
    }

    if (enlace) {
      partes.push(`Enlace: ${enlace}`);
    }

    return partes.join('\n\n');
  }

  private normalizarUrl(url: string): string {
    if (!url) {
      return '';
    }

    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }

  private obtenerLinea(
    n: Notificacion | null,
    predicate: (linea: string) => boolean,
  ): string | null {
    return n?.mensaje?.split('\n').find((linea) => predicate(linea.trim())) ?? null;
  }

  private esLineaFirma(linea: string): boolean {
    return /^Atte\.?\s+/i.test(linea.trim());
  }

  private esLineaEnlace(linea: string): boolean {
    const value = linea.trim();
    return /^Enlace:\s*/i.test(value) || /^https?:\/\/\S+$/i.test(value);
  }

  private extraerUrl(texto: string): string | null {
    return texto.match(/https?:\/\/\S+/i)?.[0] ?? null;
  }
}
