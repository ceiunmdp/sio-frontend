import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesConfigComponent } from './files-config.component';

describe('FilesConfigComponent', () => {
  let component: FilesConfigComponent;
  let fixture: ComponentFixture<FilesConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilesConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
