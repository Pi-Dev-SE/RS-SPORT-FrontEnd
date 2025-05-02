import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulationViewerComponent } from './simulation-viewer.component';

describe('SimulationViewerComponent', () => {
  let component: SimulationViewerComponent;
  let fixture: ComponentFixture<SimulationViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SimulationViewerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SimulationViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
