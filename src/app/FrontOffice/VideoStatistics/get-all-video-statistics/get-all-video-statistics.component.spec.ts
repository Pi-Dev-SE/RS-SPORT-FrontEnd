import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetAllVideoStatisticsComponent } from './get-all-video-statistics.component';

describe('GetAllVideoStatisticsComponent', () => {
  let component: GetAllVideoStatisticsComponent;
  let fixture: ComponentFixture<GetAllVideoStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GetAllVideoStatisticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetAllVideoStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
