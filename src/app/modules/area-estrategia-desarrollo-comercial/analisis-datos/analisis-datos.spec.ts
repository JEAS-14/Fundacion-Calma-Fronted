import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalisisDatos } from './analisis-datos';

describe('AnalisisDatos', () => {
  let component: AnalisisDatos;
  let fixture: ComponentFixture<AnalisisDatos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalisisDatos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalisisDatos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
