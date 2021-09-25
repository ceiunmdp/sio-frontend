import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DniDialogComponent } from './dni-dialog.component';

describe('DniDialogComponent', () => {
  let component: DniDialogComponent;
  let fixture: ComponentFixture<DniDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DniDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DniDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
