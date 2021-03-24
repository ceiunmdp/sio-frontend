import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RingConfigComponent } from './ring-config.component';

describe('RingConfigComponent', () => {
  let component: RingConfigComponent;
  let fixture: ComponentFixture<RingConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RingConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RingConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
