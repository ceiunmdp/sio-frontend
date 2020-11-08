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
  isLoading?: boolean
}

interface _Career extends Career, Node {
  type?: TREE_TYPES.CAREER;
}
interface _Year extends Year, Node {
  type: TREE_TYPES.YEAR;
  careerId: string;
  children: Course[];
}
interface _Course extends Course, Node {
  type: TREE_TYPES.COURSE;
  children: File[];
  careerId: string;
  yearId: string;

}

interface _File extends File, Node {
  type: TREE_TYPES.FILE;
  careerId: string;
  yearId: string;
  courseId: string;
}
@Component({
  selector: 'cei-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent {

  // @ViewChild("alertError", { static: true }) alertError;

  // dataSource = new MatTreeNestedDataSource<any>();
  // treeArchivos;
  // treeControl = new NestedTreeControl<Node>(node => node.children);
  // messageError: string;

  // errorResponse = false;
  // loadingResponse = false;


  // constructor(private filesService: OrdersService, private cd: ChangeDetectorRef, public router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService) { }

  // ngOnInit() {
  //   this.getCareers();
  // }

  // // !: Cambiar en el repo original
  // hasChild = (_: number, node: Node) => !!node.children;


  // getCareers() {
  //   this.loadingResponse = true
  //   this.filesService.getCareers().toPromise().then(
  //     (careers: Career[]) => {
  //       const careersMapped: _Career[] = careers.map(career => { let _career: _Career = { ...career, children: [], type: TREE_TYPES.CAREER }; return _career })
  //       this.dataSource.data = careersMapped; this.loadingResponse = false
  //     },
  //     error => {
  //       this.errorResponse = true; this.loadingResponse = false;
  //       this.handleErrors(error);
  //     }
  //   )
  // }

  // // !: Este handler no está en el repo original
  // onClickTreeNode(node: _Career | _Course | _Year) {
  //   if (node.children && node.children.length == 0) {
  //     node.isLoading = true;
  //     switch (node.type) {
  //       case TREE_TYPES.CAREER:
  //         // GET relations with career id
  //         this.getYearsByCareerService(node).then(years => { node.isLoading = false; this.addYears(years) });
  //         break;
  //       case TREE_TYPES.YEAR:
  //         // GET relations with career id
  //         this.getCoursesByYearService(node).then(courses => { node.isLoading = false; this.addCourses(courses) });
  //         break;
  //       case TREE_TYPES.COURSE:
  //         // GET A relations con career id
  //         this.getFilesByCourseService(node).then(files => { node.isLoading = false; this.addFiles(files) });
  //         break;

  //       default:
  //         break;
  //     }
  //   }
  // }

  // addYears(years: _Year[]) {
  //   years.forEach(year => {
  //     const indexCareer = this.dataSource.data.findIndex(_career => _career.id == year.careerId);
  //     if (indexCareer != -1) {
  //       const existingYears: Year[] = this.dataSource.data[indexCareer].children;
  //       if (!existingYears.some(_year => _year.id == year.id)) {
  //         this.dataSource.data[indexCareer].children.push(year);
  //       }
  //     }
  //   })
  //   this.refreshTree();
  // }

  // //TODO: Cambiar logica con parentId
  // addCourses(courses: _Course[]) {
  //   courses.forEach(course => {
  //     const careerIndex = this.dataSource.data.findIndex((career: Career) => career.id == course.careerId);
  //     if (careerIndex != -1) {
  //       const yearIndex = (this.dataSource.data[careerIndex] as _Career).children.findIndex((year: _Year) => year.id == course.yearId);
  //       if (yearIndex != -1) {
  //         const existingCourses: _Course[] = this.dataSource.data[careerIndex].children[yearIndex].children;
  //         if (!existingCourses.some(_course => _course.id == course.id)) {
  //           this.dataSource.data[careerIndex].children[yearIndex].children.push(course);
  //         }
  //       }
  //     }
  //   })
  //   this.refreshTree();
  // }

  // addFiles(files: _File[]) {
  //   files.forEach(file => {
  //     const careerIndex = this.dataSource.data.findIndex((career: Career) => career.id == file.careerId);
  //     if (careerIndex != -1) {
  //       const yearIndex = (this.dataSource.data[careerIndex] as _Career).children.findIndex((year: _Year) => year.id == file.yearId);
  //       if (yearIndex != -1) {
  //         const courseIndex = (this.dataSource.data[careerIndex] as _Career).children[yearIndex].children.findIndex((course: Course) => course.id == file.courseId);
  //         if (yearIndex != -1) {
  //           const existingFiles: _File[] = this.dataSource.data[careerIndex].children[yearIndex].children[courseIndex].children;
  //           if (!existingFiles.some(_file => _file.id == file.id)) {
  //             this.dataSource.data[careerIndex].children[yearIndex].children[courseIndex].children.push(file);
  //             console.log('File', file);

  //           }
  //         }
  //       }
  //     }
  //   })
  //   this.refreshTree();
  // }

  // refreshTree() {
  //   let _data = this.dataSource.data;
  //   this.dataSource.data = null;
  //   this.dataSource.data = _data;
  // }

  // // !: Este handler no está en el repo original
  // getYearsByCareerService(career: _Career): Promise<_Year[]> {
  //   return new Promise(
  //     (res, rej) => {
  //       const fb = new FilterBuilder();
  //       const filter = fb.and(fb.where('careerCourseRelation.career_id', OPERATORS.IS, career.id));

  //       this.filesService.getYears(filter).subscribe(
  //         years => {
  //           const yearsMapped: _Year[] = years.map(year => { let _year: _Year = { ...year, careerId: career.id, children: [], type: TREE_TYPES.YEAR }; return _year })
  //           res(yearsMapped)
  //         },
  //         error => {
  //           rej(error)
  //         }
  //       );
  //     })
  // }

  // // !: Este handler no está en el repo original
  // getCoursesByYearService(year: _Year): Promise<_Course[]> {
  //   return new Promise(
  //     (res, rej) => {
  //       const fb = new FilterBuilder();
  //       const filter = fb.and(fb.where('careerCourseRelation.relation_id', OPERATORS.IS, year.id), fb.where('careerCourseRelation.career_id', OPERATORS.IS, year.careerId));
  //       this.filesService.getCourses(filter).subscribe(
  //         courses => {
  //           const coursesMapped: _Course[] = courses.map(course => { let _course: _Course = { ...course, yearId: year.id, careerId: year.careerId, children: [], type: TREE_TYPES.COURSE }; return _course })
  //           res(coursesMapped)
  //         },
  //         error => {
  //           rej(error)
  //         }
  //       );
  //     })
  // }

  // // !: Este handler no está en el repo original
  // getFilesByCourseService(course: _Course): Promise<_File[]> {
  //   return new Promise(
  //     (res, rej) => {
  //       const fb = new FilterBuilder();
  //       const filter =
  //         fb.and(
  //           fb.where('course.id', OPERATORS.IS, course.id)
  //         );
  //       this.filesService.getFilesByCourse(filter).subscribe(
  //         files => {
  //           const filesMapped: _File[] = files.map(file => { let _file: _File = { ...file, careerId: course.careerId, yearId: course.yearId, courseId: course.id, type: TREE_TYPES.FILE }; return _file })
  //           res(filesMapped)
  //         },
  //         error => {
  //           rej(error)
  //         }
  //       );
  //     })
  // }

  // downloadFile(file) {
  //   console.log(file);
  //   this.filesService.getFile(file.id).subscribe(
  //     blob => { console.log(blob); saveAs(blob, file.name) },
  //     error => { console.log('entro en error', error); this.handleErrors(error) }
  //   );
  // }

  // handleErrors(err: HttpErrorResponse) {
  //   console.log(err);
  //   this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
  //   if (this.messageError) {
  //     this.alertError.openError(this.messageError);
  //   }
  // }
}
