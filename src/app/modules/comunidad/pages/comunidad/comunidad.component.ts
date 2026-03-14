import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

// Estructura de datos del contacto
export interface Contacto {
  id?: number;
  nombre: string;
  rol: string;
  area: string;
  iniciales: string;
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

  private apiUrl = 'http://localhost:3005/api/comunidad';

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit() {
    this.obtenerContactos();
  }

  // [GET] Obtener lista de contactos
  obtenerContactos() {
    console.log('Llamando a la API para obtener contactos...');
    this.http.get<Contacto[]>(`${this.apiUrl}/contactos`).subscribe({
      next: (data) => {
        this.contactos = data;
        console.log('Contactos cargados desde el backend:', data);
      },
      error: (err) => {
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

  enviarMensaje(contacto: Contacto) {
    this.router.navigate(['/comunicaciones']);
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