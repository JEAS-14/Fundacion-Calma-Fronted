import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommunicationService } from '../../../../core/services/communication.service';
import { AuthService } from '../../../auth/services/auth.service';
import { UsuarioService } from '../../../dashboard/pages/admin/usuarios/lista-usuarios/services/usuario.service';
import { User } from '../../../../shared/models/user.model';
import { ChannelInfoComponent } from '../../components/channel-info/channel-info.component';

// Interfaces para estructurar tu Base de Datos futura / Frontend
export interface Mensaje {
  texto: string;
  hora: string;
  enviadoPorMi: boolean;
  tipo?: string;
  archivoUrl?: string; // Nuevo para archivos
  leido?: boolean; // Nuevo para saber si fue leído
}

export interface ContactoChat {
  id: number;
  nombre: string;
  iniciales: string;
  colorBg: string; // Ej: 'bg-blue', 'bg-purple'
  enLinea: boolean;
  mensajesSinLeer: number;
  mensajes: Mensaje[]; // Historial de chat con esta persona
  esGrupo?: boolean; // Saber si el chat es de grupo o no
  participantes?: any[]; // Agregado para actualizar estado en línea
}

@Component({
  selector: 'app-comunicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ChannelInfoComponent],
  templateUrl: './comunicaciones.component.html',
  styleUrls: ['./comunicaciones.component.scss']
})
export class ComunicacionesComponent implements OnInit, OnDestroy {

  // Lista de contactos
  contactos: ContactoChat[] = [];

  // El chat que tienes abierto en este momento
  contactoActivo: ContactoChat | undefined;

  // Lo que el usuario está escribiendo en el input
  nuevoMensaje: string = '';

  // Variables reales de autenticación
  currentUserId: number = 0;
  jwtToken: string = '';

  // Variables para Búsqueda y Modal
  textoBusqueda: string = '';
  mostrarModalNuevoChat: boolean = false;
  
  // Variables para Panel Lateral Derecho (Info del Contacto)
  mostrarInfoContacto: boolean = false;
  infoCanalActual: any = null;

  // Variables para estado en línea
  connectedUsers: Set<number> = new Set();

  // Variables para Búsqueda de Usuarios Nuevos
  usuariosSistema: User[] = [];
  usuariosBuscados: User[] = [];
  buscarUsuario: string = '';

  // Parámetros de chat directo desde Comunidad
  pendingChatContactoId: number = 0;
  pendingChatContactoNombre: string = '';

  constructor(
    private communicationService: CommunicationService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    try {
      // Obtener el token real y el usuario de la sesión actual
      this.jwtToken = this.authService.getToken() || '';
      
      // Obtener ID del usuario desde JWT (más seguro después de F5)
      this.currentUserId = this.communicationService.getCurrentUserId();
      
      if (this.currentUserId === 0) {
        // Fallback al método anterior si JWT decode falla
        const user = this.authService.getCurrentUser();
        if (user && user.id) {
          this.currentUserId = Number(user.id);
        }
      }

      this.activatedRoute.queryParamMap.subscribe(params => {
        this.pendingChatContactoId = Number(params.get('chatContactoId') || 0);
        this.pendingChatContactoNombre = params.get('chatContactoNombre') || '';

        if (this.pendingChatContactoId > 0) {
          console.log('Abrir chat directo desde Comunidad:', {
            id: this.pendingChatContactoId,
            nombre: this.pendingChatContactoNombre
          });
        }
      });
      
      console.log('🔍 INIT - ID de usuario cargado:', {
        currentUserId: this.currentUserId,
        tipo: typeof this.currentUserId,
        fromJWT: this.communicationService.getCurrentUserId(),
        fromAuth: this.authService.getCurrentUser()?.id
      });

      if (!this.jwtToken) {
        console.warn('No hay token de sesión. El backend rechazará la conexión WebSocket.');
      }

      // 1. Conectar al websocket con token real
      await this.communicationService.connect(this.jwtToken);
      
      // Obtener lista inicial de usuarios conectados
      this.getConnectedUsers();
      
      this.setupWebsocketListeners();
      
      // 2. Pedir canales al backend usando el ID real
      if (this.currentUserId > 0) {
        console.log('Solicitando canales para el usuario:', this.currentUserId);
        this.communicationService.getUserChannels({ usuarioId: this.currentUserId });
      } else {
        console.warn('ID de usuario no disponible para solicitar canales');
      }
    } catch (error) {
      console.warn('Backend WebSocket no disponible, cargando datos falsos.', error);
      this.cargarDatosFalsos();
      if (this.contactos.length > 0) {
        this.seleccionarContacto(this.contactos[0]);
      }
    }
  }

