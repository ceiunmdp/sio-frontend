import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { Subscription, fromEvent, timer } from 'rxjs';
import { filter, startWith, skip, debounce, map } from 'rxjs/operators';

@Component({
  selector: 'cei-text-searching-input',
  templateUrl: './text-searching-input.component.html',
  styleUrls: ['./text-searching-input.component.scss']
})
export class TextSearchingInputComponent implements OnInit {
  @ViewChild('inputSearch', { static: false }) inputSearch: ElementRef;
  @Input() placeholder;
  @Input() label;
  @Input() inputFilterValue = '';
  @Output() onSearch = new EventEmitter<string>();
  _input: Subscription;
  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.listenInput();
  }

  ngOnDestroy(): void {
    this._input.unsubscribe();
  }

  listenInput() {
    setTimeout(() => {
      this._input = fromEvent(this.inputSearch.nativeElement, 'keyup').
        pipe(
          filter((e: KeyboardEvent) => !e.key.includes('Arrow')),
          map((event: any) => event.target.value),
          startWith(''),
          // filter((value: string) => (value.length != 1 && value.length != 2)),
          skip(1),
          debounce((string: string) => (string.length > 1) ? timer(500) : timer(1250))
        ).subscribe((st) => {
          console.log(st);
          this.onSearch.emit(st);
        });
    }, 500)
  }

}
