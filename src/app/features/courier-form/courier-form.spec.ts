import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourierForm } from './courier-form';

describe('CourierForm', () => {
  let component: CourierForm;
  let fixture: ComponentFixture<CourierForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourierForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourierForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
