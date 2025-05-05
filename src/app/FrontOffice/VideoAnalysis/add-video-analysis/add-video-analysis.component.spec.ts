import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVideoAnalysisComponent } from './add-video-analysis.component';

describe('AddVideoAnalysisComponent', () => {
  let component: AddVideoAnalysisComponent;
  let fixture: ComponentFixture<AddVideoAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddVideoAnalysisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddVideoAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
