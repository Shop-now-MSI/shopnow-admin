import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursierDetails } from './coursier-details';

describe('CoursierDetails', () => {
  let component: CoursierDetails;
  let fixture: ComponentFixture<CoursierDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursierDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursierDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
