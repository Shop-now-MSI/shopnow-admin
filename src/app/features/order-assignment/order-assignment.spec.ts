import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderAssignment } from './order-assignment';

describe('OrderAssignment', () => {
  let component: OrderAssignment;
  let fixture: ComponentFixture<OrderAssignment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderAssignment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderAssignment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
