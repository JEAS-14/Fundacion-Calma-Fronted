import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConveniosService, ConvenioDto } from './convenios.service';

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
  convenioSeleccionado: Convenio | null = null;
  convenioPorEliminar: Convenio | null = null;
  nuevoComentario = '';
  usuarioActual = 'Deivi Flores';
  editMode = false;
  esNuevo = false;
  private logoObjectUrl?: string;
  private readonly storageKey = 'convenios-data';
  private readonly storageSelectedKey = 'convenio-seleccionado-id';
  estadosDisponibles: Estado[] = [
    'pendiente',
    'proceso',
    'convenio',
    'reunion',
    'firmado',
    'cancelado',
  ];

  constructor(private conveniosService: ConveniosService) {}

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
        (term ? c.nombre.toLowerCase().includes(term) : true),
    );
  }

  setFiltro(estado: Estado) {
    this.estadoSeleccionado = estado;
    this.cargarConvenios(this.busqueda, this.estadoSeleccionado);
  }

  onBuscar() {
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
      comentarios: [],
      historial: [],
      archivoAdjunto: undefined,
    };
    this.convenioSeleccionado = this.normalizarConvenio(base);
    this.editMode = true;
    this.esNuevo = true;
    this.nuevoComentario = '';
    this.persistirSeleccion(this.idConvenio(this.convenioSeleccionado));
  }

  abrirDetalle(convenio: Convenio) {
    this.convenioSeleccionado = {
      ...convenio,
      comentarios: convenio.comentarios ? [...convenio.comentarios] : [],
      historial: convenio.historial ? [...convenio.historial] : [],
      archivoAdjunto: convenio.archivoAdjunto ? { ...convenio.archivoAdjunto } : undefined,
    };
    this.nuevoComentario = '';
    this.editMode = false;
    this.esNuevo = false;
    this.persistirSeleccion(this.idConvenio(convenio));
  }

  cerrarDetalle() {
    this.liberarArchivo(this.convenioSeleccionado);
    this.convenioSeleccionado = null;
    this.nuevoComentario = '';
    this.editMode = false;
    this.esNuevo = false;
    this.liberarLogo();
    localStorage.removeItem(this.storageSelectedKey);
  }

  onArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (file) {
      const esPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!esPdf) {
        alert('Solo se permite subir archivos PDF.');
        if (input) input.value = '';
        return;
      }
      const url = URL.createObjectURL(file);
      const adjunto = { nombre: file.name, url };

      // limpiar URL previa si existe
      this.liberarArchivo(this.convenioSeleccionado);

      if (this.convenioSeleccionado) {
        this.convenioSeleccionado = {
          ...this.convenioSeleccionado,
          archivoAdjunto: adjunto,
        };
        this.conveniosOriginal = this.conveniosOriginal.map((c) =>
          this.idConvenio(c) === this.idConvenio(this.convenioSeleccionado!) ? { ...this.convenioSeleccionado! } : c,
        );
        this.persistirConvenios();
      }
    }
    // reset para permitir volver a abrir el mismo archivo
    if (input) input.value = '';
  }

  verArchivo() {
    if (this.convenioSeleccionado?.archivoAdjunto?.url) {
      window.open(this.convenioSeleccionado.archivoAdjunto.url, '_blank');
    }
  }

  eliminarArchivo() {
    if (!this.convenioSeleccionado) return;
    this.liberarArchivo(this.convenioSeleccionado);
    this.convenioSeleccionado = { ...this.convenioSeleccionado, archivoAdjunto: undefined };
    this.conveniosOriginal = this.conveniosOriginal.map((c) =>
      this.idConvenio(c) === this.idConvenio(this.convenioSeleccionado!) ? { ...this.convenioSeleccionado! } : c,
    );
    this.persistirConvenios();
  }

  eliminarConvenio(convenio: Convenio) {
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
    this.eliminarConvenio(this.convenioPorEliminar);
    this.convenioPorEliminar = null;
  }

  eliminarLogo() {
    if (!this.convenioSeleccionado) return;
    this.liberarLogo();
    const limpio = { ...this.convenioSeleccionado, logo: undefined };
    this.convenioSeleccionado = limpio;
    this.conveniosOriginal = this.conveniosOriginal.map((c) =>
      this.idConvenio(c) === this.idConvenio(limpio) ? { ...limpio } : c,
    );
    this.persistirConvenios();
  }


  agregarComentario() {
    if (!this.convenioSeleccionado || !this.nuevoComentario.trim()) return;
    const stamp = this.formatearFecha(new Date());
    const texto = `${this.usuarioActual} · ${stamp} · ${this.nuevoComentario.trim()}`;
    const id = this.idConvenio(this.convenioSeleccionado);

    this.conveniosService
      .addComentario(id, this.usuarioActual, texto)
      .subscribe((resp) => {
        const actualizado = resp ? this.normalizarConvenio(resp as Convenio) : this.convenioSeleccionado!;
        const updatedComentarios = (actualizado.comentarios && actualizado.comentarios.length)
          ? [...actualizado.comentarios, texto]
          : [...(this.convenioSeleccionado?.comentarios || []), texto];

        this.convenioSeleccionado = {
          ...actualizado,
          comentarios: updatedComentarios,
          historial: [
            ...(actualizado.historial || this.convenioSeleccionado?.historial || []),
            `Comentario agregado · ${this.usuarioActual} · ${stamp}`,
          ],
        };

        this.conveniosOriginal = this.conveniosOriginal.map((c) =>
          this.idConvenio(c) === id ? { ...this.convenioSeleccionado! } : c,
        );

        this.nuevoComentario = '';
        this.persistirConvenios();
      });
  }

  habilitarEdicion() {
    this.editMode = true;
  }

  abrirLogo() {
    this.logoInputRef?.nativeElement.click();
  }

  guardarEdicion() {
    if (!this.convenioSeleccionado) return;
    const payload = { ...this.convenioSeleccionado };

    if (this.esNuevo) {
      const id = payload.id || this.slug(payload.nombre || `nuevo-${Date.now()}`);
      const nuevo = this.normalizarConvenio({ ...payload, id });
      this.conveniosOriginal = [...this.conveniosOriginal, nuevo];
      this.esNuevo = false;
      this.editMode = false;
      this.convenioSeleccionado = nuevo;
      this.persistirConvenios();
      return;
    }

    this.conveniosService.updateConvenio(payload).subscribe((resp) => {
      const actualizado = resp ? this.normalizarConvenio(resp as Convenio) : payload;
      this.conveniosOriginal = this.conveniosOriginal.map((c) =>
        this.idConvenio(c) === this.idConvenio(actualizado) ? { ...actualizado } : c,
      );
      this.editMode = false;
      this.persistirConvenios();
    });
  }

  onLogoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file || !this.convenioSeleccionado) return;
    const mime = file.type.toLowerCase();
    const nombre = file.name.toLowerCase();
    const esImg = mime === 'image/png' || mime === 'image/jpeg' || nombre.endsWith('.png') || nombre.endsWith('.jpg') || nombre.endsWith('.jpeg');
    if (!esImg) {
      alert('Solo se permiten imágenes PNG o JPG para el logo.');
      input.value = '';
      return;
    }

    // Leer como DataURL para que el logo persista y se muestre en la lista
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      this.liberarLogo();
      this.logoObjectUrl = dataUrl;

      const nombreSeguro = this.convenioSeleccionado ? this.convenioSeleccionado.nombre || '' : '';
      this.convenioSeleccionado = { ...this.convenioSeleccionado!, nombre: nombreSeguro, logo: dataUrl };
      this.conveniosOriginal = this.conveniosOriginal.map((c) =>
        this.idConvenio(c) === this.idConvenio(this.convenioSeleccionado!) ? { ...this.convenioSeleccionado! } : c,
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
    });
  }

  private mapFromDto(dto: ConvenioDto): Convenio {
    const base = {
      nombre: dto.nombre,
      fecha: dto.fecha,
      siglas: dto.siglas ?? this.siglasFromNombre(dto.nombre),
      color: dto.color ?? this.colorFromSeed(),
      logo: dto.logo,
      estado: dto.estado,
    };
    return this.normalizarConvenio(base);
  }

  private normalizarConvenio(convenio: Convenio): Convenio {
    const estadoCanon = this.mapEstado(convenio.estado);
    return {
      id: convenio.id ?? this.slug(convenio.nombre),
      ...convenio,
      ruc: convenio.ruc ?? '10121245698',
      fecha: convenio.fecha ?? '2026-03-25',
      rubro: convenio.rubro ?? 'alimentaria',
      contacto: convenio.contacto ?? 'Deivi Flores',
      telefono: convenio.telefono ?? '965847123',
      estado: estadoCanon,
      estadoLabel: this.labelEstado(estadoCanon),
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
        // los objectURL no sobreviven al refresh; guardamos solo el nombre
        archivoAdjunto: c.archivoAdjunto
          ? { nombre: c.archivoAdjunto.nombre }
          : undefined,
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
  historial?: string[];
  comentarios?: string[];
  archivoAdjunto?: { nombre: string; url?: string };
};

