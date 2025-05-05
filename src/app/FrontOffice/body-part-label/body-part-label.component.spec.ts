import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyPartLabelComponent } from './body-part-label.component';

describe('BodyPartLabelComponent', () => {
  let component: BodyPartLabelComponent;
  let fixture: ComponentFixture<BodyPartLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BodyPartLabelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BodyPartLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
