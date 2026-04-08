import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode'; 


@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private socket: Socket | null = null;
  private jwtToken: string = '';

  constructor() { }

  connect(jwtToken: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.jwtToken = jwtToken;

      this.socket = io('http://localhost:3005/comunicaciones', {
        auth: {
          token: jwtToken,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('Conectado a WebSocket');
        resolve();
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('Error de conexión:', error);
        reject(error);
      });

      this.socket.on('unauthorized', (data: any) => {
        console.error('No autorizado:', data?.message);
        reject(new Error('Unauthorized'));
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  getCurrentUserId(): number {
    const token = localStorage.getItem('calma_token') || this.jwtToken;
    if (!token) return 0;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.sub || decoded.userId || 0; // Ajustar según payload JWT
    } catch (error) {
      console.warn('Error decodificando JWT:', error);
      return 0;
    }
  }
  

  // EVENTOS QUE EL FRONT-END DEBE EMITIR

  // A) Crear Canal
  createChannel(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject("No hay conexión Socket");
      }

      // Fallback de timeout por si el Backend se queda callado (no llama al callback)
      const timer = setTimeout(() => {
        resolve({ error: "El servidor demoró demasiado en responder (Timeout)." });
      }, 5000);

      this.socket.emit('createChannel', data, (response: any) => {
        clearTimeout(timer);
        resolve(response);
      });
    });
  }

  // B) Unirse a un Canal
  joinChannel(data: { canalId: number, usuarioId: number }): Promise<any> {
    return new Promise((resolve) => {
      this.socket?.emit('joinChannel', data, (response: any) => {
        resolve(response);
      });
    });
  }

  // C) Enviar Mensaje
  sendMessage(data: { canalId: number, remitenteId: number, contenido: string, tipo: string, archivoUrl: string | null }): Promise<any> {
    return new Promise((resolve) => {
      this.socket?.emit('sendMessage', data, (response: any) => {
        resolve(response);
      });
    });
  }

  // D) Obtener Canales del Usuario
  getUserChannels(data: { usuarioId: number }): void {
    this.socket?.emit('getUserChannels', data);
  }

  // E) Obtener Info del Canal
  getChannelInfoEmit(data: { canalId: number }): void {
    this.socket?.emit('channelInfo', data);
  }

  // F) Actualizar Canal
  updateChannelEmit(data: any): void {
    this.socket?.emit('updateChannel', data);
  }

  // G) Obtener Mensajes Recientes
  getRecentMessages(data: { canalId: number, limit?: number }): void {
    this.socket?.emit('getRecentMessages', data);
  }

  // H) Editar Mensaje
  editMessage(data: { canalId: number, mensajeId: number, remitenteId: number, contenido: string }): void {
    this.socket?.emit('editMessage', data);
  }

  // I) Borrar Mensaje
  deleteMessage(data: { canalId: number, mensajeId: number, remitenteId: number }): void {
    this.socket?.emit('deleteMessage', data);
  }

  // J) Añadir Reacción
  addReactionEmit(data: { mensajeId: number, usuarioId: number, emoji: string }): Promise<any> {
    return new Promise((resolve) => {
      this.socket?.emit('addReaction', data, (response: any) => {
        resolve(response);
      });
    });
  }

  // K) Remover Reacción
  removeReactionEmit(data: { mensajeId: number, usuarioId: number, emoji: string }): void {
    this.socket?.emit('removeReaction', data);
  }

  // L) Obtener Reacciones del Mensaje
  getReactionsEmit(data: { mensajeId: number }): void {
    this.socket?.emit('getReactions', data);
  }

  // M) Marcar Mensaje como Leído
  readMessage(data: { canalId: number, mensajeId: number, usuarioId: number }): void {
    this.socket?.emit('readMessage', data);
  }

  // N) Añadir Participante
  addParticipant(data: { canalId: number, usuarioId: number, actorId: number }): void {
    this.socket?.emit('addParticipant', data);
  }

  // O) Remover Participante
  removeParticipant(data: { canalId: number, usuarioId: number, actorId: number }): void {
    this.socket?.emit('removeParticipant', data);
  }

  // P) Salir del Canal
  // ✅ CORRECTO (con callback como los otros)
  leaveChannel(data: { canalId: number, usuarioId: number }): Promise<any> {
    return new Promise((resolve) => {
      this.socket?.emit('leaveChannel', data, (response: any) => {
        resolve(response);
      });
    });
  }

  // API REST (para archivos)
  async uploadFile(canalId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `http://localhost:3005/api/comunicaciones/channels/${canalId}/files`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        },
        body: formData
      }
    );
    return response.json();
  }

  // Eliminar Canal completo usando REST
  async deleteChannelRest(canalId: number): Promise<any> {
    const response = await fetch(
      `http://localhost:3005/api/comunicaciones/channels/${canalId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.message || result?.error || `Error ${response.status}`);
    }
    return result;
  }

  // Emitir eliminación de canal por socket (opcional)
  deleteChannelEmit(data: { canalId: number, usuarioId: number }): Promise<any> {
    return new Promise((resolve) => {
      this.socket?.emit('deleteChannel', data, (response: any) => {
        resolve(response);
      });
    });
  }

  // Obtener Info del Canal (REST)
  async getChannelInfoRest(canalId: number): Promise<any> {
    const response = await fetch(
      `http://localhost:3005/api/comunicaciones/channels/${canalId}/info`,
      {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }
    );
    return response.json();
  }

  // Actualizar Canal (REST alternativo)
  async updateChannelRest(canalId: number, data: any): Promise<any> {
    const response = await fetch(
      `http://localhost:3005/api/comunicaciones/channels/${canalId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );
    return response.json();
  }

  // Añadir Reacción (REST alternativo)
  async addReactionRest(mensajeId: number, usuarioId: number, emoji: string): Promise<any> {
    const response = await fetch(
      `http://localhost:3005/api/comunicaciones/messages/${mensajeId}/reactions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuarioId, emoji })
      }
    );
    return response.json();
  }
}

