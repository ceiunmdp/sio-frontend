import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { _OnDataChange as dataFiles } from '../../components/files/files.component';

@Component({
  selector: 'cei-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.scss']
})
export class NewOrderComponent implements OnInit {
  dataFiles: dataFiles;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
  }

  onStepChange(stepperSelection: StepperSelectionEvent) {
    console.log(stepperSelection);
  }

  onChangeDataFiles(dataFiles: dataFiles) {

    this.dataFiles = { ...dataFiles };
    // Reference a new array to force fire change detection
    this.dataFiles.data = [...dataFiles.data];
    this.cd.detectChanges();
    console.log(dataFiles)
  }

}
