import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Relation } from 'src/app/_models/relation';
import { AdminService } from 'src/app/_services/admin.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { CustomValidators } from 'src/app/_validators/custom-validators';

@Component({
  selector: 'cei-create-edit-relation',
  templateUrl: './create-edit-relation.component.html',
  styleUrls: ['./create-edit-relation.component.scss']
})
export class CreateEditRelationComponent implements OnInit {
  @Input() relations: Relation[];
  @Input() relation: Relation; // if this input is not null -> edit else -> create
  @Output('created') onCreated = new EventEmitter();
  @Output('cancelled') onCancelled = new EventEmitter();
  isLoadingPostRelation = false;
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;

  relationForm: FormGroup;
  public readonly NAMES_FORM_POST_RELATION = {
    RELATION_NAME: 'name',
  };

  constructor(private adminService: AdminService, public router: Router, private formBuilder: FormBuilder, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService) { }

  ngOnInit() {
    this.relationForm = this.createRelationForm(this.relation);
  }

  createRelationForm(relation?: Relation): FormGroup {
    const names = this.NAMES_FORM_POST_RELATION;

    return this.formBuilder.group({
      [names.RELATION_NAME]: [!!relation && !!relation.name ? relation.name : '', [CustomValidators.required("Nombre de la relación requerido")]],
    });
  }

  onSubmitRelationForm() {
    !!this.relation ? this.patchRelation(this.relation.id) : this.postRelation();
  }

  onClickCancel() {
    this.onCancelled.emit();
  }

  // Services

  postRelation() {
    this.isLoadingPostRelation = true;
    this.adminService.postRelation(this.relationForm.value).subscribe(response => {
    },
    err => {this.handleErrors(err); this.isLoadingPostRelation = false},
    () => { this.isLoadingPostRelation = false; this.onCreated.emit() }
    );
  }

  patchRelation(relationId: string) {
    this.isLoadingPostRelation = true;
    this.adminService.patchRelation(this.relationForm.value, relationId).subscribe(response => {
    }, err => {this.handleErrors(err); this.isLoadingPostRelation = false;}, () => { this.isLoadingPostRelation = false; this.onCreated.emit() });
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }
}