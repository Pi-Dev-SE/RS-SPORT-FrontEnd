import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalArchivesComponent } from './medical-archives.component';

describe('MedicalArchivesComponent', () => {
  let component: MedicalArchivesComponent;
  let fixture: ComponentFixture<MedicalArchivesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MedicalArchivesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MedicalArchivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
