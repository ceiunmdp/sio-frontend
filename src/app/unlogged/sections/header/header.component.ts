import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GeneralService } from 'src/app/_services/general.service';

@Component({
   selector: 'cei-header',
   templateUrl: './header.component.html',
   styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
   constructor(private generalService: GeneralService) {}

   ngOnInit() {}

   toggleDarkTheme(checked: boolean) {
      this.generalService.setDarkTheme(checked);
   }
}
