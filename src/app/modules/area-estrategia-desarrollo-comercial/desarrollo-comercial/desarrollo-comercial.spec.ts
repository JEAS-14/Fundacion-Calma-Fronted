import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesarrolloComercial } from './desarrollo-comercial';

describe('DesarrolloComercial', () => {
  let component: DesarrolloComercial;
  let fixture: ComponentFixture<DesarrolloComercial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesarrolloComercial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesarrolloComercial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
