import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConveniosService, ConvenioDto } from './convenios.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-desarrollo-comercial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './desarrollo-comercial.html',
  styleUrl: './desarrollo-comercial.scss',
})
export class DesarrolloComercial implements OnInit {
  vistaActual: 'convenios' | 'actividades' = 'convenios';
  estadoSeleccionado: Estado = 'pendiente';
  filtroActividad: FiltroActividad = 'todos';
  busqueda = '';
  mostrandoFormularioActividad = false;
  actividadEnEdicion: ActividadForm = this.crearActividadForm();
  @ViewChild('logoInput') logoInputRef?: ElementRef<HTMLInputElement>;

  conveniosOriginal: Convenio[] = [];
  actividadesOriginal: Actividad[] = [];
  page = 1;
  readonly pageSize = 12;
  convenioSeleccionado: Convenio | null = null;
  convenioPorEliminar: Convenio | null = null;
  nuevoComentario = '';
  usuarioActual = 'Deivi Flores';
  editMode = false;
  esNuevo = false;
  intentoGuardar = false;
  private logoObjectUrl?: string;
  private readonly storageKey = 'convenios-data';
  private readonly storageSelectedKey = 'convenio-seleccionado-id';
  private readonly defaultAreaId = 13;
  estadosDisponibles: Estado[] = [
    'pendiente',
    'proceso',
    'convenio',
    'reunion',
    'firmado',
    'cancelado',
  ];
  filtroConexion: ConexionFiltro = 'todos';
  tiposInstitucion: string[] = [
    'Ministerio',
    'Gobierno regional',
    'Municipalidad',
    'Empresa privada',
    'ONG',
    'UGEL',
    'Persona',
    'Organismo público',
    'Asociación civil',
    'Venue',
  ];
  tiposConexion: string[] = ['Convenio', 'Alianza'];
  constructor(
    private conveniosService: ConveniosService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.cargarConvenios();
  }

  get conveniosFiltrados(): Convenio[] {
    const term = this.busqueda.trim().toLowerCase();
    return this.conveniosOriginal.filter(
      (c) =>
        c.estado === this.estadoSeleccionado &&
        (term ? c.nombre.toLowerCase().includes(term) : true) &&
        (this.filtroConexion === 'todos'
          ? true
          : (c.conexion ?? '').toLowerCase() === this.filtroConexion.toLowerCase()),
    );
  }

  get actividadesFiltradas(): Actividad[] {
    const term = this.busqueda.trim().toLowerCase();
    return this.actividadesOriginal.filter(
      (actividad) =>
        (this.filtroActividad === 'todos' ? true : actividad.estado === this.filtroActividad) &&
        (term
          ? actividad.titulo.toLowerCase().includes(term) ||
            actividad.descripcion.toLowerCase().includes(term)
          : true),
    );
  }

