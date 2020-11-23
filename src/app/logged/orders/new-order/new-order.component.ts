import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";
import { NestedTreeControl } from "@angular/cdk/tree";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import {
   AbstractControl,
   FormArray,
   FormBuilder,
   FormControl,
   FormGroup,
   FormGroupDirective,
   NgForm,
   ValidationErrors,
   ValidatorFn
} from "@angular/forms";
import { ErrorStateMatcher, MatSnackBarRef } from "@angular/material";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import { Router } from "@angular/router";
import { saveAs } from "file-saver";
import {
   AbstractModelSettings,
   AdhocModelSettings,
   ModelSettingsBuilder,
   ReactiveFormsRuleService
} from "ng-form-rules";
import { Routes } from "src/app/_routes/routes";
import { AuthenticationService } from "src/app/_services/authentication.service";
import { GeneralService } from "src/app/_services/general.service";
import { HttpErrorResponseHandlerService } from "src/app/_services/http-error-response-handler.service";
import { MonedaPipe } from "src/app/_utils/moneda.pipe";
import { CustomValidators } from "src/app/_validators/custom-validators";
import { OrdersService } from "../orders.service";
import { Campus } from "src/app/_models/campus";
import { Item } from "src/app/_models/item";
import { ITEM_TYPES } from "src/app/_items/types";
import { Course } from "src/app/_models/orders/course";

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
   isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
      return form.form.invalid;
      // return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
   }
}

interface Node {
   name: string;
   children?: Node[];
}

export interface InternalOrder {
   id_usuario: number;
   id_sede: number;
   importe_total: number;
   archivos: InternalFile[];
}
export interface FileSelectedStep1 {
   id: number;
   name: string;
   numberOfSheets: number;
   format: string;
   course: Course;
}

export interface InternalFile {
   idArchivo: number;
   courseName: string;
   name: string;
   cantidadPaginas: number;
   cantidad: number;
   copiasMismaConfig: boolean;
   configuraciones: Configuration[];
}

export interface Configuration {
   doble_faz: boolean;
   color: boolean;
   desdehasta: string;
   desdehastainput: string;
   diap_por_hoja: number;
   selectedPaginas: number;
   precio_archivo_config: number;
   id_grupo_anillado?: number;
   orden_anillado?: number;
}

@Component({
   selector: "cei-new-order",
   templateUrl: "./new-order.component.html",
   styleUrls: ["./new-order.component.scss"],
   providers: [
      {
         provide: STEPPER_GLOBAL_OPTIONS,
         useValue: { displayDefaultIndicatorType: false }
      }
   ]
})
export class NewOrderComponent implements OnInit {
   @ViewChild("alertError", { static: true }) alertError;
   @ViewChild("tabAnillados", { static: false }) tabAnillados;
   selectAnillado = 0;
   @ViewChild("orderSuccessSwal", { static: true }) orderSuccessSwal;
   @ViewChild("ringExceededSwal", { static: true }) ringExceededSwal;
   actualRingType;
   anillados: Item[];

   /* Tabs anillados */
   tabs: {
      files;
      quantityVeeners: number;
      ringType: Item;
   }[] = [{ files: [], quantityVeeners: 0, ringType: null }];
   selected = new FormControl(0);

   /* Nuevos forms */
   public readonly FORM_CONFIGURATION_VALUES = {
      filesName: "archivos",
      totalPrice: "importe_total",
      files: {
         idFile: "idArchivo",
         name: "name",
         courseName: "materia",
         pagesQuantity: "cantidadPaginas",
         copiesQuantity: "cantidad",
         sameConfig: "copiasMismaConfig",
         configurationsName: "configuraciones",
         configurations: {
            duplex: "doble_faz",
            colour: "color",
            fromTo: "desdehasta",
            fromToInput: "desdehastainput",
            slidesPerSheet: "diap_por_hoja",
            selectedSheets: "selectedPaginas",
            priceConfig: "precio_archivo_config",
            idRingerGroup: "id_grupo_anillado",
            ringedOrder: "orden_anillado"
         }
      }
   };
   previousQuestionRing;
   formConfiguration: FormGroup;
   formArrayFiles: FormArray;
   formArrayConfiguration: FormArray;
   /* Nuevos forms */

   /* Variable para manejar min y max que se muestra en el input de grupo de anillado y orden de anillado */
   maxAnillados = 0;
   disabledSelectAnillado = true;
   selectedSheetsDefault = 0;
   messageError: string;
   title = "Nuevo pedido";
   archivos: InternalFile[] = [];
   snackBarRef: MatSnackBarRef<any>;
   treeControl = new NestedTreeControl<any>(node => node.children);
   dataSource = new MatTreeNestedDataSource<any>();
   treeArchivos;
   // Formulario final (step 4)
   form: FormGroup;
   pipeMoneda = new MonedaPipe();
   selectedPaginas = 1;
   // Tabla
   displayedColumns: string[] = ["Archivo", "Cantidad", "CarillasTotales", "Precio"];
   tableTemplate = [];
   mostrarTabla = false;

   /**
    * ? Que otro valor puede ir?
    */
   opcionesDiapHoja = [
      {
         value: 1
      },
      {
         value: 2
      },
      {
         value: 4
      },
      {
         value: 6
      }
   ];
   //Precio de cada hoja
   // precio_simple_faz = 1;
   precio_simple_faz;
   // Precio de cada hoja (dos carillas impresas)
   // precio_doble_faz = 1.5;
   precio_doble_faz;
   id_sede;
   settings: AbstractModelSettings<any>;
   sedes: Campus[];
   routes = Routes; // Necessary for the view

