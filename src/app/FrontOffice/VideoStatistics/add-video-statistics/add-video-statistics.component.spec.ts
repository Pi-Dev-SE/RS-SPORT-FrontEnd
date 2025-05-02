import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVideoStatisticsComponent } from './add-video-statistics.component';

describe('AddVideoStatisticsComponent', () => {
  let component: AddVideoStatisticsComponent;
  let fixture: ComponentFixture<AddVideoStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddVideoStatisticsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddVideoStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
