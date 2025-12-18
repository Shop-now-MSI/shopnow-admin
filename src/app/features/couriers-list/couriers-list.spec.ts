import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouriersList } from './couriers-list';

describe('CouriersList', () => {
  let component: CouriersList;
  let fixture: ComponentFixture<CouriersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouriersList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouriersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