   constructor(
      private generalService: GeneralService,
      private formBuilder: FormBuilder,
      private service: OrdersService,
      private svc: ReactiveFormsRuleService,
      private authService: AuthenticationService,
      public router: Router,
      private httpErrorResponseHandlerService: HttpErrorResponseHandlerService
   ) { }

   ngOnInit() {
      this.generalService.sendMessage({ title: this.title });
      this.service.getFiles().subscribe(
         archivos => {
            console.log(archivos);

            this.dataSource.data = archivos;
         },
         error => {
            this.handleErrors(error);
         }
      );
      this.getCampuses()
         .then((campuses: Campus[]) => (this.sedes = campuses))
         .catch(err => this.handleErrors(err));
      this.getItems()
         .then((items: Item[]) => {
            console.log("iteeems: ", items);

            this.anillados = this.getRingedByItems(items);
            this.precio_doble_faz = this.getPriceDuplex(items);
            this.precio_simple_faz = this.getPriceSimpleFace(items);
            console.log("items: ", items, "doble faz: ", this.precio_doble_faz, "sf: ", this.precio_simple_faz);
         })
         .then(_ => console.log(this.sedes))
         .catch(err => this.handleErrors(err));
      this.settings = this.createSetting();
      this.previousQuestionRing = true;
   }

   mostrar(a) {
      console.log(a);
   }

   getRingedByItems = (items: Item[]): Item[] => items.filter(item => item.type === ITEM_TYPES.ANILLADO);
   getPriceDuplex = (items: Item[]): number => items[1].price;
   getPriceSimpleFace = (items: Item[]): number => items[0].price;

   matcher = new MyErrorStateMatcher();

   hasChild = (_: number, node: Node) => !!node.children && node.children.length > 0;

   compareFn(c1, c2) {
      if (c1 != undefined && c2 !== undefined && c1 == c2) {
         return true;
      } else {
         return false;
      }
      // return true;
      // return c1 && c2 ? c1.idSede === c2.idSede : c1 === c2;
   }

   destructureConfigurationFile(i) {
      // Obtengo la configuración actual
      const conf = this.getFileValueByIndex(i);
      console.log(conf);

      // Borrar las configuraciones previas
      this.removeAllConfigurationFile(i);

      // Si tiene la opcion misma config -> Tengo que disgregar a partir de la config inicial
      if (conf[this.FORM_CONFIGURATION_VALUES.files.sameConfig]) {
         // console.log(this.getFiles()['controls'][i]['controls'][this.FORM_CONFIGURATION_VALUES.files.sameConfig].setValue(false));
         this.getFiles()["controls"][i]["controls"][this.FORM_CONFIGURATION_VALUES.files.sameConfig].setValue(false);
         for (let z = 0; z < conf[this.FORM_CONFIGURATION_VALUES.files.copiesQuantity]; z++) {
            this.addItemFormConfig(i, conf[this.FORM_CONFIGURATION_VALUES.files.configurationsName][0]);
         }
      }
   }

   onChangeCantidad(i) {
      const initialConfig: Configuration = {
         doble_faz: true,
         color: false,
         desdehasta: "",
         desdehastainput: "",
         diap_por_hoja: 1,
         selectedPaginas: 0,
         /**
          * TODO: CAMBIAR PRECIO
          */
         precio_archivo_config: 100
      };
      const conf = this.getFileValueByIndex(i);
      // Borrar las configuraciones previas
      this.removeAllConfigurationFile(i);
      console.log(conf, conf[this.FORM_CONFIGURATION_VALUES.files.configurationsName][0]);

      if (conf[this.FORM_CONFIGURATION_VALUES.files.sameConfig]) {
         this.addItemFormConfig(i, conf[this.FORM_CONFIGURATION_VALUES.files.configurationsName][0]);
      } else {
         console.log("entro en no same config");
         for (let z = 0; z < this.getFileValueByIndex(i)[this.FORM_CONFIGURATION_VALUES.files.copiesQuantity]; z++) {
            if (!!conf[this.FORM_CONFIGURATION_VALUES.files.configurationsName][z]) {
               this.addItemFormConfig(i, conf[this.FORM_CONFIGURATION_VALUES.files.configurationsName][z]);
            } else {
               this.addItemFormConfig(i, initialConfig);
            }
         }
      }
   }

   onChangeSelectedSheets(option, configuration) {
      // Si la opcion es todas, reseteo el input de fromto
      console.log(this.formConfiguration);

      if (option == 0) {
         console.log(configuration);
         console.log("entro en reset de fromto");
         configuration.controls[this.FORM_CONFIGURATION_VALUES.files.configurations.fromToInput].reset();
         configuration.controls[this.FORM_CONFIGURATION_VALUES.files.configurations.fromTo].reset();
         console.log("form reseteado: ", this.formConfiguration);
      }
   }

   onChangeCopiasMismaConfig(i) {
      this.onChangeCantidad(i);
   }

   onClickAcceptRing() {
      console.log(this.formConfiguration);
      this.previousQuestionRing = false;
      this.breakUpConfigurationSameConfig();
      this.formConfiguration.disable({ onlySelf: true });
   }

   breakUpConfigurationSameConfig() {
      // Se disgregan todas las configuraciones con la opcion tildada "Todas las copias con la misma configuracion"
      const files = this.getFiles().value;

      files.forEach((file, i) => {
         console.log("antes");
         file[this.FORM_CONFIGURATION_VALUES.files.sameConfig]
            ? (console.log("sacarmismaconfig", file), this.destructureConfigurationFile(i))
            : console.log("no entro");
      });
   }

   editAfterRing() {
      this.formConfiguration.enable();
      this.resetAllRing();
      // reset tab anillado
      console.log(this.formConfiguration);
      this.resetTabAnillado();
      this.previousQuestionRing = true;
   }

