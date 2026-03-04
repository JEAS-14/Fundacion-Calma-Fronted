export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: string; // Director, Usuario, etc.
}

export interface LoginResponse {
  access_token: string;
  usuario: User;
}
