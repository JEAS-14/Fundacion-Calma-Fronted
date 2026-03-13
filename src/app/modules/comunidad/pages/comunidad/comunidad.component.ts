import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog'; // Para la ventana modal

// 1. Definimos cómo es la estructura de datos que vendrá de tu Base de Datos
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

  // Lista donde guardaremos los datos que lleguen de la API
  contactos: Contacto[] = [];

  // Variables para controlar el Modal de Nuevo Contacto
  mostrarModal: boolean = false;
  contactoForm: Contacto = { nombre: '', rol: '', area: '', iniciales: '' };

  constructor(private router: Router) { }

  // Se ejecuta apenas carga la pantalla
  ngOnInit() {
    this.obtenerContactos();
  }

  // ==========================================
  // 🔌 ZONA DE CONEXIÓN A APIS (BACKEND)
  // ==========================================

  // [GET] Obtener lista de contactos
  obtenerContactos() {
    console.log("Llamando a la API para obtener contactos...");
    // TODO: Cambiar por this.http.get('tu-api/contactos').subscribe(...)

    // Simulación de los datos que te devolvería tu Backend:
    this.contactos = [
      { id: 1, nombre: 'Daniel Amaya', rol: 'CEO & FUNDADOR', area: 'Dirección General', iniciales: 'DA' },
      { id: 2, nombre: 'Deivi Flores', rol: 'DIR. ESTRATEGIA Y DESARROLLO', area: 'Estrategia', iniciales: 'DF' },
      { id: 3, nombre: 'Carolina Velezmoro', rol: 'DIR. DE PROYECTOS', area: 'Proyectos', iniciales: 'CV' }
    ];
  }

  // Abrir la ventana de "Nuevo Contacto" limpia
  abrirModalNuevo() {
    this.contactoForm = { nombre: '', rol: '', area: '', iniciales: '' };
    this.mostrarModal = true;
  }

  // [POST] Guardar un nuevo contacto
  guardarContacto() {
    console.log("Enviando a la API: ", this.contactoForm);
    // TODO: Cambiar por this.http.post('tu-api/contactos', this.contactoForm).subscribe(...)

    // Simulación de guardado exitoso:
    this.contactoForm.iniciales = this.contactoForm.nombre.substring(0, 2).toUpperCase();
    this.contactoForm.id = new Date().getTime(); // ID temporal
    this.contactos.push({ ...this.contactoForm }); // Lo agregamos a la lista visual

    this.mostrarModal = false; // Cerramos el modal
    alert("¡Contacto guardado con éxito en la Base de Datos!");
  }

  // [DELETE] Eliminar contacto
  eliminarContacto(id: number | undefined) {
    if (confirm("¿Estás seguro de eliminar este contacto?")) {
      console.log(`Eliminando ID: ${id} en la API...`);
      // TODO: Cambiar por this.http.delete(`tu-api/contactos/${id}`).subscribe(...)

      this.contactos = this.contactos.filter(c => c.id !== id);
    }
  }

  // ==========================================
  // 🚀 NAVEGACIÓN Y ACCIONES EXTRAS
  // ==========================================
  enviarMensaje(contacto: Contacto) {
    this.router.navigate(['/comunicaciones']);
  }

  // NUEVA FUNCIÓN: Alternar favorito
  toggleFavorito(contacto: Contacto) {
    contacto.esFavorito = !contacto.esFavorito; // Cambia de true a false y viceversa

    if (contacto.esFavorito) {
      console.log(`Guardando a ${contacto.nombre} en favoritos (API)`);
      // TODO: this.http.post('tu-api/favoritos', { id: contacto.id }).subscribe()
    } else {
      console.log(`Quitando a ${contacto.nombre} de favoritos (API)`);
      // TODO: this.http.delete(`tu-api/favoritos/${contacto.id}`).subscribe()
    }
  }

}