   resetTabAnillado() {
      this.tabs = [{ files: [], quantityVeeners: 0, ringType: null }];
   }

   onAddTabAnillado(selectAfterAdding: boolean) {
      this.tabs.push({ files: [], quantityVeeners: 0, ringType: null });

      if (selectAfterAdding) {
         this.selected.setValue(this.tabs.length - 1);
      }
   }

   onRemoveTabAnillado(index: number) {
      //Resetear orden_anillado e id_grupo_anillado del formConfiguration
      console.log(this.getFiles());
      console.log(this.tabAnillados);
      this.tabs[index].files.map(file => {
         this.resetRing(file.indexArchivo, file.indexConfiguracion);
      });
      console.log("Indice: ", index, "tabs: ", this.tabs);
      //Eliminarlos de la tab correspondiente

      this.tabs.splice(index, 1);
   }

   onRemoveRingFile(indexArchivo, indexConfiguracion, indexTab, indexFile) {
      console.log(indexArchivo, indexConfiguracion);

      this.resetRing(indexArchivo, indexConfiguracion);

      let tab = this.tabs[indexTab];
      tab.quantityVeeners -= this.tabs[indexTab].files[indexFile].quantityPages;

      tab.files.splice(indexFile, 1);

      tab.ringType =
         tab.quantityVeeners > 0
            ? this.calculateRingType(this.fromVeenersToPages(this.tabs[indexTab].quantityVeeners))
            : null;
   }

   calculateRingType(totalPages): Item {
      // TODO: El calculo debiera ser por hoja no por carilla
      // const totalVeeners = quantityPagesByConfiguration
      //    ? quantityPagesByConfiguration + this.tabs[indexTab].quantityPages
      //    : this.tabs[indexTab].quantityPages;
      console.log("Paginas totales", totalPages);
      const anillado = this.anillados.find(anillado => totalPages <= anillado.maximumLimit);

      return anillado ? anillado : null;
   }

   resetRing(indexArchivo, indexConfiguracion) {
      this.formConfiguration.controls["archivos"]["controls"][indexArchivo]["controls"]["configuraciones"]["controls"][
         indexConfiguracion
      ]["controls"]["id_grupo_anillado"].setValue(null);
      this.formConfiguration.controls["archivos"]["controls"][indexArchivo]["controls"]["configuraciones"]["controls"][
         indexConfiguracion
      ]["controls"]["orden_anillado"].setValue(null);
   }

   resetAllRing() {
      this.getFiles().value.forEach((file, indexFile) => {
         file[this.FORM_CONFIGURATION_VALUES.files.configurationsName].forEach((config, indexConfig) => {
            this.resetRing(indexFile, indexConfig);
         });
      });
   }

   onRingFile(archivo, indexArchivo, indexConfiguracion) {
      console.log(this.formConfiguration, archivo, indexArchivo, indexConfiguracion);

      const tab = this.tabs[this.tabAnillados.selectedIndex];
      const quantityVeenersByConfiguration = Math.ceil(
         this.formConfiguration.value[this.FORM_CONFIGURATION_VALUES.filesName][indexArchivo][
            this.FORM_CONFIGURATION_VALUES.files.configurationsName
         ][indexConfiguracion][this.FORM_CONFIGURATION_VALUES.files.configurations.fromTo].length /
         this.formConfiguration.value[this.FORM_CONFIGURATION_VALUES.filesName][indexArchivo][
         this.FORM_CONFIGURATION_VALUES.files.configurationsName
         ][indexConfiguracion][this.FORM_CONFIGURATION_VALUES.files.configurations.slidesPerSheet]
      );
      const ringType = this.calculateRingType(
         this.fromVeenersToPages(tab.quantityVeeners) + this.fromVeenersToPages(quantityVeenersByConfiguration)
      );
      // Si no existe un tipo de anillado asociado -> La cantidad de hojas a anillar sobrepasa la max del max anillado
      if (!ringType) {
         // TODO: lanzar swal
         this.ringExceededSwal.fire();
         console.log("no es posible anillar mas documentos en este grupo");
      } else {
         this.formConfiguration.controls["archivos"]["controls"][indexArchivo]["controls"]["configuraciones"][
            "controls"
         ][indexConfiguracion]["controls"]["id_grupo_anillado"].setValue(this.tabAnillados.selectedIndex + 1);
         this.formConfiguration.controls["archivos"]["controls"][indexArchivo]["controls"]["configuraciones"][
            "controls"
         ][indexConfiguracion]["controls"]["orden_anillado"].setValue(
            this.tabs[this.tabAnillados.selectedIndex].files.length + 1
         );
         // Cantidad de carillas de
         /**
          * ! El id_grupo_anillado es el indice del tab + 1, OJO
          */
         tab.quantityVeeners += quantityVeenersByConfiguration;
         tab.files.push({
            name: archivo.name,
            course: archivo[this.FORM_CONFIGURATION_VALUES.files.courseName],
            indexArchivo: indexArchivo,
            indexConfiguracion: indexConfiguracion,
            quantityPages: quantityVeenersByConfiguration
         });
         tab.ringType = ringType;
      }
   }

   fromVeenersToPages(veeners) {
      return Math.ceil(veeners / 2);
   }

   /**
    ** Retorna true: todos los archivos fueron asignados a un anillado
    ** || existe un tab de anillado sin ningún archivo asignado
    */
   isDisabledNewTabAnillado(): boolean {
      if (!!this.formConfiguration) {
         return this.allFilesRinged() || this.tabRingWithoutFiles();
      } else {
         return false;
      }
   }

