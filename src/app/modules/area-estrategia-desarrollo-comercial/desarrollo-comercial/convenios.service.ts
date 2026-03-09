import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface ConvenioDto {
  id?: string;
  nombre: string;
  fecha: string;
  siglas?: string;
  color?: string;
  logo?: string;
  estado: string;
  ruc?: string;
  rubro?: string;
  contacto?: string;
  telefono?: string;
  comentarios?: string[];
  historial?: string[];
}

@Injectable({ providedIn: 'root' })
export class ConveniosService {
  private readonly apiUrl = 'http://localhost:3005/convenios';

  constructor(private http: HttpClient) {}

  getConvenios(busqueda?: string, estado?: string): Observable<ConvenioDto[]> {
    let params = new HttpParams();
    if (busqueda) params = params.set('search', busqueda);
    if (estado) params = params.set('estado', estado);

    return this.http.get<ConvenioDto[]>(this.apiUrl, { params }).pipe(catchError(() => of([])));
  }

  updateConvenio(convenio: ConvenioDto): Observable<ConvenioDto> {
    if (!convenio.id) return of(convenio);
    return this.http
      .put<ConvenioDto>(`${this.apiUrl}/${convenio.id}`, convenio)
      .pipe(catchError(() => of(convenio)));
  }

  addComentario(convenioId: string, usuario: string, comentario: string) {
    if (!convenioId) return of(null);
    return this.http
      .post<ConvenioDto>(`${this.apiUrl}/${convenioId}/comentarios`, {
        usuario,
        comentario,
      })
      .pipe(catchError(() => of(null)));
  }
}
