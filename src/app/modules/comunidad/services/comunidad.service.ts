import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';

export interface PermisoArea {
  puede_publicar: boolean;
  puede_editar: boolean;
  permitir_subareas: boolean;
}

export interface Area {
  id: number;
  nombre: string;
  padre_id: number | null;
  es_externa: boolean;
  permisos: PermisoArea;
  subareas: Area[];
}

export interface AccesoArea {
  tieneAcceso: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ComunidadService {
  private apiUrl = 'http://localhost:3005/api/comunidad';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
  }

  getAreas(todasParaAdmin = false): Observable<Area[]> {
    const url = todasParaAdmin
      ? `${this.apiUrl}/areas?todas=true`
      : `${this.apiUrl}/areas`;
    return this.http.get<Area[]>(url, { headers: this.getHeaders() });
  }

  verificarAcceso(id: number): Observable<AccesoArea> {
    return this.http.get<AccesoArea>(`${this.apiUrl}/areas/${id}/acceso`, {
      headers: this.getHeaders()
    });
  }
}