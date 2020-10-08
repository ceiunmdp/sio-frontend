import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Router } from '@angular/router';
import { Course } from 'src/app/_models/orders/course';
import { Career } from 'src/app/_models/orders/career';
import { HttpErrorResponse } from '@angular/common/http';
import { saveAs } from "file-saver";
import { OrdersService, TREE_TYPES } from 'src/app/logged/orders/orders.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { File } from 'src/app/_models/orders/file';
import { Year } from 'src/app/_models/orders/year';
import { FilterBuilder, OPERATORS } from 'src/app/_helpers/filterBuilder';


interface Node {
  name: string;
  children?: Node[];
}
@Component({
  selector: 'cei-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {

  @ViewChild("alertError", { static: true }) alertError;

  dataSource = new MatTreeNestedDataSource<any>();
  treeArchivos;
  treeControl = new NestedTreeControl<any>(node => node.children);
  messageError: string;

  errorResponse = false;
  loadingResponse = false;


  constructor(private filesService: OrdersService, private cd: ChangeDetectorRef, public router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService) { }

  ngOnInit() {
    this.getCareers();
  }

  // !: Cambiar en el repo original
  hasChild = (_: number, node: Node) => !!node.children;


  getCareers() {
    this.loadingResponse = true
    this.filesService.getCareers().toPromise().then(
      careers => { this.dataSource.data = careers; this.loadingResponse = false },
      error => {
        this.errorResponse = true; this.loadingResponse = false;
        this.handleErrors(error);
      }
    )
  }

  // !: Este handler no está en el repo original
  onClickTreeNode(node: Career | Course | Year) {
    // Pregunto para saber si el node que vino es un curso 
    // (y por lo tanto va a requerir una request)
    console.log(this.dataSource.data);
    console.log(node);
    if (node.children && this.treeControl.isExpanded(node)) {
      switch (node.type) {
        case TREE_TYPES.CAREER:
          // GET A relations con career id
          this.getYearsByCareerService(node).then(years => { console.log('años:', years); this.addYears(years) });
          break;
        case TREE_TYPES.YEAR:
          // GET A relations con career id
          this.getCoursesByYearService(node).then(courses => { console.log('materias:', courses); this.addCourses(courses) });
          break;

        default:
          break;
      }
    }

    // if (!!node.requireRequestToGetChildren && !!node.children && node.children.length == 0) {
    //   node = <Course>node;
    //   this.getFileByCourseService(node).then(files => {
    //     // this.dataSource.data[node.id]
    //     const indexCareer = this.dataSource.data.findIndex(career => career.id == node.careerIdReference);
    //     if (indexCareer != -1) {
    //       const indexYear = this.dataSource.data[indexCareer].children.findIndex(year => year.name == node.yearNameReference);
    //       if (indexYear != -1) {
    //         const indexCourse = this.dataSource.data[indexCareer].children[indexYear].children.findIndex(course => course.id == node.id);
    //         this.dataSource.data[indexCareer].children[indexYear].children[indexCourse].children = files;
    //         this.refreshTree();
    //       }
    //     }
    //   })
    // }
  }

  addYears(years: Year[]) {
    years.forEach(year => {
      const careersToUpdate: Career[] = year.careers;
      careersToUpdate.forEach(career => {
        const indexCareer = this.dataSource.data.findIndex(_career => _career.id == career.id);
        if (indexCareer != -1) {
          const existingYears: Year[] = this.dataSource.data[indexCareer].children;
          if (!existingYears.some(_year => _year.id == year.id)) {
            this.dataSource.data[indexCareer].children.push(year);
          }
        }
      })
    })
    this.refreshTree();
  }

  addCourses(courses: Course[]) {
    courses.forEach(course => {

      const yearsToUpdate: Year[] = course.relations;
      yearsToUpdate.forEach(year => {

        const careersToUpdate: Career[] = year.careers;
        careersToUpdate.forEach(career => {
          const indexCareer = this.dataSource.data.findIndex(_career => _career.id == career.id);
          if (indexCareer != -1) {
            const indexYear = this.dataSource.data[indexCareer].children.findIndex(_year => _year.id == year.id);
            if (indexYear != -1) {
              const existingCourses: Course[] = this.dataSource.data[indexCareer].children[indexYear].children;
              if (!existingCourses.some(_course => _course.id == course.id)) {
                this.dataSource.data[indexCareer].children[indexYear].children.push(course);
              }
            }
          }
        })
      })
    })
    this.refreshTree();
  }

  refreshTree() {
    let _data = this.dataSource.data;
    this.dataSource.data = null;
    this.dataSource.data = _data;
  }

  // !: Este handler no está en el repo original
  getFileByCourseService(course: Course): Promise<File[]> {
    return new Promise(
      (res, rej) => {
        this.filesService.getFilesByCourse(course.id).subscribe(
          archivos => {
            res(archivos)
          },
          error => {
            rej(error)
          }
        );
      })
  }

  // !: Este handler no está en el repo original
  getYearsByCareerService(career: Career): Promise<Year[]> {
    return new Promise(
      (res, rej) => {
        const fb = new FilterBuilder();
        const filter = fb.and(fb.where('careerCourseRelation.career_id', OPERATORS.IS, career.id));

        this.filesService.getYears(filter).subscribe(
          years => {
            res(years)
          },
          error => {
            rej(error)
          }
        );
      })
  }

  // !: Este handler no está en el repo original
  getCoursesByYearService(year: Year): Promise<Course[]> {
    return new Promise(
      (res, rej) => {
        const fb = new FilterBuilder();
        const filter = fb.and(fb.where('careerCourseRelation.relation_id', OPERATORS.IS, year.id));

        this.filesService.getCourses(filter).subscribe(
          courses => {
            res(courses)
          },
          error => {
            rej(error)
          }
        );
      })
  }



  downloadFile(file) {
    console.log(file);
    this.filesService.getFile(file.id).subscribe(
      blob => { console.log(blob); saveAs(blob, file.name) },
      error => { console.log('entro en error', error); this.handleErrors(error) }
    );
  }

  handleErrors(err: HttpErrorResponse) {
    console.log(err);
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }
}