   onKeyDown() {
      return false;
   }

   private tabRingWithoutFiles(): boolean {
      let BreakException;
      try {
         this.tabs.map(tab => {
            if (tab.files.length === 0) throw BreakException;
         });
         return false;
      } catch (e) {
         return true;
      }
   }

   private allFilesRinged(): boolean {
      let BreakException = {};
      try {
         this.formConfiguration.value.archivos.forEach(archivo => {
            archivo.configuraciones.forEach(configuracion => {
               if (!configuracion.id_grupo_anillado) {
                  throw BreakException;
               }
            });
         });
         return true;
      } catch (e) {
         return false;
      }
   }

   //Poner valores iniciales

   createFormConfig(file: InternalFile): FormGroup {
      return this.formBuilder.group({
         [this.FORM_CONFIGURATION_VALUES.filesName]: this.formBuilder.array([this.createItemFileFormConfig(file)])
      });
   }

   createItemFileFormConfig(file: InternalFile): FormGroup {
      console.log(file);

      return this.formBuilder.group({
         [this.FORM_CONFIGURATION_VALUES.files.idFile]: [
            file.idArchivo,
            [CustomValidators.required("Id de archivo requerido")]
         ],
         [this.FORM_CONFIGURATION_VALUES.files.courseName]: [
            file.courseName,
            [CustomValidators.required("Materia requerida")]
         ],
         [this.FORM_CONFIGURATION_VALUES.files.name]: [
            file.name,
            [CustomValidators.required("Nombre de archivo requerido")]
         ],
         [this.FORM_CONFIGURATION_VALUES.files.pagesQuantity]: [
            file.cantidadPaginas,
            [
               // (formControl: FormControl) => {
               // }
            ]
         ],
         [this.FORM_CONFIGURATION_VALUES.files.copiesQuantity]: [
            file.cantidad,
            [CustomValidators.required("Cantidad de copias requeridas")]
         ],
         [this.FORM_CONFIGURATION_VALUES.files.sameConfig]: [
            file.copiasMismaConfig,
            [
               // CustomValidators.required('Email requerido')
            ]
         ],
         [this.FORM_CONFIGURATION_VALUES.files.configurationsName]: this.formBuilder.array([
            this.createItemConfigFormConfig(file.configuraciones[0], file)
         ])
      });
   }

   // Le paso el file para poder pasarle la cantidad de hojas del archivo al CustomValidator
   createItemConfigFormConfig(configuration: Configuration, file): FormGroup {
      console.log(file);

      return this.formBuilder.group(
         {
            [this.FORM_CONFIGURATION_VALUES.files.configurations.colour]: [
               configuration.color,
               [
                  // CustomValidators.required('Email requerido')
               ]
            ],
            [this.FORM_CONFIGURATION_VALUES.files.configurations.duplex]: [
               configuration.doble_faz,
               [
                  // CustomValidators.required('Email requerido')
               ]
            ],
            // Depende de si se habilito la opcion
            [this.FORM_CONFIGURATION_VALUES.files.configurations.fromTo]: [
               configuration.desdehasta,
               [
                  // Validators.pattern('[a-zA-Z ]*')
                  // CustomValidators
                  // Validators.pattern("d+(?:-d+)?(?:,d+(?:-d+)?)*")
                  // CustomValidators.pattern(`\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*`, "Email requerido")
               ]
            ],
            [this.FORM_CONFIGURATION_VALUES.files.configurations.fromToInput]: [
               configuration.desdehasta,
               [
                  // CustomValidators.maxRange(file.cantidadPaginas, "Max superado")
                  // Validators.pattern('[a-zA-Z ]*')
                  // Validators.pattern("\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*")
                  // Validators.pattern(`\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*`)
                  // Validators.pattern(`\d{1,}((-\d{1,})|(,\d{1,})?){1,}`)
                  // CustomValidators.required('Email requerido')
               ]
            ],
            // Cambiar valor de dinero
            [this.FORM_CONFIGURATION_VALUES.files.configurations.priceConfig]: [
               44,
               [
                  // CustomValidators.required('Email requerido')
               ]
            ],
            [this.FORM_CONFIGURATION_VALUES.files.configurations.idRingerGroup]: [
               configuration.id_grupo_anillado,
               [
                  // CustomValidators.required('Email requerido')
               ]
            ],
            [this.FORM_CONFIGURATION_VALUES.files.configurations.ringedOrder]: [
               configuration.orden_anillado,
               [this.validatorRingerOrder()]
            ],
            [this.FORM_CONFIGURATION_VALUES.files.configurations.selectedSheets]: [
               configuration.selectedPaginas,
               [
                  // CustomValidators.required('Email requerido')
               ]
            ],
            [this.FORM_CONFIGURATION_VALUES.files.configurations.slidesPerSheet]: [
               configuration.diap_por_hoja,
               [CustomValidators.required("Diapositivas por hoja requerido")]
            ]
         },
         { validators: [this.validatorFromTo, this.maxRange(file.cantidadPaginas, "Max superado")] }
      );
   }

