import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ComunidadService } from '../../services/comunidad.service';

// Estructura de datos del contacto
export interface Contacto {
  id?: number;
  nombre: string;
  rol: string;
  area: string;
  iniciales: string;
  email?: string;
  telefono?: string;
  esFavorito?: boolean;
}

@Component({
  selector: 'app-comunidad',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './comunidad.component.html',
  styleUrls: ['./comunidad.component.scss']
})
export class ComunidadComponent implements OnInit {

  contactos: Contacto[] = [];
  mostrarModal: boolean = false;
  contactoForm: Contacto = { nombre: '', rol: '', area: '', iniciales: '' };

  constructor(private router: Router, private comunidadService: ComunidadService) { }

  ngOnInit() {
    this.obtenerContactos();
  }

  // [GET] Obtener lista de contactos
  obtenerContactos() {
    console.log('Llamando a la API para obtener contactos...');
    this.comunidadService.getContactos().subscribe({
      next: (data: Contacto[]) => {
        this.contactos = data;
        console.log('Contactos cargados desde el backend:', data);
      },
      error: (err: unknown) => {
        console.error('Error al obtener contactos:', err);
      }
    });
  }

  abrirModalNuevo() {
    this.contactoForm = { nombre: '', rol: '', area: '', iniciales: '' };
    this.mostrarModal = true;
  }

  // [POST] Guardar un nuevo contacto
  guardarContacto() {
    console.log('Enviando a la API: ', this.contactoForm);
    // TODO: Conectar con this.http.post(...)
    this.contactoForm.iniciales = this.contactoForm.nombre.substring(0, 2).toUpperCase();
    this.contactoForm.id = new Date().getTime();
    this.contactos.push({ ...this.contactoForm });
    this.mostrarModal = false;
    alert('¡Contacto guardado con éxito!');
  }

  // [DELETE] Eliminar contacto
  eliminarContacto(id: number | undefined) {
    if (confirm('¿Estás seguro de eliminar este contacto?')) {
      this.contactos = this.contactos.filter(c => c.id !== id);
    }
  }

  abrirChat(contacto: Contacto) {
    if (!contacto.id) {
      alert('No se puede iniciar el chat: faltan datos del contacto.');
      return;
    }

    this.router.navigate(['/comunicaciones'], {
      queryParams: {
        chatContactoId: contacto.id,
        chatContactoNombre: contacto.nombre
      }
    });
  }

  enviarCorreo(contacto: Contacto) {
    if (contacto.email) {
      window.location.href = `mailto:${contacto.email}`;
      return;
    }

    this.abrirChat(contacto);
  }

  iniciarLlamada(contacto: Contacto) {
    if (contacto.telefono) {
      window.location.href = `tel:${contacto.telefono}`;
      return;
    }

    alert(
      `Llamada en camino: podríamos integrar voz o WebRTC aquí para conectarte con ${contacto.nombre}.`
    );
  }

  toggleFavorito(contacto: Contacto) {
    contacto.esFavorito = !contacto.esFavorito;
    if (contacto.esFavorito) {
      console.log(`Guardando a ${contacto.nombre} en favoritos`);
    } else {
      console.log(`Quitando a ${contacto.nombre} de favoritos`);
    }
  }
}