  ngOnDestroy() {
    this.communicationService.disconnect();
  }

  setupWebsocketListeners() {
    const socket = this.communicationService.getSocket();
    if (!socket) return;

    // A) Recibir lista de canales
    socket.on('userChannels', (data: any[]) => {
      console.log('userChannels recibidos:', data);
      
      // Filtrar canales donde el usuario actual es participante
      const canalesFiltrados = data.filter((canal: any) => {
        if (!canal.participantes || !Array.isArray(canal.participantes)) {
          console.warn('Canal sin participantes:', canal);
          return false;
        }
        
        const esParticipante = canal.participantes.some((p: any) => 
          Number(p.id) === Number(this.currentUserId) || 
          Number(p.usuarioId) === Number(this.currentUserId)
        );
        
        if (!esParticipante) {
          console.log(`Canal ${canal.canalId || canal.id} filtrado: usuario ${this.currentUserId} no es participante`);
        }
        
        return esParticipante;
      });
      
      console.log(`Canales filtrados para usuario ${this.currentUserId}:`, canalesFiltrados.length, 'de', data.length);
      
      this.contactos = canalesFiltrados.map((canal: any) => this.mapChannelToContacto(canal));
      
      if (this.contactos.length > 0 && !this.contactoActivo) {
        // Intentar restaurar desde localStorage
        const persistedId = localStorage.getItem('activeChannelId');
        if (persistedId) {
          const found = this.contactos.find(c => c.id === Number(persistedId));
          if (found) {
            console.log('Restaurando canal desde localStorage:', found.id);
            this.seleccionarContacto(found);
          } else {
            this.seleccionarContacto(this.contactos[0]);
          }
        } else {
          this.seleccionarContacto(this.contactos[0]);
        }
      }

      this.tryOpenPendingChat();
      this.cdr.detectChanges();
    });

    // D) Recibir evento cuando se crea un canal
    socket.on('channelCreated', (data: any) => {
       console.log("Evento channelCreated recibido", data);
       this.communicationService.getUserChannels({ usuarioId: this.currentUserId });
    });

    // E) Actualizar estado en línea de usuarios
    socket.on('userOnline', (data: { userId: number }) => {
      console.log('Usuario en línea:', data.userId);
      this.updateUserOnlineStatus(data.userId, true);
    });

    socket.on('userOffline', (data: { userId: number }) => {
      console.log('Usuario fuera de línea:', data.userId);
      this.updateUserOnlineStatus(data.userId, false);
    });

    // B) Recibir historial de mensajes al entrar a un canal
    socket.on('recentMessages', (data: any) => {
      console.log("Evento recentMessages recibido", data);
      
      // Log detallado del primer mensaje para ver su estructura
      if (Array.isArray(data) && data.length > 0) {
        console.log('📊 COMPLETO - Primer mensaje del historial:', JSON.stringify(data[0], null, 2));
        console.log('📊 CAMPOS exactos:', Object.keys(data[0]));
        console.log('📊 Valor de cada campo:', {
          remitenteId: data[0].remitenteId,
          usuarioId: data[0].usuarioId,
          senderId: data[0].senderId,
          userId: data[0].userId,
          user_id: data[0].user_id,
          sender_id: data[0].sender_id,
          remitente: data[0].remitente,
          usuario: data[0].usuario
        });
      }
      
      if (!this.contactoActivo) return;

      // Intentamos verificar si los mensajes pertenecen al canal activo
      let messagesArray = Array.isArray(data) ? data : (data.messages || []);
      const receivedCanalId = Array.isArray(data) ? null : data.canalId;

      if (receivedCanalId && receivedCanalId !== this.contactoActivo.id) {
        console.warn(`Recibidos mensajes para el canal ${receivedCanalId}, pero el activo es ${this.contactoActivo.id}. Ignorando.`);
        return;
      }

      // 🔥 GUARDAR ORIGINALES en localStorage ANTES de mappear
      localStorage.setItem(`messages_raw_${this.contactoActivo.id}`, JSON.stringify(messagesArray));
      
      // Mapear mensajes correctamente
      const mensajesMapeados = messagesArray.map((msg: any) => this.mapMessageToMensaje(msg));
      this.contactoActivo.mensajes = mensajesMapeados;
      
      this.cdr.detectChanges();
    });

    // C) Recibir un nuevo mensaje en tiempo real
    socket.on('newMessage', (data: any) => {
      console.log("Evento newMessage recibido", data);
      const canal = this.contactos.find(c => c.id === data.canalId);
      
      if (canal) {
        const nuevoMsg = this.mapMessageToMensaje(data);
        
        // Evitar duplicados (por si el backend llama al callback y también emite el evento)
        const isDuplicate = canal.mensajes.some(m => 
           m.texto === nuevoMsg.texto && 
           m.enviadoPorMi === nuevoMsg.enviadoPorMi &&
           m.hora === nuevoMsg.hora
        );

        if (!isDuplicate) {
          canal.mensajes.push(nuevoMsg);
          
          // 🔥 Guardar el mensaje ORIGINAL en localStorage
          const mensajesRawActuales = localStorage.getItem(`messages_raw_${canal.id}`);
          let arregloRaw = [];
          if (mensajesRawActuales) {
            try {
              arregloRaw = JSON.parse(mensajesRawActuales);
            } catch (e) {
              arregloRaw = [];
            }
          }
          arregloRaw.push(data); // Agregar el mensaje ORIGINAL
          localStorage.setItem(`messages_raw_${canal.id}`, JSON.stringify(arregloRaw));
        }

        if (this.contactoActivo?.id === canal.id) {
          // Si estamos en este chat abierto, marcamos como leido
          this.communicationService.readMessage({ canalId: canal.id, mensajeId: data.id, usuarioId: this.currentUserId });
        } else {
          // Si no, subimos el contador
          canal.mensajesSinLeer++;
        }
        this.cdr.detectChanges();
      } else {
        console.warn(`Recibido mensaje para un canal (ID ${data.canalId}) que no está en la lista del usuario. Ignorando.`);
      }
    });
  }

