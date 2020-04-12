import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
   selector: 'cei-balance',
   templateUrl: './balance.component.html',
   styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit {
   smallScreen: boolean = false;
   firstFormGroup: FormGroup;
   secondFormGroup: FormGroup;

   constructor(private breakpointObserver: BreakpointObserver) {}

   ngOnInit() {
      // this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).subscribe(result => {
      //    this.smallScreen = result.matches;
      // });
   }
}
