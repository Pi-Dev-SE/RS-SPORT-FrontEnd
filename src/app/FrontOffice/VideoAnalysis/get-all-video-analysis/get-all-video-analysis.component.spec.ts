import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetAllVideoAnalysisComponent } from './get-all-video-analysis.component';

describe('GetAllVideoAnalysisComponent', () => {
  let component: GetAllVideoAnalysisComponent;
  let fixture: ComponentFixture<GetAllVideoAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GetAllVideoAnalysisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GetAllVideoAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
