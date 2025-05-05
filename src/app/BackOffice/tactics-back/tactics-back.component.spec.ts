import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TacticsBackComponent } from './tactics-back.component';

describe('TacticsBackComponent', () => {
  let component: TacticsBackComponent;
  let fixture: ComponentFixture<TacticsBackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TacticsBackComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TacticsBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
