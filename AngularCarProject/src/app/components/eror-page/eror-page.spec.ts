import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErorPage } from './eror-page';

describe('ErorPage', () => {
  let component: ErorPage;
  let fixture: ComponentFixture<ErorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErorPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ErorPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
