import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeFiltre } from './home-filtre';

describe('HomeFiltre', () => {
  let component: HomeFiltre;
  let fixture: ComponentFixture<HomeFiltre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeFiltre],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeFiltre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
