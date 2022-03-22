import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditRelationComponent } from './create-edit-relation.component';

describe('CreateEditRelationComponent', () => {
  let component: CreateEditRelationComponent;
  let fixture: ComponentFixture<CreateEditRelationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateEditRelationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEditRelationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
