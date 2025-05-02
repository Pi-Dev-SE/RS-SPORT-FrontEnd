import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetVideoStatisticsByIdComponent } from './get-video-statistics-by-id.component';

describe('GetVideoStatisticsByIdComponent', () => {
  let component: GetVideoStatisticsByIdComponent;
  let fixture: ComponentFixture<GetVideoStatisticsByIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GetVideoStatisticsByIdComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GetVideoStatisticsByIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
