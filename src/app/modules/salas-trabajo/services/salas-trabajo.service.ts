import { Injectable } from '@angular/core';

export interface Sala {
  nombre: string;
  link: string;
}

export interface GrupoSalas {
  area: string;
  salas: Sala[];
}

@Injectable({
  providedIn: 'root',
})
export class SalasTrabajoService{
    getSalaGeneral(): Sala {
    return {
      nombre: 'Sala General - Estrategia y Desarrollo Comercial',
      link: 'https://meet.google.com/mvn-sncz-zgs'
    };
  }

  getSalasEquipos(): GrupoSalas[] {
    return [
      {
        area: 'Estrategia y Desarrollo Comercial',
        salas: [
          {
            nombre: 'Estrategia Comercial',
            link: 'https://meet.google.com/ebu-zseu-wnp'
          },
          {
            nombre: 'Análisis de datos',
            link: 'https://meet.google.com/tyb-roiq-eby'
          },
          {
            nombre: 'Desarrollo Comercial',
            link: 'https://meet.google.com/fev-smkn-uiv'
          }
        ]
      }
    ];
  }
}
