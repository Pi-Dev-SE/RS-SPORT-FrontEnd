import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoveryCalendarComponent } from './recovery-calendar.component';

describe('RecoveryCalendarComponent', () => {
  let component: RecoveryCalendarComponent;
  let fixture: ComponentFixture<RecoveryCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecoveryCalendarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecoveryCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