  private clearPendingChat() {
    this.pendingChatContactoId = 0;
    this.pendingChatContactoNombre = '';
  }

  private async tryOpenPendingChat() {
    if (!this.pendingChatContactoId || this.currentUserId <= 0) {
      return;
    }

    const existingChat = this.contactos.find(c => c.id === this.pendingChatContactoId);
    if (existingChat) {
      this.seleccionarContacto(existingChat);
      this.clearPendingChat();
      return;
    }

    if (this.communicationService.getSocket()) {
      try {
        console.log('Creando chat directo desde Comunidad...', {
          usuarioId: this.currentUserId,
          contactoId: this.pendingChatContactoId,
          nombre: this.pendingChatContactoNombre
        });
        await this.communicationService.createChannel({
          nombre: this.pendingChatContactoNombre || 'Chat directo',
          participantes: [this.currentUserId, this.pendingChatContactoId],
          esGrupo: false
        });
      } catch (error) {
        console.warn('No se pudo crear el canal directo automáticamente:', error);
      } finally {
        this.communicationService.getUserChannels({ usuarioId: this.currentUserId });
        this.clearPendingChat();
      }
    }
  }

  // Helpers para mapear la BD a tu Interfaz Frontend original
  get contactosFiltrados(): ContactoChat[] {
    if (!this.textoBusqueda.trim()) {
      return this.contactos;
    }
    const txt = this.textoBusqueda.toLowerCase();
    return this.contactos.filter(c => c.nombre.toLowerCase().includes(txt));
  }

