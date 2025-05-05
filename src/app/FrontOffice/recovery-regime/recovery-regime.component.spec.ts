import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoveryRegimeComponent } from './recovery-regime.component';

describe('RecoveryRegimeComponent', () => {
  let component: RecoveryRegimeComponent;
  let fixture: ComponentFixture<RecoveryRegimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecoveryRegimeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecoveryRegimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
