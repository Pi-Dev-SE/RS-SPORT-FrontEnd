import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllPostComponent } from './view-all-post.component';

describe('ViewAllPostComponent', () => {
  let component: ViewAllPostComponent;
  let fixture: ComponentFixture<ViewAllPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewAllPostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAllPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
