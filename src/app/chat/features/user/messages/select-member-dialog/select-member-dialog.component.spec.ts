import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMemberDialogComponent } from './select-member-dialog.component';

describe('SelectMemberDialogComponent', () => {
  let component: SelectMemberDialogComponent;
  let fixture: ComponentFixture<SelectMemberDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectMemberDialogComponent]
    });
    fixture = TestBed.createComponent(SelectMemberDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
