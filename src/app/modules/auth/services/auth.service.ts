import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { User, LoginResponse } from '../../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3005/auth';
  private tokenKey = 'calma_token';
  private userKey = 'calma_user';

  private http = inject(HttpClient);

  login(email: string, password: string): Observable<LoginResponse> {
    const body = { email, password };

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, body).pipe(
      tap(respuesta => {
        if (respuesta.access_token && respuesta.usuario) {
          // Guardamos el token
          localStorage.setItem(this.tokenKey, respuesta.access_token);
          // Guardamos los datos del usuario (incluyendo el rol)
          localStorage.setItem(this.userKey, JSON.stringify(respuesta.usuario));
          console.log(`✅ Sesión iniciada para: ${respuesta.usuario.nombre} (${respuesta.usuario.rol})`);
        }
      })
    );
  }

  logout(): void {
    console.log('👋 Cerrando sesión...');
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    console.log('✅ Sesión cerrada');
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // 🆕 Obtener datos del usuario actual
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.userKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  // 🆕 Obtener el rol del usuario
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.rol || null;
  }

  // Verificar si es admin/director
  isAdmin(): boolean {
    const rol = this.getUserRole();
    return rol === 'Director' || rol === 'admin';
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
