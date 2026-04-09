import { Component, OnInit } from '@angular/core';
import { GrupoSalas, Sala, SalasTrabajoService } from '../../services/salas-trabajo.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-salas-trabajo',
  imports: [FormsModule, CommonModule],
  templateUrl: './salas-trabajo.html',
  styleUrl: './salas-trabajo.scss',
})
export class SalasTrabajo implements OnInit {

  salaGeneral!: Sala;
  grupos: GrupoSalas[] = [];

  constructor(private salasTrabajoService: SalasTrabajoService) {}

  ngOnInit(): void {
    this.salaGeneral = this.salasTrabajoService.getSalaGeneral();
    this.grupos = this.salasTrabajoService.getSalasEquipos();
  }

  entrar(link: string) {
    window.open(link, '_blank');
  }

}
