import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoveryRegimeFormComponent } from './recovery-regime-form.component';

describe('RecoveryRegimeFormComponent', () => {
  let component: RecoveryRegimeFormComponent;
  let fixture: ComponentFixture<RecoveryRegimeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecoveryRegimeFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecoveryRegimeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
