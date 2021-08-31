import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditCampusesComponent } from './create-edit-campuses.component';

describe('CreateEditCampusesComponent', () => {
  let component: CreateEditCampusesComponent;
  let fixture: ComponentFixture<CreateEditCampusesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateEditCampusesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEditCampusesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
