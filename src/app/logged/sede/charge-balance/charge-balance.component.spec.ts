import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeBalanceComponent } from './charge-balance.component';

describe('ChargeBalanceComponent', () => {
  let component: ChargeBalanceComponent;
  let fixture: ComponentFixture<ChargeBalanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChargeBalanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargeBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
