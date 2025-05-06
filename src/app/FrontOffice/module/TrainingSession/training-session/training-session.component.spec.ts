import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingSessionsComponent } from './training-session.component';
describe('TrainingSessionComponent', () => {
  let component: TrainingSessionsComponent;
  let fixture: ComponentFixture<TrainingSessionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrainingSessionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrainingSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