   validatorFromTo: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
      const selectedSheets = control.get(this.FORM_CONFIGURATION_VALUES.files.configurations.selectedSheets);
      const fromToInput = control.get(this.FORM_CONFIGURATION_VALUES.files.configurations.fromToInput);
      return fromToInput && !fromToInput.value && selectedSheets.value == 1 ? { fromToInput: true } : null;
   };

   maxRange(quantityPagesFile: number, message: string): ValidatorFn {
      return (control: FormGroup): { [key: string]: any } | null => {
         const diap_por_hoja = control.get(this.FORM_CONFIGURATION_VALUES.files.configurations.slidesPerSheet).value;
         let value = control.get(this.FORM_CONFIGURATION_VALUES.files.configurations.fromToInput).value;
         let quantityVeenersFileConfig = Math.ceil(quantityPagesFile / diap_por_hoja);
         console.log("Control:", control, quantityVeenersFileConfig);
         let ret = null;
         if (!control.errors && !!value) {
            let arr: Array<number> = this.splitRange(value);
            console.log(arr);

            ret = arr[arr.length - 1] <= quantityVeenersFileConfig ? null : { length: message };
         }
         return ret;
      };
   }

   validatorRingerOrder(): ValidatorFn {
      return (control: AbstractControl): { [key: string]: any } | null => {
         return control && !control.value && this.selectAnillado == 1 ? { ringedOrder: true } : null;
         // return forbidden ? { 'forbiddenName': { value: control.value } } : null;
      };
   }

   addItemFileFormConfig(file: InternalFile): void {
      this.formArrayFiles = this.formConfiguration.get(this.FORM_CONFIGURATION_VALUES.filesName) as FormArray;
      this.formArrayFiles.push(this.createItemFileFormConfig(file));
   }

   addItemFormConfig(indexFile, configuration: Configuration): void {
      this.formArrayFiles = this.formConfiguration.get(this.FORM_CONFIGURATION_VALUES.filesName) as FormArray;
      this.formArrayConfiguration = this.formArrayFiles
         .at(indexFile)
         .get(this.FORM_CONFIGURATION_VALUES.files.configurationsName) as FormArray;
      console.log(this.formArrayFiles.at(indexFile));

      this.formArrayConfiguration.push(
         this.createItemConfigFormConfig(configuration, this.formArrayFiles.at(indexFile).value)
      );
   }

   removeAllConfigurationFile(indexFile) {
      this.formArrayFiles = this.formConfiguration.get(this.FORM_CONFIGURATION_VALUES.filesName) as FormArray;
      this.formArrayConfiguration = this.formArrayFiles
         .at(indexFile)
         .get(this.FORM_CONFIGURATION_VALUES.files.configurationsName) as FormArray;
      this.formArrayConfiguration.controls = [];
   }

   getFiles() {
      return this.formConfiguration.get(this.FORM_CONFIGURATION_VALUES.filesName) as FormArray;
   }

   getFileValueByIndex(indexFile): InternalFile {
      return (<FormArray>this.formConfiguration.get(this.FORM_CONFIGURATION_VALUES.filesName)).at(indexFile).value;
   }

   getFileValueByIdFile(idFile) {
      const a = (<FormArray>this.formConfiguration.get(this.FORM_CONFIGURATION_VALUES.filesName)).controls.filter(
         file => {
            return file.value[this.FORM_CONFIGURATION_VALUES.files.idFile] == idFile;
         }
      );
      return a[0];
   }

   getFileIndexByIdFile(idFile) {
      var index;
      (<FormArray>this.formConfiguration.get(this.FORM_CONFIGURATION_VALUES.filesName)).controls.forEach((file, i) => {
         if (file.value[this.FORM_CONFIGURATION_VALUES.files.idFile] == idFile) {
            index = i;
         }
      });
      return index;
   }

   handlerAddFile(event, archivo: FileSelectedStep1) {
      console.log(archivo);
      const initialFile: InternalFile = {
         idArchivo: archivo.id,
         name: archivo.name,
         courseName: archivo.course.name,
         cantidad: 1,
         cantidadPaginas: archivo.numberOfSheets,
         copiasMismaConfig: true,
         configuraciones: [
            {
               doble_faz: true,
               color: false,
               desdehasta: "",
               desdehastainput: "",
               diap_por_hoja: 1,
               selectedPaginas: 0,
               precio_archivo_config: 3
            }
         ]
      };

      // Si se chequea el archivo, lo inserto en el array archivos.
      if (event.checked) {
         // Si no existe el form, lo creo (con todos sus arrays)
         if (!this.formConfiguration) {
            // Crear form
            this.formConfiguration = this.createFormConfig(initialFile);
         }
         // Si ya existe el form, pusheo un nuevo archivo (con su array de configuraciones dentro)
         else {
            this.addItemFileFormConfig(initialFile);
         }
      } // Sino, lo elimino del array archivos (si existe)
      else {
         const indexFile = this.getFileIndexByIdFile(archivo.id);
         // Remove array
         this.getFiles().removeAt(indexFile);
      }
   }

   // Pone en 1 las config
   resetArchivoConfiguracion(archivo) {
      archivo.configuraciones = [];
      archivo.configuraciones.push({
         doble_faz: true,
         color: false,
         desdehasta: "",
         desdehastaInput: "",
         diap_por_hoja: 1,
         precio_archivo_config: 3,
         selectedPaginas: 0
      });
   }

   createSetting(): AbstractModelSettings<any> {
      // create model settings
      return AdhocModelSettings.create<any>((builder: ModelSettingsBuilder) => {
         // return an array of properties
         return [
            builder.property("id_usuario", prop => {
               // add a name property to the settings
               prop.valid.push(
                  // add validation to the name property
                  builder.validNamedTest(
                     // add a test to the validation with a name, message, and rule
                     "id_usuaro-required-test",
                     `id_usuaro requerido.`,
                     builder.rule(pedido => !!pedido.id_usuario)
                  )
               );
            }),
            builder.property("id_sede", prop => {
               // add a name property to the settings
               prop.valid.push(
                  // add validation to the name property
                  builder.validNamedTest(
                     // add a test to the validation with a name, message, and rule
                     "id_sede_required-test",
                     `id_sede requerido`,
                     builder.rule(pedido => !!pedido.id_sede)
                  )
               );
            }),
            builder.property("importe_total", prop => {
               // add a name property to the settings
               prop.valid.push(
                  // add validation to the name property
                  builder.validNamedTest(
                     // add a test to the validation with a name, message, and rule
                     "recaptcha-required-test",
                     `reCaptcha requerida.`,
                     builder.rule(pedido => !!pedido.importe_total && pedido.importe_total > 0)
                  )
               );
            }),
            builder.property("archivos", prop => {
               prop.arrayItemProperty = builder.arrayItemProperty(arrayItemProp => {
                  arrayItemProp.properties = [
                     builder.property("idArchivo", prop => {
                        // add a name property to the settings
                        prop.valid.push(
                           // add validation to the name property
                           builder.validNamedTest(
                              // add a test to the validation with a name, message, and rule
                              "id_archivo-test",
                              `id_archivo requerido`,
                              builder.rule(archivo => archivo.idArchivo !== null && archivo.idArchivo > 0)
                           )
                        );
                     }),
                     builder.property("name", prop => {
                        // add a name property to the settings
                        prop.valid.push(
                           // add validation to the name property
                           builder.validNamedTest(
                              // add a test to the validation with a name, message, and rule
                              "name_required-test",
                              `nombre de archivo requerido`,
                              builder.rule(archivo => !!archivo.name && archivo.name !== "")
                           )
                        );
                     }),
                     builder.property("cantidad", prop => {
                        // add a name property to the settings
                        prop.valid.push(
                           // add validation to the name property
                           builder.validNamedTest(
                              // add a test to the validation with a name, message, and rule
                              "cantidad_required-test",
                              `cantidad requerida`,
                              builder.rule(archivo => !!archivo.cantidad && archivo.cantidad > 0)
                           )
                        );
                     }),
                     builder.property("copiasMismaConfig"),
                     builder.property("configuraciones", prop => {
                        // add a name property to the settings
                        prop.arrayItemProperty = builder.arrayItemProperty(arrayItemProp => {
                           arrayItemProp.properties = [
                              builder.property("id_grupo_anillado"),
                              builder.property("orden_anillado", prop => {
                                 prop.valid.push(
                                    builder.validNamedTest(
                                       "orden_anillado-test",
                                       "Orden de anillado requerido",
                                       builder.rule(
                                          configuracion =>
                                             (configuracion.id_grupo_anillado == null &&
                                                configuracion.orden_anillado == null) ||
                                             (configuracion.id_grupo_anillado != null &&
                                                configuracion.orden_anillado != null)
                                       )
                                    )
                                 );
                              }),
                              builder.property("doble_faz", prop => {
                                 // add a name property to the settings
                                 prop.valid.push(
                                    // add validation to the name property
                                    builder.validNamedTest(
                                       // add a test to the validation with a name, message, and rule
                                       "doble_faz-test",
                                       `doble faz requerido`,
                                       builder.rule(configuracion => configuracion.doble_faz !== null)
                                    )
                                 );
                              }),
                              builder.property("selectedPaginas", prop => {
                                 // add a name property to the settings
                                 prop.valid.push(
                                    // add validation to the name property
                                    builder.validNamedTest(
                                       // add a test to the validation with a name, message, and rule
                                       "selectedPaginas-test",
                                       `selectedPaginas requerido`,
                                       builder.rule(configuracion => configuracion.selectedPaginas !== null)
                                    )
                                 );
                              }),
                              builder.property("desdehasta", prop => {
                                 // add a name property to the settings
                                 prop.valid.push(
                                    // add validation to the name property
                                    builder.validNamedTest(
                                       // add a test to the validation with a name, message, and rule
                                       "desdehasta-test",
                                       `Rango requerido`,
                                       builder.rule(configuracion => configuracion.desdehasta !== null)
                                    )
                                 );
                              }),
                              builder.property("desdehastainput", prop => {
                                 // add a name property to the settings
                                 prop.valid.push(
                                    // add validation to the name property
                                    builder.validNamedTest(
                                       // add a test to the validation with a name, message, and rule
                                       "desdehastainput-test",
                                       `Rango requerido`,
                                       builder.rule(configuracion => configuracion.desdehastainput !== null)
                                    )
                                 );
                              }),
                              builder.property("color", prop => {
                                 // add a name property to the settings
                                 prop.valid.push(
                                    // add validation to the name property
                                    builder.validNamedTest(
                                       // add a test to the validation with a name, message, and rule
                                       "color-test",
                                       `Color requerido`,
                                       builder.rule(configuracion => configuracion.color !== null)
                                    )
                                 );
                              }),
                              builder.property("precio_archivo_config", prop => {
                                 // add a name property to the settings
                                 prop.valid.push(
                                    // add validation to the name property
                                    builder.validNamedTest(
                                       // add a test to the validation with a name, message, and rule
                                       "precio_archivo_config-test",
                                       `precio_archivo_config requerido`,
                                       builder.rule(
                                          archivo =>
                                             archivo.precio_archivo_config != null && archivo.precio_archivo_config >= 0
                                       )
                                    )
                                 );
                              }),
                              builder.property("diap_por_hoja", prop => {
                                 // add a name property to the settings
                                 prop.valid.push(
                                    // add validation to the name property
                                    builder.validNamedTest(
                                       // add a test to the validation with a name, message, and rule
                                       "diap_por_hoja-test",
                                       `diap_por_hoja requerido`,
                                       builder.rule(
                                          configuracion =>
                                             !!configuracion.diap_por_hoja &&
                                             (configuracion.diap_por_hoja == 1 ||
                                                configuracion.diap_por_hoja == 2 ||
                                                configuracion.diap_por_hoja == 4)
                                       )
                                    )
                                 );
                              })
                           ];
                        });
                     })
                  ];
               });
            })
         ];
      });
   }

   copyFormControl(control: AbstractControl) {
      if (control instanceof FormControl) {
         return new FormControl(control.value);
      } else if (control instanceof FormGroup) {
         const copy = new FormGroup({});
         Object.keys(control.getRawValue()).forEach(key => {
            copy.addControl(key, this.copyFormControl(control.controls[key]));
         });
         return copy;
      } else if (control instanceof FormArray) {
         const copy = new FormArray([]);
         control.controls.forEach(control => {
            copy.push(this.copyFormControl(control));
         });
         return copy;
      }
   }

   onStep3() {
      let filesAux: any = this.getFiles()["controls"];
      // Por cada archivo

      filesAux.map(file => {
         console.log("filee: ", file);
         // Por cada configuracion
         file["controls"][this.FORM_CONFIGURATION_VALUES.files.configurationsName]["controls"].forEach(
            (configuracion, index) => {
               // Si puso personalizado -> tomo el rango que ingresó el usuario
               if (configuracion["value"][this.FORM_CONFIGURATION_VALUES.files.configurations.selectedSheets] != 0) {
                  configuracion["controls"][this.FORM_CONFIGURATION_VALUES.files.configurations.fromTo].setValue(
                     this.splitRange(
                        file["value"][this.FORM_CONFIGURATION_VALUES.files.configurationsName][index][
                        this.FORM_CONFIGURATION_VALUES.files.configurations.fromToInput
                        ]
                     )
                  );
               } else {
                  // Sino, tomo el rango total de hojas del archivo
                  configuracion["controls"][this.FORM_CONFIGURATION_VALUES.files.configurations.fromTo].setValue(
                     this.splitRange("1-" + file["value"][this.FORM_CONFIGURATION_VALUES.files.pagesQuantity])
                  );
                  configuracion["controls"][this.FORM_CONFIGURATION_VALUES.files.configurations.fromToInput].setValue(
                     "1-" + file["value"][this.FORM_CONFIGURATION_VALUES.files.pagesQuantity]
                  );
               }
            }
         );
      });
      console.log("Form: ", this.formConfiguration);
   }

   onStep4() {
      console.log("Entro en step4", this.formConfiguration);

      this.tableTemplate = [];
      let quantityVeenersByFile;
      let quantityVeenersByConfiguration;
      let filesAux: any = this.copyFormControl(this.getFiles());
      let importe_total = 0;
      let precio_configuracion;
      let precio_archivo;
      filesAux = filesAux.controls;
      console.log("files aux:", filesAux);

      const files = filesAux.map(file => {
         quantityVeenersByFile = 0;
         precio_archivo = 0;
         file = file.value;
         // TODO: sacar el cálculo de desdehasta (ya esta en onStep3)
         file[this.FORM_CONFIGURATION_VALUES.files.configurationsName].forEach((configuracion, index) => {
            // Si puso personalizado -> tomo el rango que ingresó el usuario
            if (configuracion[this.FORM_CONFIGURATION_VALUES.files.configurations.selectedSheets] != 0) {
               file[this.FORM_CONFIGURATION_VALUES.files.configurationsName][index][
                  this.FORM_CONFIGURATION_VALUES.files.configurations.fromTo
               ] = this.splitRange(
                  file[this.FORM_CONFIGURATION_VALUES.files.configurationsName][index][
                  this.FORM_CONFIGURATION_VALUES.files.configurations.fromToInput
                  ]
               );
            } else {
               // Sino, tomo el rango total de hojas del archivo
               file[this.FORM_CONFIGURATION_VALUES.files.configurationsName][index][
                  this.FORM_CONFIGURATION_VALUES.files.configurations.fromTo
               ] = this.splitRange("1-" + file["cantidadPaginas"]);
            }
            quantityVeenersByConfiguration = Math.ceil(
               file[this.FORM_CONFIGURATION_VALUES.files.configurationsName][index][
                  this.FORM_CONFIGURATION_VALUES.files.configurations.fromTo
               ].length /
               file[this.FORM_CONFIGURATION_VALUES.files.configurationsName][index][
               this.FORM_CONFIGURATION_VALUES.files.configurations.slidesPerSheet
               ]
            );
            // Son carillas
            quantityVeenersByFile += quantityVeenersByConfiguration;
            // Calculo de precio de la configuracion
            // ! Precio para doble faz
            if (configuracion[this.FORM_CONFIGURATION_VALUES.files.configurations.duplex]) {
               const pagesWithoutFloor = quantityVeenersByConfiguration / 2;
               console.log(
                  pagesWithoutFloor,
                  " ",
                  pagesWithoutFloor % 2,
                  " ",
                  Math.floor(pagesWithoutFloor) * this.precio_doble_faz
               );

               precio_configuracion =
                  quantityVeenersByConfiguration % 2 == 0
                     ? Math.floor(pagesWithoutFloor) * this.precio_doble_faz
                     : Math.floor(pagesWithoutFloor) * this.precio_doble_faz + this.precio_simple_faz;
               console.log("entro en doble faz $", precio_configuracion);
            }
            // ! Precio para simple faz
            else {
               precio_configuracion = quantityVeenersByConfiguration * this.precio_simple_faz;
               console.log("entro en simple faz $", precio_configuracion);
            }
            file[this.FORM_CONFIGURATION_VALUES.files.configurationsName][index][
               this.FORM_CONFIGURATION_VALUES.files.configurations.priceConfig
            ] = precio_configuracion;
            precio_archivo += precio_configuracion;
            importe_total += precio_configuracion;
         });
         if (file[this.FORM_CONFIGURATION_VALUES.files.sameConfig]) {
            quantityVeenersByFile *= file[this.FORM_CONFIGURATION_VALUES.files.copiesQuantity];
            precio_archivo *= file[this.FORM_CONFIGURATION_VALUES.files.copiesQuantity];
            importe_total *= file[this.FORM_CONFIGURATION_VALUES.files.copiesQuantity];
         }
         // file[this.FORM_CONFIGURATION_VALUES.totalPrice] = precio_archivo;
         console.log(file);
         this.tableTemplate.push({
            archivo: file[this.FORM_CONFIGURATION_VALUES.files.name],
            materia: file[this.FORM_CONFIGURATION_VALUES.files.courseName],
            cantidad: file[this.FORM_CONFIGURATION_VALUES.files.copiesQuantity],
            carillasTotales: quantityVeenersByFile,
            precio: precio_archivo
         });
         return file;
      });
      console.log("files aux dsp:", filesAux);

      let itemAnillado;
      console.log(this.tabs);

      this.tabs.forEach(tab => {
         // Compruebo si el anillado tiene archivos asociados
         console.log(tab.quantityVeeners);

         if (tab.quantityVeeners > 0) {
            console.log(this.tableTemplate);
            console.log(tab.ringType);

            itemAnillado = this.tableTemplate.find(item => item.archivo == tab.ringType.name);
            console.log(itemAnillado);

            if (!!itemAnillado) {
               itemAnillado.cantidad++;
               itemAnillado.precio += tab.ringType.price;
            } else {
               this.tableTemplate.push({
                  archivo: tab.ringType.name,
                  precio: tab.ringType.price,
                  cantidad: 1
               });
            }
            importe_total += tab.ringType.price;
         }
      });

      console.log("file que se inserta dsp:", files);

      this.form = this.svc.createFormGroup(this.settings, {
         id_usuario: this.authService.currentUserValue.id,
         archivos: files,
         id_sede: this.id_sede,
         importe_total: importe_total
      });
      console.log(this.form);

      this.mostrarTabla = true;
   }

   // Calcula el precio de cada copia de un archivo
   calcularPrecioArchivoConfiguracion() { }

   // Calcula el precio final (todas las copias) de cada archivo
   calcularPrecioArchivo(i) {
      let total = 0;
      if (this.archivos[i].configuraciones.length == this.archivos[i].cantidad) {
         this.archivos[i].configuraciones.forEach(configuracion => {
            total += configuracion.precio_archivo_config;
         });
      } else {
         total = this.archivos[i].configuraciones[0].precio_archivo_config * this.archivos[i].cantidad;
      }
      return total;
   }

   // Calcula el precio final del pedido
   calcularPrecio() {
      let total = 0;
      this.archivos.forEach((archivo, i) => {
         total += this.calcularPrecioArchivo(i);
      });
      return total;
   }

   onTabChange(index) {
      console.log(this.formConfiguration);

      // Step 4
      if (index.selectedIndex == 3) {
         this.onStep4();
      } else if (index.selectedIndex == 2) {
         this.onStep3();
      }
   }

   onSelectedSede(idsede) {
      this.form.controls["id_sede"].setValue(idsede);
   }

   onPostPedido() {
      this.service.postOrder(this.form.value).subscribe(
         resp => {
            this.orderSuccessSwal.fire();
         },
         error => {
            this.handleErrors(error);
         }
      );
   }

   // Counting pages

   splitRange(input) {
      console.log("entro con input: ", input);

      // Pregunto tipo para saber si ya se modificó el rango del input
      if (typeof input !== "object") {
         let splitedArrayInput = [];
         // Remove spaces and split by ","
         const splitedArray = input
            .split(" ")
            .join("")
            .split(",");
         splitedArray.forEach(element => {
            this.pushElements(element, splitedArrayInput);
         });
         //
         splitedArrayInput = [...new Set(splitedArrayInput)];
         splitedArrayInput.sort((a, b) => (b > a ? -1 : 1));
         return splitedArrayInput;
      } else {
         return input;
      }
   }

   /**
    *
    * @param {*} element = // "1-4" || "3-2" || "3"
    */
   pushElements(element, splitedArrayInputParam) {
      const array = element.split("-");
      let min;
      let max;
      if (array.length > 1) {
         parseInt(array[0]) > parseInt(array[1])
            ? ((max = array[0]), (min = array[1]))
            : ((max = array[1]), (min = array[0]));
         min = parseInt(min);
         max = parseInt(max);

         for (let i = min; i <= max; i++) {
            console.log("a insertar", i);

            splitedArrayInputParam.push(i);
         }
      } else {
         splitedArrayInputParam.push(parseInt(array[0]));
      }
   }

   handleErrors(err: HttpErrorResponse) {
      console.log(err);

      this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
      if (this.messageError) {
         this.alertError.openError(this.messageError);
      }
   }

   downloadFile(file) {
      // console.log(file);
      // this.service.downloadFile(file.idArchivo).subscribe(
      //    blob => saveAs(blob, file.name),
      //    error => this.handleErrors(error)
      // );
   }

   getCampuses(): Promise<Campus[]> {
      return new Promise((resolve, reject) => {
         this.service.getCampuses().subscribe(
            (campuses: any) => {
               resolve(campuses);
            },
            error => {
               reject(error);
            }
         );
      });
   }

   getItems(): Promise<Item[]> {
      return new Promise((resolve, reject) => {
         this.service.getItems().subscribe(
            (items: Item[]) => {
               resolve(items);
            },
            error => {
               reject(error);
            }
         );
      });
   }
}
