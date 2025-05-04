import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatExerciceComponent } from './creat-exercice.component';

describe('CreatExerciceComponent', () => {
  let component: CreatExerciceComponent;
  let fixture: ComponentFixture<CreatExerciceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreatExerciceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreatExerciceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