  mapChannelToContacto(canal: any): ContactoChat {
    let displayNombre = canal.nombre || 'Canal';
    
    // Lógica para nombre estilo Messenger (solo si no es grupo)
    if (!canal.esGrupo && canal.participantes && Array.isArray(canal.participantes)) {
      const otroUsuario = canal.participantes.find((p: any) => Number(p.id) !== Number(this.currentUserId) && Number(p.usuarioId) !== Number(this.currentUserId));
      
      // Intentar obtener el nombre del campo 'usuario' (relación anidada) o directamente 'nombre'
      if (otroUsuario) {
        displayNombre = otroUsuario.usuario?.nombre || otroUsuario.nombre || otroUsuario.email || displayNombre;
      }
    }

    const iniciales = displayNombre ? displayNombre.substring(0, 2).toUpperCase() : 'C';
    
    let msgPreview: Mensaje[] = [];
    if (canal.ultimoMensaje) {
      msgPreview.push(this.mapMessageToMensaje(canal.ultimoMensaje));
    }
    
    return {
      id: canal.canalId || canal.id, // Manejar si el backend lo envía como 'id' o 'canalId'
      nombre: displayNombre,
      iniciales: iniciales,
      colorBg: canal.esGrupo ? 'bg-purple' : 'bg-blue',
      enLinea: canal.esGrupo ? false : (canal.participantes?.some((p: any) => {
        // Usar isOnline del backend si existe, sino del Set de conectados
        const onlineFromBackend = p.isOnline !== undefined ? p.isOnline : this.connectedUsers.has(Number(p.id) || Number(p.usuarioId));
        p.isOnline = onlineFromBackend; // Actualizar para consistencia
        return onlineFromBackend;
      }) || false),
      mensajesSinLeer: canal.unreadCount || 0,
      mensajes: msgPreview,
      esGrupo: canal.esGrupo, // Guardamos este estado si es útil después
      participantes: canal.participantes || [] // Agregado para actualizar estado en línea
    } as ContactoChat;
  }

  mapMessageToMensaje(msg: any): Mensaje {
    const createdAt = msg.creadoAt || msg.creado_at || msg.createdAt || msg.created_at;
    const d = createdAt ? new Date(createdAt) : new Date();
    const horaStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Arreglar identificación de remitente: puede venir como emisor_id / remitenteId / usuarioId / senderId
    const remitentId = msg.remitenteId || msg.usuarioId || msg.senderId || msg.emisor_id || msg.sender_id || msg.userId || msg.user_id;
    const remitentIdNum = Number(remitentId);
    const currentId = Number(this.currentUserId);
    const esEnviadoPorMi = remitentIdNum > 0 && remitentIdNum === currentId;

    return {
      texto: msg.contenido || msg.texto || '',
      hora: horaStr,
      enviadoPorMi: esEnviadoPorMi,
      tipo: msg.tipo || 'text',
      archivoUrl: msg.archivoUrl || msg.archivo_url || null,
      leido: msg.leido || msg.leido === false ? msg.leido : false // Mapear estado de leído desde BD
    };
  }

