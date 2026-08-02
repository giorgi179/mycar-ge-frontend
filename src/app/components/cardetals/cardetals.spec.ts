import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cardetals } from './cardetals';

describe('Cardetals', () => {
  let component: Cardetals;
  let fixture: ComponentFixture<Cardetals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cardetals],
    }).compileComponents();

    fixture = TestBed.createComponent(Cardetals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
