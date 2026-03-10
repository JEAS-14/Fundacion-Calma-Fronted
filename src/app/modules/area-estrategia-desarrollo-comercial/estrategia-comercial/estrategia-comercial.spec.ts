import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstrategiaComercial } from './estrategia-comercial';

describe('EstrategiaComercial', () => {
  let component: EstrategiaComercial;
  let fixture: ComponentFixture<EstrategiaComercial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstrategiaComercial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstrategiaComercial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
