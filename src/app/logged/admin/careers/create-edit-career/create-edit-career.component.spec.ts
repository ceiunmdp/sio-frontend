import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditCareerComponent } from './create-edit-career.component';

describe('CreateEditCareerComponent', () => {
  let component: CreateEditCareerComponent;
  let fixture: ComponentFixture<CreateEditCareerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateEditCareerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEditCareerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