  get totalPaginas(): number {
    const total =
      this.vistaActual === 'convenios'
        ? this.conveniosFiltrados.length
        : this.actividadesFiltradas.length;
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get conveniosPaginados(): Convenio[] {
    const start = (this.page - 1) * this.pageSize;
    return this.conveniosFiltrados.slice(start, start + this.pageSize);
  }

  get actividadesPaginadas(): Actividad[] {
    const start = (this.page - 1) * this.pageSize;
    return this.actividadesFiltradas.slice(start, start + this.pageSize);
  }

  cambiarVista(vista: 'convenios' | 'actividades') {
    this.vistaActual = vista;
    if (vista === 'actividades') {
      this.filtroActividad = 'todos';
    } else {
      this.mostrandoFormularioActividad = false;
    }
    this.setPage(1);
  }

  setPage(p: number) {
    this.page = Math.min(Math.max(1, p), this.totalPaginas);
  }

  nextPage() {
    this.setPage(this.page + 1);
  }

  prevPage() {
    this.setPage(this.page - 1);
  }

  setFiltro(estado: Estado) {
    this.estadoSeleccionado = estado;
    if (this.vistaActual === 'convenios') {
      this.cargarConvenios(this.busqueda, this.estadoSeleccionado);
    }
    this.setPage(1);
  }

  setConexionFiltro(valor: ConexionFiltro) {
    this.filtroConexion = valor;
    this.setPage(1);
  }

  setFiltroActividad(valor: FiltroActividad) {
    this.filtroActividad = valor;
    this.setPage(1);
  }

  onBuscar() {
    this.setPage(1);
    if (this.vistaActual === 'convenios') {
      this.cargarConvenios(this.busqueda, this.estadoSeleccionado);
    }
  }

  ejecutarAccionPrincipal() {
    if (this.vistaActual === 'convenios') {
      this.crearNuevoConvenio();
      return;
    }

    this.abrirFormularioActividad();
  }

  abrirFormularioActividad() {
    this.mostrandoFormularioActividad = true;
    this.actividadEnEdicion = this.crearActividadForm();
  }

  cancelarFormularioActividad() {
    this.mostrandoFormularioActividad = false;
    this.actividadEnEdicion = this.crearActividadForm();
  }

  agregarEnlaceActividad() {
    this.actividadEnEdicion = {
      ...this.actividadEnEdicion,
      enlaces: [...this.actividadEnEdicion.enlaces, { nombre: '', url: '' }],
    };
  }

  guardarActividad() {
    if (
      !this.actividadEnEdicion.titulo.trim() ||
      !this.actividadEnEdicion.descripcion.trim() ||
      !this.actividadEnEdicion.fechaLimite
    ) {
      return;
    }

    const nuevaActividad: Actividad = {
      id: `act-${Date.now()}`,
      titulo: this.actividadEnEdicion.titulo.trim(),
      descripcion: this.actividadEnEdicion.descripcion.trim(),
      fechaLimite: this.formatearFechaActividad(this.actividadEnEdicion.fechaLimite),
      estado: this.actividadEnEdicion.estado,
      enlaces: this.actividadEnEdicion.enlaces.filter(
        (enlace) => enlace.nombre.trim() || enlace.url.trim(),
      ),
    };

    this.actividadesOriginal = [nuevaActividad, ...this.actividadesOriginal];
    this.mostrandoFormularioActividad = false;
    this.actividadEnEdicion = this.crearActividadForm();
    this.setPage(1);
  }

  private crearActividadForm(): ActividadForm {
    return {
      titulo: '',
      descripcion: '',
      estado: 'pendiente',
      fechaLimite: '',
      enlaces: [{ nombre: '', url: '' }],
    };
  }

  private formatearFechaActividad(fechaIso: string): string {
    const [year, month, day] = fechaIso.split('-');
    return `${day}/${month}/${year}`;
  }

  crearNuevoConvenio() {
    const provisionalId = `nuevo-${Date.now()}`;
    const base: Convenio = {
      id: provisionalId,
      nombre: '',
      fecha: '',
      siglas: '',
      color: this.colorFromSeed(),
      estado: 'pendiente',
      ruc: '',
      rubro: '',
      contacto: '',
      telefono: '',
      tipo: this.tiposInstitucion[0],
      conexion: this.tiposConexion[0],
      comentarios: [],
      historial: [],
      archivoAdjunto: undefined,
    };
    this.convenioSeleccionado = this.normalizarConvenio(base);
    this.editMode = true;
    this.esNuevo = true;
    this.intentoGuardar = false;
    this.nuevoComentario = '';
    this.persistirSeleccion(this.idConvenio(this.convenioSeleccionado));
  }

  abrirDetalle(convenio: Convenio) {
    this.convenioSeleccionado = {
      ...convenio,
      comentarios: convenio.comentarios ? convenio.comentarios.map((c) => ({ ...c })) : [],
      historial: convenio.historial ? [...convenio.historial] : [],
      archivoAdjunto: convenio.archivoAdjunto ? { ...convenio.archivoAdjunto } : undefined,
    };
    this.nuevoComentario = '';
    this.editMode = false;
    this.esNuevo = false;
    this.intentoGuardar = false;
    this.persistirSeleccion(this.idConvenio(convenio));
    this.hidratarArchivoAdjunto(this.idConvenio(convenio));
    this.hidratarComentarios(this.idConvenio(convenio));
  }

  cerrarDetalle() {
    this.liberarArchivo(this.convenioSeleccionado);
    this.convenioSeleccionado = null;
    this.nuevoComentario = '';
    this.editMode = false;
    this.esNuevo = false;
    this.intentoGuardar = false;
    this.liberarLogo();
    localStorage.removeItem(this.storageSelectedKey);
  }

  onArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file || !this.convenioSeleccionado) return;