  // Cambiar entre chats
  seleccionarContacto(contacto: ContactoChat) {
    console.log('Seleccionando contacto:', contacto.id);
    this.contactoActivo = contacto;
    this.contactoActivo.mensajesSinLeer = 0; // Marcar como leídos
    
    // Persistir ID
    localStorage.setItem('activeChannelId', contacto.id.toString());
    
    // 🔥 Cargar mensajes ORIGINALES del localStorage (si existen) y remappearlos
    const mensajesRawGuardados = localStorage.getItem(`messages_raw_${contacto.id}`);
    if (mensajesRawGuardados) {
      try {
        const mensajesOriginales = JSON.parse(mensajesRawGuardados);
        console.log('Mensajes ORIGINALES restaurados del localStorage:', mensajesOriginales.length);
        
        // Remappear los mensajes originales para obtener el enviadoPorMi correcto
        this.contactoActivo.mensajes = mensajesOriginales.map((msg: any) => this.mapMessageToMensaje(msg));
        console.log('Mensajes remappeados correctamente');
      } catch (e) {
        console.warn('Error al parsear mensajes del localStorage', e);
        this.contactoActivo.mensajes = [];
      }
    } else {
      this.contactoActivo.mensajes = [];
    }
    
    // Al pedir unirse, el socket nos incluirá en el 'room' y luego pedimos el historial
    this.communicationService.joinChannel({ canalId: contacto.id, usuarioId: this.currentUserId });
    this.communicationService.getRecentMessages({ canalId: contacto.id, limit: 100 });
    
    // Marcar como leído
    if (this.communicationService.getSocket()) {
      this.communicationService.getSocket()?.emit('markChannelAsRead', { 
        canalId: contacto.id, 
        usuarioId: this.currentUserId 
      });
    }
  }

  // Lógica para el botón "Enviar"
  enviarMensaje() {
    if (!this.contactoActivo || this.nuevoMensaje.trim() === '') return; // No enviar mensajes vacíos

    // 1. Mandarlo por Socket al Backend
    console.log(`Enviando mensaje al canal ${this.contactoActivo.id} desde el usuario ${this.currentUserId}`);
    this.communicationService.sendMessage({
      canalId: this.contactoActivo.id,
      remitenteId: this.currentUserId,
      contenido: this.nuevoMensaje,
      tipo: 'text',
      archivoUrl: null
    }).then((response) => {
        console.log("Respuesta de sendMessage:", response);
    }).catch(err => console.error("Error al enviar", err));

    // 2. Limpiamos el input
    this.nuevoMensaje = '';
  }

  // ==========================================
  // 📞 ACCIONES DE CABECERA (Llamadas e Info)
  // ==========================================
  iniciarLlamada() {
    if (!this.contactoActivo) return;
    alert(`Iniciando llamada de voz con ${this.contactoActivo.nombre}... 📞`);
  }

  iniciarVideoLlamada() {
    if (!this.contactoActivo) return;
    alert(`Iniciando videollamada con ${this.contactoActivo.nombre}... 🎥`);
  }

  async verInfoContacto() {
    if (!this.contactoActivo) return;
    
    try {
      this.infoCanalActual = await this.communicationService.getChannelInfoRest(this.contactoActivo.id);
      this.mostrarInfoContacto = true;
    } catch (error) {
      console.error('Error al obtener info del canal', error);
      alert('No se pudo cargar la información del contacto.');
    }
  }

  cerrarInfoContacto() {
    this.mostrarInfoContacto = false;
    this.infoCanalActual = null;
  }

