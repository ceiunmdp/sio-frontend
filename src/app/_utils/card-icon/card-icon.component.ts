import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'cei-card-icon',
    templateUrl: './card-icon.component.html',
    styleUrls: ['./card-icon.component.scss']
})
export class CardIconComponent implements OnInit {
    @Input() clickable = false;
    @Input() icon: string;
    @Input() text: string;
    @Input() iconWidth = 60;
    @Input() iconHeight = 60;

    isMouseOut = true;

    constructor() { }

    ngOnInit() { }

    changeStyle($event) {
        if ($event.type == 'mouseover') {
            this.isMouseOut = false;
        } else {
            this.isMouseOut = true;
        }
    }
}
