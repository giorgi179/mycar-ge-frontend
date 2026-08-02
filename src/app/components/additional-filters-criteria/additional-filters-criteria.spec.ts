import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalFiltersCriteria } from './additional-filters-criteria';

describe('AdditionalFiltersCriteria', () => {
  let component: AdditionalFiltersCriteria;
  let fixture: ComponentFixture<AdditionalFiltersCriteria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalFiltersCriteria],
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalFiltersCriteria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
