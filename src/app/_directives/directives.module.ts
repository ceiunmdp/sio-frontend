import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HoverDirective } from './directives/hover.directive';
import { MaterialElevationDirective } from './directives/material-elevation.directive';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [HoverDirective, MaterialElevationDirective],
    exports: [HoverDirective, MaterialElevationDirective]
})
export class DirectivesModule { }
