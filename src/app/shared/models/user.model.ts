export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido?: string;
  foto_url?: string | null;
  fotoUrl?: string | null;
  rol: string; // Director, Usuario, etc.
}

export interface LoginResponse {
  access_token: string;
  usuario: User;
}
