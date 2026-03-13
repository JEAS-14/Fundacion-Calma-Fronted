import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- MUY IMPORTANTE para el input del mensaje

// Interfaces para estructurar tu Base de Datos futura
export interface Mensaje {
  texto: string;
  hora: string;
  enviadoPorMi: boolean; // Para saber si lo pones a la derecha o a la izquierda
}

export interface ContactoChat {
  id: number;
  nombre: string;
  iniciales: string;
  colorBg: string; // Ej: 'bg-blue', 'bg-purple'
  enLinea: boolean;
  mensajesSinLeer: number;
  mensajes: Mensaje[]; // Historial de chat con esta persona
}

@Component({
  selector: 'app-comunicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comunicaciones.component.html',
  styleUrls: ['./comunicaciones.component.scss']
})
export class ComunicacionesComponent implements OnInit {

  // Lista de contactos (Vendrá de tu API)
  contactos: ContactoChat[] = [];

  // El chat que tienes abierto en este momento
  contactoActivo!: ContactoChat;

  // Lo que el usuario está escribiendo en el input
  nuevoMensaje: string = '';

  ngOnInit() {
    this.cargarDatosFalsos();
    // Por defecto, abrimos el primer chat
    if (this.contactos.length > 0) {
      this.seleccionarContacto(this.contactos[0]);
    }
  }

  // Cambiar entre chats
  seleccionarContacto(contacto: ContactoChat) {
    this.contactoActivo = contacto;
    this.contactoActivo.mensajesSinLeer = 0; // Marcar como leídos
  }

  // Lógica para el botón "Enviar"
  enviarMensaje() {
    if (this.nuevoMensaje.trim() === '') return; // No enviar mensajes vacíos

    const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Agregamos el mensaje visualmente
    this.contactoActivo.mensajes.push({
      texto: this.nuevoMensaje,
      hora: horaActual,
      enviadoPorMi: true
    });

    console.log(`Enviando a API el mensaje: "${this.nuevoMensaje}" para el ID: ${this.contactoActivo.id}`);
    // TODO: this.http.post('tu-api/mensajes', { destinatario: this.contactoActivo.id, texto: this.nuevoMensaje }).subscribe()

    // 2. Limpiamos el input
    this.nuevoMensaje = '';
  }

  // ==========================================
  // 🔌 DATOS DE PRUEBA (MOCK) PARA EL DISEÑO
  // ==========================================
  cargarDatosFalsos() {
    this.contactos = [
      {
        id: 1, nombre: 'Ana Silva', iniciales: 'AS', colorBg: 'bg-purple', enLinea: true, mensajesSinLeer: 1,
        mensajes: [
          { texto: '¡Buenos días equipo! ¿Alguien tiene el reporte de impacto mensual?', hora: '09:00 AM', enviadoPorMi: false },
          { texto: 'Hola Ana, sí, ya está cargado en el módulo de Educalma.', hora: '09:05 AM', enviadoPorMi: true },
          { texto: 'Perfecto, reservaré la sala de reuniones.', hora: '09:10 AM', enviadoPorMi: false }
        ]
      },
      {
        id: 2, nombre: 'Carlos Ruiz', iniciales: 'CR', colorBg: 'bg-orange', enLinea: false, mensajesSinLeer: 0,
        mensajes: [
          { texto: 'Gracias Deivi. @Ana, ¿podemos revisarlo juntos a las 3 PM?', hora: '09:07 AM', enviadoPorMi: false }
        ]
      },
      {
        id: 3, nombre: 'Lucía Méndez', iniciales: 'LM', colorBg: 'bg-blue', enLinea: true, mensajesSinLeer: 0,
        mensajes: [
          { texto: 'Hola, ¿tienes el reporte de desempeño de ayer?', hora: '10:28 AM', enviadoPorMi: false },
          { texto: 'Sí, claro. Dame un momento y te lo envío por aquí.', hora: '10:29 AM', enviadoPorMi: true },
          { texto: 'Excelente. ¿A qué hora es la reunión general?', hora: '10:30 AM', enviadoPorMi: false }
        ]
      }
    ];
  }
  // ==========================================
  // 📞 ACCIONES DE CABECERA (Llamadas e Info)
  // ==========================================
  iniciarLlamada() {
    alert(`Iniciando llamada de voz con ${this.contactoActivo.nombre}... 📞`);
  }

  iniciarVideoLlamada() {
    alert(`Iniciando videollamada con ${this.contactoActivo.nombre}... 🎥`);
  }

  verInfoContacto() {
    alert(`Información de contacto:\nNombre: ${this.contactoActivo.nombre}\nEstado: ${this.contactoActivo.enLinea ? 'En línea' : 'Desconectado'}`);
  }

  // ==========================================
  // 📎 ACCIONES DE FOOTER (Archivos y Emojis)
  // ==========================================

  // Función que se ejecuta cuando elijes un archivo de tu PC
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log("Archivo seleccionado listo para subir:", file);
      alert(`Has seleccionado el archivo: ${file.name}\n\n(En el futuro, esto se enviará al Backend para guardarse en la Base de Datos).`);
    }
  }

  // Función temporal para los emojis
  agregarEmoji() {
    // Por ahora, simplemente agregará una carita feliz al texto que estés escribiendo.
    // Luego puedes instalar una librería como '@ctrl/ngx-emoji-mart' para tener el menú completo de WhatsApp.
    this.nuevoMensaje += ' 😊';
  }
}