  // ==========================================
  // 🗑️ ACCIONES DE CHAT (Eliminar/Salir)
  // ==========================================
  async eliminarChat(eventData: any) {
    try {
      const confirmMsg = this.contactoActivo?.esGrupo 
        ? '¿Estás seguro de que quieres salir de este grupo?' 
        : '¿Estás seguro de que quieres eliminar esta conversación?';
      
      if (!confirm(confirmMsg)) return;

      const canalId = Number(eventData.canalId || eventData.id || this.contactoActivo?.id || 0);
      if (canalId <= 0) {
        throw new Error('ID de canal inválido para eliminar.');
      }

      console.log('Eliminando canal con REST:', canalId);

      const result = await this.communicationService.deleteChannelRest(canalId);
      console.log('Resultado deleteChannelRest:', result);

      if (!result || result.success === false) {
        const message = result?.message || result?.error || 'No se pudo eliminar el chat.';
        alert(message);
        return;
      }

      // Limpiar el estado local completamente
      this.contactos = this.contactos.filter(c => c.id !== canalId);
      localStorage.removeItem('activeChannelId');
      localStorage.removeItem(`messages_raw_${canalId}`);
      localStorage.removeItem(`messages_${canalId}`);

      if (this.contactoActivo?.id === canalId) {
        this.contactoActivo = undefined;
      }

      this.cerrarInfoContacto();
      alert('Se eliminó el chat correctamente.');

      // Opcional: informar al socket si existe conexión
      if (this.communicationService.getSocket()) {
        this.communicationService.deleteChannelEmit({ canalId, usuarioId: this.currentUserId }).then((socketResponse: any) => {
          console.log('Socket deleteChannel response:', socketResponse);
        }).catch((err: any) => {
          console.warn('Socket deleteChannel falló:', err);
        });
      }
    } catch (error) {
      console.error('Error al eliminar el canal:', error);
      alert('Hubo un problema al intentar eliminar la conversación.');
    }
  }

  // ==========================================
  // 📎 ACCIONES DE FOOTER (Archivos y Emojis)
  // ==========================================

