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
  estadoSeleccionado: Estado = 'pendiente';
  busqueda = '';
  @ViewChild('logoInput') logoInputRef?: ElementRef<HTMLInputElement>;

  conveniosOriginal: Convenio[] = [];
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
    const guardados = this.cargarPersistidos();
    if (guardados && guardados.length) {
      this.conveniosOriginal = guardados.map((c) => this.normalizarConvenio(c));
    } else {
      this.conveniosOriginal = this.seed;
      this.cargarConvenios();
    }
    this.restaurarSeleccionPersistida();
  }
  private seed: Convenio[] = [
    {
      nombre: 'Univ. Norbert Wiener',
      fecha: '20/02/2026',
      siglas: 'UNW',
      color: 'linear-gradient(135deg, #0b62b2, #114f86)',
      logo: 'assets/logo-wienner.jpg',
      estado: 'pendiente',
      ruc: '20123456789',
      rubro: 'Educación',
      contacto: 'Deivi Flores',
      telefono: '+51 999 999 999',
      historial: ['Creación de convenio • Fabiola', 'Estado actualizado a Pendiente'],
    },
    {
      nombre: 'Gore Apurimac',
      fecha: '20/08/2026',
      siglas: 'GA',
      color: 'linear-gradient(135deg, #ffb703, #f77f00)',
      logo: 'assets/logo-apurimac.png',
      estado: 'proceso',
    },
    {
      nombre: 'Gore Cajamarca',
      fecha: '10/05/2026',
      siglas: 'GC',
      color: 'linear-gradient(135deg, #6a1b9a, #8e24aa)',
      logo: 'assets/logo-cajamarca.png',
      estado: 'convenio',
    },
    {
      nombre: 'Univ. Ruiz de Montoya',
      fecha: '20/12/2026',
      siglas: 'URM',
      color: 'linear-gradient(135deg, #212121, #424242)',
      logo: 'assets/logo-montoya.png',
      estado: 'firmado',
    },
    {
      nombre: 'Munic.de punta hermosa',
      fecha: '01/01/2027',
      siglas: 'MPH',
      color: 'linear-gradient(135deg, #009688, #00796b)',
      logo: 'assets/logo-puntahermosa.png',
      estado: 'reunion',
    },
    {
      nombre: 'Gore Arequipa',
      fecha: '20/12/2026',
      siglas: 'GAQ',
      color: 'linear-gradient(135deg, #f57c00, #ef6c00)',
      logo: 'assets/logo-arequipa.png',
      estado: 'cancelado',
    },
    {
      nombre: 'Gob. Regional Cusco',
      fecha: '15/03/2027',
      siglas: 'GRC',
      color: 'linear-gradient(135deg, #8e44ad, #6c3483)',
      estado: 'pendiente',
    },
    {
      nombre: 'Universidad San Marcos',
      fecha: '05/09/2026',
      siglas: 'UNMSM',
      color: 'linear-gradient(135deg, #c0392b, #a93226)',
      estado: 'proceso',
    },
    {
      nombre: 'Gob. Regional Lambayeque',
      fecha: '11/11/2026',
      siglas: 'GRL',
      color: 'linear-gradient(135deg, #1abc9c, #16a085)',
      estado: 'convenio',
    },
    {
      nombre: 'Universidad del Sur',
      fecha: '28/02/2027',
      siglas: 'UDS',
      color: 'linear-gradient(135deg, #34495e, #2c3e50)',
      estado: 'reunion',
    },
    {
      nombre: 'Municipalidad de Lima',
      fecha: '12/07/2026',
      siglas: 'ML',
      color: 'linear-gradient(135deg, #2980b9, #2471a3)',
      estado: 'firmado',
    },
    {
      nombre: 'Colegio Mayor',
      fecha: '03/10/2026',
      siglas: 'CM',
      color: 'linear-gradient(135deg, #f39c12, #d68910)',
      estado: 'cancelado',
    },
    {
      nombre: 'Instituto Tecnológico Andino',
      fecha: '18/01/2027',
      siglas: 'ITA',
      color: 'linear-gradient(135deg, #27ae60, #1e8449)',
      estado: 'pendiente',
    },
    {
      nombre: 'Universidad Pacífico Sur',
      fecha: '09/06/2026',
      siglas: 'UPS',
      color: 'linear-gradient(135deg, #5dade2, #3498db)',
      estado: 'proceso',
    },
    {
      nombre: 'Hospital Nacional Central',
      fecha: '22/04/2027',
      siglas: 'HNC',
      color: 'linear-gradient(135deg, #7f8c8d, #636e72)',
      estado: 'convenio',
    },
    {
      nombre: 'Gob. Regional Piura',
      fecha: '30/08/2026',
      siglas: 'GRP',
      color: 'linear-gradient(135deg, #e67e22, #d35400)',
      estado: 'reunion',
    },
    {
      nombre: 'Universidad Andina',
      fecha: '17/12/2026',
      siglas: 'UA',
      color: 'linear-gradient(135deg, #8d6e63, #6d4c41)',
      estado: 'firmado',
    },
    {
      nombre: 'Municipalidad Surco',
      fecha: '08/05/2027',
      siglas: 'SUR',
      color: 'linear-gradient(135deg, #d81b60, #c2185b)',
      estado: 'cancelado',
    },
    {
      nombre: 'Colegio San Mateo',
      fecha: '14/02/2027',
      siglas: 'CSM',
      color: 'linear-gradient(135deg, #4caf50, #2e7d32)',
      estado: 'pendiente',
    },
    {
      nombre: 'Instituto Los Andes',
      fecha: '19/03/2027',
      siglas: 'ILA',
      color: 'linear-gradient(135deg, #00acc1, #00838f)',
      estado: 'pendiente',
    },
    {
      nombre: 'Universidad del Norte',
      fecha: '27/04/2026',
      siglas: 'UDN',
      color: 'linear-gradient(135deg, #7e57c2, #5e35b1)',
      estado: 'pendiente',
    },
    {
      nombre: 'Gob. Regional Tacna',
      fecha: '08/06/2026',
      siglas: 'GRT',
      color: 'linear-gradient(135deg, #ff7043, #e64a19)',
      estado: 'pendiente',
    },
    {
      nombre: 'Municipalidad Miraflores',
      fecha: '15/07/2026',
      siglas: 'MMF',
      color: 'linear-gradient(135deg, #26c6da, #00acc1)',
      estado: 'pendiente',
    },
    {
      nombre: 'Universidad Andina Sur',
      fecha: '02/08/2026',
      siglas: 'UAS',
      color: 'linear-gradient(135deg, #9ccc65, #7cb342)',
      estado: 'pendiente',
    },
    {
      nombre: 'Gob. Regional Puno',
      fecha: '18/09/2026',
      siglas: 'GRP',
      color: 'linear-gradient(135deg, #8d6e63, #6d4c41)',
      estado: 'pendiente',
    },
    {
      nombre: 'Hospital Regional Norte',
      fecha: '25/10/2026',
      siglas: 'HRN',
      color: 'linear-gradient(135deg, #90a4ae, #78909c)',
      estado: 'pendiente',
    },
    {
      nombre: 'Centro Médico Vida',
      fecha: '12/11/2026',
      siglas: 'CMV',
      color: 'linear-gradient(135deg, #ef5350, #e53935)',
      estado: 'pendiente',
    },
    {
      nombre: 'Fundación Educa',
      fecha: '30/12/2026',
      siglas: 'FED',
      color: 'linear-gradient(135deg, #ab47bc, #8e24aa)',
      estado: 'pendiente',
    },
    {
      nombre: 'Universidad Valle',
      fecha: '09/01/2027',
      siglas: 'UV',
      color: 'linear-gradient(135deg, #42a5f5, #1e88e5)',
      estado: 'pendiente',
    },
    {
      nombre: 'Municipalidad Callao',
      fecha: '21/01/2027',
      siglas: 'MCL',
      color: 'linear-gradient(135deg, #ffa726, #fb8c00)',
      estado: 'pendiente',
    },
    {
      nombre: 'Gob. Regional Loreto',
      fecha: '05/02/2027',
      siglas: 'GRL',
      color: 'linear-gradient(135deg, #26a69a, #00897b)',
      estado: 'pendiente',
    },
    {
      nombre: 'Instituto Superior Andino',
      fecha: '18/02/2027',
      siglas: 'ISA',
      color: 'linear-gradient(135deg, #78909c, #546e7a)',
      estado: 'pendiente',
    },
    {
      nombre: 'Universidad Tecnológica',
      fecha: '03/03/2027',
      siglas: 'UT',
      color: 'linear-gradient(135deg, #ec407a, #d81b60)',
      estado: 'pendiente',
    },
    {
      nombre: 'Municipalidad Trujillo',
      fecha: '20/03/2027',
      siglas: 'MTR',
      color: 'linear-gradient(135deg, #ffca28, #f9a825)',
      estado: 'pendiente',
    },
    {
      nombre: 'Gob. Regional Huánuco',
      fecha: '07/04/2027',
      siglas: 'GRH',
      color: 'linear-gradient(135deg, #8e24aa, #6a1b9a)',
      estado: 'pendiente',
    },
    {
      nombre: 'Universidad Metropolitana',
      fecha: '25/04/2027',
      siglas: 'UM',
      color: 'linear-gradient(135deg, #43a047, #2e7d32)',
      estado: 'pendiente',
    },
    {
      nombre: 'Hospital Virgen',
      fecha: '13/05/2027',
      siglas: 'HV',
      color: 'linear-gradient(135deg, #5c6bc0, #3949ab)',
      estado: 'pendiente',
    },
    {
      nombre: 'Colegio San José',
      fecha: '29/05/2027',
      siglas: 'CSJ',
      color: 'linear-gradient(135deg, #ff8a65, #f4511e)',
      estado: 'pendiente',
    },
  ].map((c) => this.normalizarConvenio(c));

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

  get totalPaginas(): number {
    const total = this.conveniosFiltrados.length;
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get conveniosPaginados(): Convenio[] {
    const start = (this.page - 1) * this.pageSize;
    return this.conveniosFiltrados.slice(start, start + this.pageSize);
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
    this.cargarConvenios(this.busqueda, this.estadoSeleccionado);
    this.setPage(1);
  }

  setConexionFiltro(valor: ConexionFiltro) {
    this.filtroConexion = valor;
    this.setPage(1);
  }

  onBuscar() {
    this.setPage(1);
    this.cargarConvenios(this.busqueda, this.estadoSeleccionado);
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
    const adjunto = { nombre: file.name, url: urlArchivo };

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

          if (this.convenioSeleccionado?.archivoAdjunto?.nombre && this.convenioSeleccionado.archivoAdjunto.url) {
            nuevo.archivoAdjunto = { ...this.convenioSeleccionado.archivoAdjunto };
          }

          this.conveniosOriginal = [...this.conveniosOriginal, nuevo];
          this.esNuevo = false;
          this.editMode = false;
          this.intentoGuardar = false;
          this.convenioSeleccionado = nuevo;
          this.persistirConvenios();

          const nuevoId = this.idConvenio(nuevo);
          if (/^\d+$/.test(nuevoId) && nuevo.archivoAdjunto?.nombre && nuevo.archivoAdjunto.url) {
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
        this.conveniosOriginal = this.conveniosOriginal.map((c) =>
          this.idConvenio(c) === this.idConvenio(actualizado) ? ({ ...actualizado } as Convenio) : c,
        );
        this.editMode = false;
        this.intentoGuardar = false;
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

  campoInvalido(campo: 'nombre' | 'ruc' | 'estado' | 'fecha' | 'tipo' | 'rubro' | 'conexion' | 'contacto' | 'telefono'): boolean {
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
      } else if (busqueda) {
        this.conveniosOriginal = this.seed;
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
    const usuario = this.authService.getCurrentUser() as { area_id?: number; areaId?: number } | null;
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

  private subirArchivoAdjunto(convenioId: string, adjunto: { nombre: string; url?: string }) {
    if (!adjunto.url) return;

    this.conveniosService.addArchivo(convenioId, adjunto.nombre, adjunto.url).subscribe({
      next: (resp) => {
        if (!resp || !this.convenioSeleccionado) {
          alert('No se pudo guardar el archivo en la BD');
          return;
        }

        this.convenioSeleccionado = {
          ...this.convenioSeleccionado,
          archivoAdjunto: {
            ...adjunto,
            id: resp.id,
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
      if (!archivo || !this.convenioSeleccionado || this.idConvenio(this.convenioSeleccionado) !== convenioId) return;

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
      if (!this.convenioSeleccionado || this.idConvenio(this.convenioSeleccionado) !== convenioId) return;

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
    if (convenio?.archivoAdjunto?.url) {
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
  archivoAdjunto?: { id?: number; nombre: string; url?: string };
};
