import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetVideoAnalysisByIdComponent } from './get-video-analysis-by-id.component';

describe('GetVideoAnalysisByIdComponent', () => {
  let component: GetVideoAnalysisByIdComponent;
  let fixture: ComponentFixture<GetVideoAnalysisByIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GetVideoAnalysisByIdComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GetVideoAnalysisByIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
