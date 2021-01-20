import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditBindingsComponent } from './create-edit-bindings.component';

describe('CreateEditBindingsComponent', () => {
  let component: CreateEditBindingsComponent;
  let fixture: ComponentFixture<CreateEditBindingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateEditBindingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEditBindingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
