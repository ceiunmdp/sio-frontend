import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatStepperModule, MatTabsModule, MatToolbarModule} from '@angular/material';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {SectionsModule} from '../sections/sections.module';
import {DirectivesModule} from '../_directives/directives.module';
import {UtilsModule} from '../_utils/utils.module';
import {LoggedRoutingModule} from './logged-routing.module';
import {LoggedComponent} from './logged.component';
import {NavbarComponent} from './sections/navbar/navbar.component';

@NgModule({
   declarations: [LoggedComponent, NavbarComponent],
   imports: [
      CommonModule,
      LoggedRoutingModule,
      MatSidenavModule,
      MatCardModule,
      FlexLayoutModule,
      MatDividerModule,
      MatListModule,
      MatTabsModule,
      MatStepperModule,
      MatButtonModule,
      MatTableModule,
      MatToolbarModule,
      MatIconModule,
      MatMenuModule,
      UtilsModule,
      MatBadgeModule,
      DirectivesModule,
      SectionsModule,
      MatTooltipModule
   ]
})
export class LoggedModule { }