    const esPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!esPdf) {
      alert('Solo se permite subir archivos PDF.');
      input.value = '';
      return;
    }

    const convenioId = this.idConvenio(this.convenioSeleccionado);
    const urlArchivo = URL.createObjectURL(file);
    const adjunto = { nombre: file.name, url: urlArchivo, file };

    this.liberarArchivo(this.convenioSeleccionado);
    this.convenioSeleccionado = {
      ...this.convenioSeleccionado,
      archivoAdjunto: adjunto,
    };

    if (/^\d+$/.test(convenioId)) {
      this.subirArchivoAdjunto(convenioId, adjunto);
    }

    input.value = '';
  }

  verArchivo() {
    if (this.convenioSeleccionado?.archivoAdjunto?.url) {
      window.open(this.convenioSeleccionado.archivoAdjunto.url, '_blank');
    }
  }

  eliminarArchivo() {
    if (!this.convenioSeleccionado) return;
    const archivo = this.convenioSeleccionado.archivoAdjunto;
    const limpiarLocal = () => {
      this.liberarArchivo(this.convenioSeleccionado);
      this.convenioSeleccionado = { ...this.convenioSeleccionado!, archivoAdjunto: undefined };
      this.conveniosOriginal = this.conveniosOriginal.map((c) =>
        this.idConvenio(c) === this.idConvenio(this.convenioSeleccionado!)
          ? ({ ...this.convenioSeleccionado! } as Convenio)
          : c,
      );
      this.persistirConvenios();
    };

    if (!archivo?.id) {
      const convenioId = this.idConvenio(this.convenioSeleccionado);
      if (!/^\d+$/.test(convenioId)) {
        limpiarLocal();
        return;
      }

      this.conveniosService.getArchivosByConvenio(convenioId).subscribe((archivos) => {
        const archivoBd = archivos[0];
        if (!archivoBd?.id) {
          limpiarLocal();
          return;
        }

        this.conveniosService.deleteArchivo(archivoBd.id).subscribe({
          next: () => limpiarLocal(),
          error: (error: unknown) => {
            console.error('No se pudo eliminar el archivo', error);
            alert(this.mensajeErrorBackend('No se pudo eliminar el archivo en la BD', error));
          },
        });
      });
      return;
    }

    this.conveniosService.deleteArchivo(archivo.id).subscribe({
      next: () => limpiarLocal(),
      error: (error: unknown) => {
        console.error('No se pudo eliminar el archivo', error);
        alert(this.mensajeErrorBackend('No se pudo eliminar el archivo en la BD', error));
      },
    });
  }

  private eliminarConvenioLocal(convenio: Convenio) {
    const id = this.idConvenio(convenio);
    this.liberarArchivo(convenio);
    this.conveniosOriginal = this.conveniosOriginal.filter((c) => this.idConvenio(c) !== id);

    if (this.convenioSeleccionado && this.idConvenio(this.convenioSeleccionado) === id) {
      this.convenioSeleccionado = null;
      this.nuevoComentario = '';
      this.editMode = false;
      this.esNuevo = false;
      localStorage.removeItem(this.storageSelectedKey);
    }

    this.setPage(Math.min(this.page, this.totalPaginas));
    this.persistirConvenios();
  }

  pedirConfirmarEliminacion(convenio: Convenio, event?: Event) {
    if (event) event.stopPropagation();
    this.convenioPorEliminar = convenio;
  }

  cancelarEliminacion() {
    this.convenioPorEliminar = null;
  }

  confirmarEliminacion() {
    if (!this.convenioPorEliminar) return;
    const convenio = this.convenioPorEliminar;
    const id = this.idConvenio(convenio);

    if (!/^\d+$/.test(id)) {
      this.eliminarConvenioLocal(convenio);
      this.convenioPorEliminar = null;
      return;
    }

    this.conveniosService.deleteConvenio(id).subscribe({
      next: () => {
        this.eliminarConvenioLocal(convenio);
        this.convenioPorEliminar = null;
      },
      error: (error: unknown) => {
        console.error('No se pudo eliminar el convenio', error);
        alert(this.mensajeErrorBackend('No se pudo eliminar el convenio en la BD', error));
      },
    });
  }

  eliminarLogo() {
    if (!this.convenioSeleccionado) return;
    this.liberarLogo();
    const limpio = { ...this.convenioSeleccionado, logo: undefined };
    this.convenioSeleccionado = limpio;
    this.conveniosOriginal = this.conveniosOriginal.map((c) =>
      this.idConvenio(c) === this.idConvenio(limpio) ? ({ ...limpio } as Convenio) : c,
    );
    this.persistirConvenios();
  }

  agregarComentario() {
    if (!this.convenioSeleccionado || !this.nuevoComentario.trim()) return;
    const stamp = this.formatearFecha(new Date());
    const comentario = this.nuevoComentario.trim();
    const textoLocal = `${this.usuarioActual} · ${stamp} · ${comentario}`;
    const id = this.idConvenio(this.convenioSeleccionado);

    this.conveniosService.addComentario(id, comentario).subscribe({
      next: (resp) => {
        this.convenioSeleccionado = {
          ...this.convenioSeleccionado!,
          comentarios: [
            ...(this.convenioSeleccionado?.comentarios || []),
            { id: resp?.id, texto: textoLocal },
          ],
          historial: [
            ...(this.convenioSeleccionado?.historial || []),
            `Comentario agregado · ${this.usuarioActual} · ${stamp}`,
          ],
        };

        this.conveniosOriginal = this.conveniosOriginal.map((c) =>
          this.idConvenio(c) === id ? ({ ...this.convenioSeleccionado! } as Convenio) : c,
        );

        this.nuevoComentario = '';
        this.persistirConvenios();
      },
      error: (error: unknown) => {
        console.error('No se pudo guardar el comentario', error);
        alert(this.mensajeErrorBackend('No se pudo guardar el comentario en la BD', error));
      },
    });
  }

  eliminarComentario(comentario: ComentarioItem) {
    if (!this.convenioSeleccionado) return;
    const stamp = this.formatearFecha(new Date());

    const limpiarLocal = () => {
      this.convenioSeleccionado = {
        ...this.convenioSeleccionado!,
        comentarios: (this.convenioSeleccionado?.comentarios || []).filter((c) => c !== comentario),
        historial: [
          ...(this.convenioSeleccionado?.historial || []),
          `Comentario eliminado · ${this.usuarioActual} · ${stamp}`,
        ],
      };
      this.conveniosOriginal = this.conveniosOriginal.map((c) =>
        this.idConvenio(c) === this.idConvenio(this.convenioSeleccionado!)
          ? ({ ...this.convenioSeleccionado! } as Convenio)
          : c,
      );
      this.persistirConvenios();
    };

    if (!comentario.id) {
      limpiarLocal();
      return;
    }

    this.conveniosService.deleteComentario(comentario.id).subscribe({
      next: () => limpiarLocal(),
      error: (error: unknown) => {
        console.error('No se pudo eliminar el comentario', error);
        alert(this.mensajeErrorBackend('No se pudo eliminar el comentario en la BD', error));
      },
    });
  }

  habilitarEdicion() {
    this.editMode = true;
    this.intentoGuardar = false;
  }

  abrirLogo() {
    this.logoInputRef?.nativeElement.click();
  }

  guardarEdicion() {
    if (!this.convenioSeleccionado) return;
    this.intentoGuardar = true;
    if (!this.formularioConvenioValido()) {
      alert('⚠️ Completa todos los campos obligatorios');
      return;
    }
    const payload = this.toDto(this.convenioSeleccionado);

    if (this.esNuevo) {
      this.conveniosService.createConvenio(payload).subscribe({
        next: (resp) => {
          const nuevo = resp
            ? this.normalizarConvenio(this.mapFromDto(resp))
            : this.normalizarConvenio(payload as Convenio);

          if (this.convenioSeleccionado?.archivoAdjunto?.nombre) {
            nuevo.archivoAdjunto = { ...this.convenioSeleccionado.archivoAdjunto };
          }

          this.conveniosOriginal = [...this.conveniosOriginal, nuevo];
          this.esNuevo = false;
          this.editMode = false;
          this.intentoGuardar = false;
          this.convenioSeleccionado = nuevo;
          this.persistirConvenios();

          const nuevoId = this.idConvenio(nuevo);
          if (/^\d+$/.test(nuevoId) && nuevo.archivoAdjunto?.file) {
            this.subirArchivoAdjunto(nuevoId, nuevo.archivoAdjunto);
          }

          alert('✅ Registrado Correctamente');
        },
        error: (error) => {
          console.error('❌ No se pudo conectar con el servidor', error);
          alert('❌ Error al guardar el convenio en la base de datos');
        },
      });

      return;
    }

    this.conveniosService.updateConvenio(payload).subscribe({
      next: (resp) => {
        const actualizado = resp
          ? this.normalizarConvenio(this.mapFromDto(resp))
          : this.normalizarConvenio(payload as Convenio);
        if (this.convenioSeleccionado?.archivoAdjunto?.nombre) {
          actualizado.archivoAdjunto = { ...this.convenioSeleccionado.archivoAdjunto };
        }
        this.conveniosOriginal = this.conveniosOriginal.map((c) =>
          this.idConvenio(c) === this.idConvenio(actualizado)
            ? ({ ...actualizado } as Convenio)
            : c,
        );
        this.editMode = false;
        this.intentoGuardar = false;
        this.convenioSeleccionado = actualizado;
        this.persistirConvenios();
      },
      error: (error) => {
        console.error('No se pudo actualizar el convenio', error);
        alert('Error al actualizar en la BD');
      },
    });
  }

  formularioConvenioValido(): boolean {
    if (!this.convenioSeleccionado) return false;

    const nombre = this.convenioSeleccionado.nombre.trim();
    const ruc = (this.convenioSeleccionado.ruc ?? '').replace(/\D/g, '');
    const fecha = (this.convenioSeleccionado.fecha ?? '').trim();
    const rubro = (this.convenioSeleccionado.rubro ?? '').trim();
    const contacto = (this.convenioSeleccionado.contacto ?? '').trim();
    const telefono = (this.convenioSeleccionado.telefono ?? '').replace(/\D/g, '');
    const tipo = (this.convenioSeleccionado.tipo ?? '').trim();
    const conexion = (this.convenioSeleccionado.conexion ?? '').trim();
    const estado = (this.convenioSeleccionado.estado ?? '').trim();

    return (
      !!nombre &&
      ruc.length === 11 &&
      !!fecha &&
      !!rubro &&
      !!contacto &&
      telefono.length === 9 &&
      !!tipo &&
      !!conexion &&
      !!estado
    );
  }

  campoInvalido(
    campo:
      | 'nombre'
      | 'ruc'
      | 'estado'
      | 'fecha'
      | 'tipo'
      | 'rubro'
      | 'conexion'
      | 'contacto'
      | 'telefono',
  ): boolean {
    if (!this.intentoGuardar || !this.convenioSeleccionado) return false;

    switch (campo) {
      case 'nombre':
        return !this.convenioSeleccionado.nombre.trim();
      case 'ruc':
        return (this.convenioSeleccionado.ruc ?? '').replace(/\D/g, '').length !== 11;
      case 'estado':
        return !(this.convenioSeleccionado.estado ?? '').trim();
      case 'fecha':
        return !(this.convenioSeleccionado.fecha ?? '').trim();
      case 'tipo':
        return !(this.convenioSeleccionado.tipo ?? '').trim();
      case 'rubro':
        return !(this.convenioSeleccionado.rubro ?? '').trim();
      case 'conexion':
        return !(this.convenioSeleccionado.conexion ?? '').trim();
      case 'contacto':
        return !(this.convenioSeleccionado.contacto ?? '').trim();
      case 'telefono':
        return (this.convenioSeleccionado.telefono ?? '').replace(/\D/g, '').length !== 9;
    }
  }

  onLogoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file || !this.convenioSeleccionado) return;
    const mime = file.type.toLowerCase();
    const nombre = file.name.toLowerCase();
    const esImg =
      mime === 'image/png' ||
      mime === 'image/jpeg' ||
      nombre.endsWith('.png') ||
      nombre.endsWith('.jpg') ||
      nombre.endsWith('.jpeg');
    if (!esImg) {
      alert('Solo se permiten imágenes PNG o JPG para el logo.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      this.liberarLogo();
      this.logoObjectUrl = dataUrl;

      const nombreSeguro = this.convenioSeleccionado ? this.convenioSeleccionado.nombre || '' : '';
      this.convenioSeleccionado = {
        ...this.convenioSeleccionado!,
        nombre: nombreSeguro,
        logo: dataUrl,
      };
      this.conveniosOriginal = this.conveniosOriginal.map((c) =>
        this.idConvenio(c) === this.idConvenio(this.convenioSeleccionado!)
          ? ({ ...this.convenioSeleccionado! } as Convenio)
          : c,
      );
      this.persistirConvenios();
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  private cargarConvenios(busqueda?: string, estado?: string) {
    this.conveniosService.getConvenios(busqueda, estado).subscribe((data) => {
      if (data && data.length) {
        this.conveniosOriginal = data.map((d) => this.mapFromDto(d));
        this.persistirConvenios();
      } else {
        this.conveniosOriginal = [];
        this.persistirConvenios();
      }
      this.restaurarSeleccionPersistida();
      this.setPage(1);
    });
  }

  private mapFromDto(dto: ConvenioDto): Convenio {
    const base = {
      id: dto.id ? String(dto.id) : undefined,
      nombre: dto.entidadNombre ?? dto.nombre ?? '',
      fecha: this.normalizarFechaDto(dto.fechaExpiracion ?? dto.fecha),
      siglas: dto.siglas ?? this.siglasFromNombre(dto.entidadNombre ?? dto.nombre ?? ''),
      color: dto.color ?? this.colorFromSeed(),
      logo: dto.logoUrl ?? dto.logo,
      estado: dto.estado ?? 'pendiente',
      ruc: dto.ruc,
      rubro: dto.rubro,
      contacto: dto.contactoNombre ?? dto.contacto,
      telefono: dto.telefonoContacto ?? dto.telefono,
      tipo: dto.tipo,
      conexion: dto.conexion,
      comentarios: (dto.comentarios || []).map((comentario) => ({ texto: comentario })),
      historial: dto.historial,
    };
    return this.normalizarConvenio(base);
  }

  private normalizarConvenio(
    convenio: Partial<Convenio> & { nombre: string; estado: Estado | string; fecha?: string },
  ): Convenio {
    const estadoCanon = this.mapEstado(convenio.estado);
    const rucLimpio = (convenio.ruc ?? '00000000000').replace(/\D/g, '').slice(0, 11);
    const telefonoLimpio = (convenio.telefono ?? '999999999').replace(/\D/g, '').slice(0, 9);
    const colorSeguro = convenio.color ?? this.colorFromSeed();
    return {
      id: convenio.id ?? this.slug(convenio.nombre),
      ...convenio,
      siglas: convenio.siglas ?? this.siglasFromNombre(convenio.nombre),
      color: colorSeguro,
      ruc: rucLimpio,
      fecha: convenio.fecha ?? '2026-03-25',
      rubro: convenio.rubro ?? 'alimentaria',
      contacto: convenio.contacto ?? 'Deivi Flores',
      telefono: telefonoLimpio,
      tipo: convenio.tipo ?? this.tiposInstitucion[0],
      conexion: convenio.conexion ?? this.tiposConexion[0],
      estado: estadoCanon,
      estadoLabel: this.labelEstado(estadoCanon),
    };
  }

  private toDto(convenio: Convenio): ConvenioDto {
    const limpio = this.normalizarConvenio(convenio);
    return {
      id: limpio.id,
      areaId: this.obtenerAreaId(),
      creadorId: this.obtenerCreadorId(),
      entidadNombre: limpio.nombre,
      siglas: limpio.siglas,
      color: limpio.color,
      logoUrl: limpio.logo,
      estado: this.labelEstado(this.mapEstado(limpio.estado)),
      fechaExpiracion: this.toIsoDate(limpio.fecha),
      ruc: limpio.ruc,
      rubro: limpio.rubro,
      contactoNombre: limpio.contacto,
      telefonoContacto: limpio.telefono,
      tipo: limpio.tipo,
      conexion: limpio.conexion,
      comentarios: (limpio.comentarios || []).map((comentario) => comentario.texto),
      historial: limpio.historial,
    };
  }

  private mapEstado(estado: string): Estado {
    const e = estado.trim().toLowerCase();
    if (e.includes('cancel')) return 'cancelado';
    if (e.includes('firm')) return 'firmado';
    if (e.includes('reun')) return 'reunion';
    if (e.includes('convenio')) return 'convenio';
    if (e.includes('proce')) return 'proceso';
    return 'pendiente';
  }

  labelEstado(estado: Estado): string {
    switch (estado) {
      case 'pendiente':
        return 'PENDIENTE';
      case 'proceso':
        return 'EN PROCESO';
      case 'convenio':
        return 'PROCESO DE CONVENIO';
      case 'reunion':
        return 'REUNIÓN AGENDADA';
      case 'firmado':
        return 'CONVENIO FIRMADO';
      case 'cancelado':
        return 'CANCELADO';
    }
  }

  private siglasFromNombre(nombre: string): string {
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 3)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  private colorFromSeed(): string {
    const colores = [
      '#0b62b2',
      '#ffb703',
      '#6a1b9a',
      '#212121',
      '#009688',
      '#f57c00',
      '#1abc9c',
      '#34495e',
    ];
    const base = colores[Math.floor(Math.random() * colores.length)];
    return `linear-gradient(135deg, ${base}, ${base})`;
  }

  private formatearFecha(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private normalizarFechaDto(fecha?: string): string {
    if (!fecha) return '2026-03-25';
    const valor = fecha.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(valor)) return valor.slice(0, 10);
    return valor;
  }

  private toIsoDate(fecha: string): string {
    const valor = fecha.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;

    const match = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const [, dd, mm, yyyy] = match;
      return `${yyyy}-${mm}-${dd}`;
    }

    return valor;
  }

  private obtenerCreadorId(): number {
    const usuario = this.authService.getCurrentUser();
    return Number(usuario?.id ?? 0);
  }

  private obtenerAreaId(): number {
    const usuario = this.authService.getCurrentUser() as {
      area_id?: number;
      areaId?: number;
    } | null;
    return Number(usuario?.area_id ?? usuario?.areaId ?? this.defaultAreaId);
  }

  private mensajeErrorBackend(base: string, error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) return base;
    const detalle =
      typeof error.error === 'string'
        ? error.error
        : error.error?.message || error.message || error.statusText;
    const status = error.status ? ` [${error.status}]` : '';
    return `${base}${status}${detalle ? `: ${detalle}` : ''}`;
  }

  private subirArchivoAdjunto(
    convenioId: string,
    adjunto: { nombre: string; url?: string; file?: File },
  ) {
    if (!adjunto.file) return;

    this.conveniosService.addArchivo(convenioId, adjunto.file).subscribe({
      next: (resp) => {
        if (!resp || !this.convenioSeleccionado) {
          alert('No se pudo guardar el archivo en la BD');
          return;
        }

        this.convenioSeleccionado = {
          ...this.convenioSeleccionado,
          archivoAdjunto: {
            id: resp.id,
            nombre: resp.nombreArchivo,
            url: resp.urlArchivo,
          },
          historial: [
            ...(this.convenioSeleccionado.historial || []),
            `Archivo adjuntado · ${this.usuarioActual} · ${this.formatearFecha(new Date())}`,
          ],
        };
        this.conveniosOriginal = this.conveniosOriginal.map((c) =>
          this.idConvenio(c) === convenioId ? ({ ...this.convenioSeleccionado! } as Convenio) : c,
        );
        this.persistirConvenios();
      },
      error: (error: unknown) => {
        console.error('No se pudo guardar el archivo', error);
        alert(this.mensajeErrorBackend('No se pudo guardar el archivo en la BD', error));
      },
    });
  }

  private hidratarArchivoAdjunto(convenioId: string) {
    if (!this.convenioSeleccionado || !/^\d+$/.test(convenioId)) return;

    this.conveniosService.getArchivosByConvenio(convenioId).subscribe((archivos) => {
      const archivo = archivos[0];
      if (
        !archivo ||
        !this.convenioSeleccionado ||
        this.idConvenio(this.convenioSeleccionado) !== convenioId
      )
        return;

      this.convenioSeleccionado = {
        ...this.convenioSeleccionado,
        archivoAdjunto: {
          id: archivo.id,
          nombre: archivo.nombreArchivo,
          url: archivo.urlArchivo,
        },
      };

      this.conveniosOriginal = this.conveniosOriginal.map((c) =>
        this.idConvenio(c) === convenioId ? ({ ...this.convenioSeleccionado! } as Convenio) : c,
      );
      this.persistirConvenios();
    });
  }

  private hidratarComentarios(convenioId: string) {
    if (!this.convenioSeleccionado || !/^\d+$/.test(convenioId)) return;

    this.conveniosService.getComentariosByConvenio(convenioId).subscribe((comentarios) => {
      if (!this.convenioSeleccionado || this.idConvenio(this.convenioSeleccionado) !== convenioId)
        return;

      this.convenioSeleccionado = {
        ...this.convenioSeleccionado,
        comentarios: comentarios.map((comentario) => ({
          id: comentario.id,
          texto: comentario.comentario,
        })),
      };

      this.conveniosOriginal = this.conveniosOriginal.map((c) =>
        this.idConvenio(c) === convenioId ? ({ ...this.convenioSeleccionado! } as Convenio) : c,
      );
      this.persistirConvenios();
    });
  }

  private slug(nombre: string): string {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private idConvenio(c: Convenio): string {
    return c.id ?? this.slug(c.nombre);
  }

  private liberarArchivo(convenio: Convenio | null) {
    if (convenio?.archivoAdjunto?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(convenio.archivoAdjunto.url);
    }
  }

  private liberarLogo() {
    if (this.logoObjectUrl) {
      URL.revokeObjectURL(this.logoObjectUrl);
      this.logoObjectUrl = undefined;
    }
  }

  private persistirConvenios() {
    try {
      const serializable = this.conveniosOriginal.map((c) => ({
        ...c,
        archivoAdjunto: c.archivoAdjunto ? { nombre: c.archivoAdjunto.nombre } : undefined,
      }));
      localStorage.setItem(this.storageKey, JSON.stringify(serializable));
    } catch (e) {
      console.error('No se pudo guardar convenios en localStorage', e);
    }
  }

  private cargarPersistidos(): Convenio[] | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const data = JSON.parse(raw) as Convenio[];
      return Array.isArray(data) ? data : null;
    } catch (e) {
      console.error('No se pudo leer convenios desde localStorage', e);
      return null;
    }
  }

  private persistirSeleccion(id: string) {
    try {
      localStorage.setItem(this.storageSelectedKey, id);
    } catch (e) {
      console.error('No se pudo guardar la selección de convenio', e);
    }
  }

  private restaurarSeleccionPersistida() {
    try {
      const id = localStorage.getItem(this.storageSelectedKey);
      if (!id) return;
      const encontrado = this.conveniosOriginal.find((c) => this.idConvenio(c) === id);
      if (encontrado) {
        this.abrirDetalle(encontrado);
      }
    } catch (e) {
      console.error('No se pudo restaurar la selección de convenio', e);
    }
  }
}
type Estado = 'pendiente' | 'proceso' | 'convenio' | 'reunion' | 'firmado' | 'cancelado';
type ConexionFiltro = 'todos' | 'Convenio' | 'Alianza';
type ComentarioItem = { id?: number; texto: string };

type Convenio = {
  id?: string;
  nombre: string;
  fecha: string;
  siglas: string;
  color: string;
  logo?: string;
  estado: Estado | string;
  estadoLabel?: string;
  ruc?: string;
  rubro?: string;
  contacto?: string;
  telefono?: string;
  tipo?: string;
  conexion?: string;
  historial?: string[];
  comentarios?: ComentarioItem[];
  archivoAdjunto?: { id?: number; nombre: string; url?: string; file?: File };
};

type ActividadEstado = 'pendiente' | 'proceso' | 'firmado';
type FiltroActividad = 'todos' | ActividadEstado;

type Actividad = {
  id: string;
  titulo: string;
  descripcion: string;
  fechaLimite: string;
  estado: ActividadEstado;
  enlaces?: ActividadEnlace[];
};

type ActividadEnlace = {
  nombre: string;
  url: string;
};

type ActividadForm = {
  titulo: string;
  descripcion: string;
  estado: ActividadEstado;
  fechaLimite: string;
  enlaces: ActividadEnlace[];
};
