import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertErrorChildComponent } from './alert-error-child.component';

describe('AlertErrorChildComponent', () => {
  let component: AlertErrorChildComponent;
  let fixture: ComponentFixture<AlertErrorChildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertErrorChildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertErrorChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
