import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextSearchingInputComponent } from './text-searching-input.component';

describe('TextSearchingInputComponent', () => {
  let component: TextSearchingInputComponent;
  let fixture: ComponentFixture<TextSearchingInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextSearchingInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextSearchingInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
