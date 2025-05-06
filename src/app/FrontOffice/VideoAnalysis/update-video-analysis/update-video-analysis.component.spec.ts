import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateVideoAnalysisComponent } from './update-video-analysis.component';

describe('UpdateVideoAnalysisComponent', () => {
  let component: UpdateVideoAnalysisComponent;
  let fixture: ComponentFixture<UpdateVideoAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateVideoAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateVideoAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
