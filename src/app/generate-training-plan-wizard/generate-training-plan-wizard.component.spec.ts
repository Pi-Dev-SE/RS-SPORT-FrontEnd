import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateTrainingPlanWizardComponent } from './generate-training-plan-wizard.component';

describe('GenerateTrainingPlanWizardComponent', () => {
  let component: GenerateTrainingPlanWizardComponent;
  let fixture: ComponentFixture<GenerateTrainingPlanWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GenerateTrainingPlanWizardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenerateTrainingPlanWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
