import {Component, Input, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {OrdersService} from '../../orders.service';
import {Binding} from 'src/app/_models/binding';

@Component({
  selector: 'cei-ring-config',
  templateUrl: './ring-config.component.html',
  styleUrls: ['./ring-config.component.scss']
})
export class RingConfigComponent implements OnInit {
  @ViewChild("tabAnillados", {static: false}) tabAnillados;
  @ViewChild("ringExceededSwal", {static: true}) ringExceededSwal;
  @Input() configFiles: any[] = [];
  @Input() bindings: Binding[] = [];
  selected = new FormControl(0);
  /* Tabs anillados */
  tabs: {
    files;
    quantityPages: number;
    ringType: any;
  }[] = [{files: [], quantityPages: 0, ringType: null}];

  constructor(private orderService: OrdersService) {}

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('SE PRODUJO UN CAMBIO', changes);
    if (changes.configFiles && changes.configFiles.currentValue && changes.configFiles.currentValue.length > 0) {
      this.tabs = [{files: [], quantityPages: 0, ringType: null}];
      this.configFiles = changes.configFiles.currentValue.map(configFile => {
        const _configFile = JSON.parse(JSON.stringify(configFile));

        if (configFile.same_config) {
          for (let i = 1; i < configFile.copies; i++) {
            _configFile.configurations.push({...configFile.configurations[0]})
          }
        }
        return _configFile
      })
    }
    if (changes.bindings && changes.bindings.currentValue) {
      this.bindings = this.bindings.sort((a, b) => a.sheets_limit - b.sheets_limit)
    }

  }

  /**
    ** Retorna true: todos los archivos fueron asignados a un anillado
    ** || existe un tab de anillado sin ningún archivo asignado
    */
  isDisabledNewTabAnillado(): boolean {
    return false;
  }

  onAddTabAnillado(selectAfterAdding: boolean) {
    this.tabs.push({files: [], quantityPages: 0, ringType: null});

    if (selectAfterAdding) {
      this.selected.setValue(this.tabs.length - 1);
    }
  }

  onRemoveTabAnillado(indexTab: number) {
    //Eliminar el binding_groups de las configurations asociadas a los archivos
    this.tabs[indexTab].files.forEach((tab) => {
      const indexFile = tab.indexFile;
      const indexConfiguration = tab.indexConfiguration;
      this.removeConfigurationRing(indexFile, indexConfiguration);
    })
    //Eliminar la tab correspondiente
    this.tabs.splice(indexTab, 1);
  }

  removeConfigurationRing(indexFile, indexConfiguration) {
    if (!!this.configFiles[indexFile] && !!this.configFiles[indexFile].configurations[indexConfiguration]) {
      const configurationFile = this.configFiles[indexFile].configurations[indexConfiguration];
      delete configurationFile.binding_groups;
    }
  }

  onRemoveRingFile(indexFile, indexConfiguration, indexTab, indexTabFile) {
    this.removeConfigurationRing(indexFile, indexConfiguration);

    let tab = this.tabs[indexTab];
    console.log(arguments);
    console.log(this.tabs);
    console.log(tab);

    tab.quantityPages -= this.tabs[indexTab].files[indexTabFile].quantityPages;

    tab.files.splice(indexTabFile, 1);

    tab.ringType =
      tab.quantityPages > 0
        ? this.calculateRingType(this.fromVeenersToPages(this.tabs[indexTab].quantityPages))
        : null;
  }

  calculateRingType(totalPages) {
    const binding = this.bindings.find(binding => totalPages <= binding.sheets_limit);
    return binding ? binding : null;
  }

  fromVeenersToPages(veeners) {
    return Math.ceil(veeners / 2);
  }

  onRingFile(file, indexFile, indexConfiguration) {
    const tab = this.tabs[this.tabAnillados.selectedIndex];
    const configFile = file.same_config ? file.configurations[0] : file.configurations[indexConfiguration];
    const quantityPagesByConfiguration = this.orderService.calculatePages(configFile.range, configFile.double_sided, configFile.slides_per_sheet);
    const totalPagesTab = tab.quantityPages + quantityPagesByConfiguration
    console.log(quantityPagesByConfiguration, totalPagesTab);

    const ringType = this.calculateRingType(totalPagesTab);
    // Si no existe un tipo de anillado asociado -> La cantidad de hojas a anillar sobrepasa la max del max anillado
    if (!ringType) {
      this.ringExceededSwal.fire();
      console.error("no es posible anillar mas documentos en este grupo");
    } else {
      tab.quantityPages += quantityPagesByConfiguration;
      let fileName = file.file.name + ' (';
      file.file.courses.forEach(course => {
        fileName += course.name
      });
      fileName += ')';
      if (file.copies > 1) {
        fileName += ' - ' + (indexConfiguration + 1)
      }
      tab.files.push({
        name: file.file.name,
        literalName: fileName,
        configuration: file.configurations.length > 1 ? file.configurations[indexConfiguration] : file.configurations[0],
        courses: file.file.courses,
        indexFile: indexFile,
        indexConfiguration: indexConfiguration,
        quantityPages: quantityPagesByConfiguration
      });
      tab.ringType = ringType;
      // Se modifica el configFiles, agregándole el anillado 
      const fileToModify = this.configFiles.find(configFile => configFile.file_id == file.file.id);
      const configFileToModify = fileToModify.configurations[indexConfiguration];
      configFileToModify.binding_groups = {id: this.tabAnillados.selectedIndex + 1, position: tab.files.length, binding: ringType}
      console.log(this.configFiles)
    }
  }
}
