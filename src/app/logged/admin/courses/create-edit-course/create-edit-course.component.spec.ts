import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditCourseComponent } from './create-edit-course.component';

describe('CreateEditCourseComponent', () => {
  let component: CreateEditCourseComponent;
  let fixture: ComponentFixture<CreateEditCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateEditCourseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEditCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
