import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormElementComponent } from '../form-element/form-element.component';

@Component({
  selector: 'cei-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss']
})
export class FileInputComponent extends FormElementComponent implements OnInit {

  @ViewChild('myPond', {static: false}) myPond: any;
  @Input() options: any;
  @Input() files: Map<any, any>;

  constructor() {
    super();
  }

  ngOnInit() {
  }

  pondHandleInit() {
    console.log('FilePond has initialised', this.myPond);
  }

  pondHandleAddFile(event: any) {
    this.files.set(event.file.id, { name: event.file.filename, dataUrl: !event.error? event.file.getFileEncodeDataURL(): '' , error: !!event.error});
    this.form.get(this.name).setValue(Array.from(this.files.values()).findIndex((value, _, __) => value.error) === -1);
  }

  pondHandleRemoveFile(event: any) {
    this.files.delete(event.file.id);
    if(this.files.size === 0)
      this.form.get(this.name).setValue(null);
    else 
    this.form.get(this.name).setValue(Array.from(this.files.values()).findIndex((value, _, __) => value.error) === -1);
  }

}