  // Función que se ejecuta cuando elijes un archivo de tu PC
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.contactoActivo) {
      console.log("Subiendo archivo...", file);
      try {
        await this.communicationService.uploadFile(this.contactoActivo.id, file);
        // Backend emitirá un 'newMessage' cuando acabe.
      } catch (err) {
        console.error('Error al subir archivo', err);
      }
    }
  }

  // Función temporal para los emojis
  agregarEmoji() {
    this.nuevoMensaje += ' 😊';
  }

  // ==========================================
  // 🆕 CREAR NUEVO CHAT (MODAL CON USUARIOS)
  // ==========================================
  // VARIABLES PARA EL TIPO DE CHAT EN MODAL
  esModoGrupo: boolean = false;
  nombreGrupoNuevo: string = '';
  usuariosSeleccionadosGrupo: Set<number> = new Set();

  abrirModalNuevoChat() {
    this.buscarUsuario = '';
    this.mostrarModalNuevoChat = true;
    this.usuariosBuscados = [];
    this.esModoGrupo = false;
    this.nombreGrupoNuevo = '';
    this.usuariosSeleccionadosGrupo.clear();
    
    // Obtener la lista real de usuarios
    this.usuarioService.getUsers().subscribe({
      next: (users) => {
        // Excluimos al usuario actual de la lista
        this.usuariosSistema = users.filter((u: any) => u.id !== this.currentUserId);
        this.usuariosBuscados = this.usuariosSistema;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error al cargar usuarios del sistema", err);
      }
    });
  }

  toggleUsuarioGrupo(user: User) {
    if (this.usuariosSeleccionadosGrupo.has(user.id)) {
      this.usuariosSeleccionadosGrupo.delete(user.id);
    } else {
      this.usuariosSeleccionadosGrupo.add(user.id);
    }
  }

  crearGrupo() {
    if (!this.nombreGrupoNuevo.trim() || this.usuariosSeleccionadosGrupo.size === 0) {
      alert("Por favor ingresa un nombre y selecciona al menos 1 participante.");
      return;
    }
    
    const participantesArray = Array.from(this.usuariosSeleccionadosGrupo);
    participantesArray.push(this.currentUserId);

    this.communicationService.createChannel({
      nombre: this.nombreGrupoNuevo.trim(),
      descripcion: 'Grupo creado por UI',
      avatarUrl: null,
      esGrupo: true, 
      creadorId: this.currentUserId,
      participanteIds: participantesArray
    }).then(response => {
      if (response.success) {
        console.log('Canal creado:', response.data);
        alert("¡Grupo creado exitosamente!");
        this.communicationService.getUserChannels({ usuarioId: this.currentUserId });
      } else {
        console.error('Error al crear grupo:', response.error);
        alert("Error del servidor al crear grupo: " + (response.error || 'Error desconocido'));
      }
    }).catch(err => {
      console.error("No se pudo crear el grupo", err);
      alert("Ocurrió un error de red al intentar crear el grupo.");
    });
    
    this.cerrarModalNuevoChat();
  }

  filtrarUsuarios() {
    const txt = this.buscarUsuario.toLowerCase();
    if (!txt.trim()) {
      this.usuariosBuscados = this.usuariosSistema;
    } else {
      this.usuariosBuscados = this.usuariosSistema.filter(u => 
        u.nombre.toLowerCase().includes(txt) || 
        u.email.toLowerCase().includes(txt)
      );
    }
  }

  cerrarModalNuevoChat() {
    this.mostrarModalNuevoChat = false;
  }

  iniciarChatConUsuario(user: User) {
    if (this.esModoGrupo) {
      this.toggleUsuarioGrupo(user);
      return;
    }

    const payload = {
      nombre: user.nombre || user.email || `Usuario #${user.id}`,
      descripcion: 'Chat directo',
      avatarUrl: null,
      esGrupo: false, 
      creadorId: this.currentUserId,
      participanteIds: [this.currentUserId, user.id]
    };

    this.communicationService.createChannel(payload).then(response => {
       if (response.success) {
         console.log('Canal directo creado:', response.data);
         alert("¡Chat creado exitosamente!");
         this.communicationService.getUserChannels({ usuarioId: this.currentUserId });
       } else {
         console.error('Error al crear chat:', response.error);
         alert("Error del servidor al crear chat: " + (response.error || 'Error desconocido'));
       }
    }).catch(err => {
      console.error("No se pudo crear el canal", err);
      alert("Ocurrió un error de red al intentar crear el chat.");
    });
    
    // Cerrar modal
    this.cerrarModalNuevoChat();
  }

  // ==========================================  // 🔄 OBTENER USUARIOS CONECTADOS INICIALMENTE
  // ==========================================
  getConnectedUsers() {
    const socket = this.communicationService.getSocket();
    if (!socket) return;

    socket.emit('getConnectedUsers', {}, (response: any) => {
      if (response && response.connectedUsers && Array.isArray(response.connectedUsers)) {
        this.connectedUsers = new Set(response.connectedUsers.map((id: any) => Number(id)));
        console.log('Usuarios conectados inicialmente:', Array.from(this.connectedUsers));
      }
    });
  }

  // ==========================================  // � ACTUALIZAR ESTADO EN LÍNEA DE USUARIOS
  // ==========================================
  updateUserOnlineStatus(userId: number, isOnline: boolean) {
    if (isOnline) {
      this.connectedUsers.add(userId);
    } else {
      this.connectedUsers.delete(userId);
    }
    
    // Actualizar el estado en línea de los contactos que incluyen a este usuario
    this.contactos.forEach(contacto => {
      if (contacto.participantes && Array.isArray(contacto.participantes)) {
        const participant = contacto.participantes.find((p: any) => 
          Number(p.id) === Number(userId) || Number(p.usuarioId) === Number(userId)
        );
        if (participant) {
          participant.isOnline = isOnline;
          // Para chats directos, actualizar el enLinea del contacto
          if (!contacto.esGrupo) {
            contacto.enLinea = isOnline;
          } else {
            // Para grupos, actualizar si al menos uno está en línea
            contacto.enLinea = contacto.participantes.some((p: any) => p.isOnline);
          }
        }
      }
    });
    this.cdr.detectChanges();
  }

  // ==========================================
  // �🔌 DATOS DE PRUEBA (MOCK) PARA EL DISEÑO
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
}
