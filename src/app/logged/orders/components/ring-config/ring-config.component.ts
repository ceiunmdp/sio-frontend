import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { OrdersService } from '../../orders.service';
import { config } from 'rxjs';

@Component({
  selector: 'cei-ring-config',
  templateUrl: './ring-config.component.html',
  styleUrls: ['./ring-config.component.scss']
})
export class RingConfigComponent implements OnInit {
  @Input() configFiles: any[] = [];
  @ViewChild("tabAnillados", { static: false }) tabAnillados;
  selected = new FormControl(0);
  anillados: any[];
  /* Tabs anillados */
  tabs: {
    files;
    quantityPages: number;
    ringType: any;
  }[] = [{ files: [], quantityPages: 0, ringType: null }];

  constructor(private orderService: OrdersService) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    console.log(changes);
    if (changes.configFiles.currentValue && changes.configFiles.currentValue.length > 0) {
      this.configFiles = changes.configFiles.currentValue.map(configFile => {
        if (configFile.same_config) {
          for (let i = 1; i < configFile.copies; i++) {
            configFile.configurations.push({ ...configFile.configurations[0] })
          }
        }
        return configFile
      })
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
    this.tabs.push({ files: [], quantityPages: 0, ringType: null });

    if (selectAfterAdding) {
      this.selected.setValue(this.tabs.length - 1);
    }
  }

  onRemoveTabAnillado(index: number) {
    //Resetear orden_anillado e id_grupo_anillado del formConfiguration
    this.tabs[index].files.map(file => {
      this.resetRing(file.indexArchivo, file.indexConfiguracion);
    });
    console.log("Indice: ", index, "tabs: ", this.tabs);
    //Eliminarlos de la tab correspondiente

    this.tabs.splice(index, 1);
  }

  resetRing(indexArchivo, indexConfiguracion) {

  }

  onRemoveRingFile(indexArchivo, indexConfiguracion, indexTab, indexFile) {
    console.log(indexArchivo, indexConfiguracion);

    this.resetRing(indexArchivo, indexConfiguracion);

    let tab = this.tabs[indexTab];
    tab.quantityPages -= this.tabs[indexTab].files[indexFile].quantityPages;

    tab.files.splice(indexFile, 1);

    tab.ringType =
      tab.quantityPages > 0
        ? this.calculateRingType(this.fromVeenersToPages(this.tabs[indexTab].quantityPages))
        : null;
  }

  calculateRingType(totalPages) {
    // TODO: El calculo debiera ser por hoja no por carilla
    // const totalVeeners = quantityPagesByConfiguration
    //    ? quantityPagesByConfiguration + this.tabs[indexTab].quantityPages
    //    : this.tabs[indexTab].quantityPages;
    console.log("Paginas totales", totalPages);
    const anillado = this.anillados.find(anillado => totalPages <= anillado.maximumLimit);

    return anillado ? anillado : null;
  }

  fromVeenersToPages(veeners) {
    return Math.ceil(veeners / 2);
  }

  onRingFile(file, indexFile, indexConfiguration) {
    const tab = this.tabs[this.tabAnillados.selectedIndex];
    const configFile = file.same_config ? file.configurations[0] : file.configurations[indexConfiguration];
    const quantityPagesByConfiguration = this.orderService.calculatePages(configFile.range, configFile.double_sided);
    console.log('COnfig files: ', this.configFiles)
    console.log('FILE', file)
    console.log('qunatityPagesConfig', quantityPagesByConfiguration)
    // const ringType = this.calculateRingType(1);
    // Si no existe un tipo de anillado asociado -> La cantidad de hojas a anillar sobrepasa la max del max anillado
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
    const fileToModify = this.configFiles.find(configFile => configFile.file_id == file.file.id);
    const configFileToModify = fileToModify.configurations[indexConfiguration];
    configFileToModify.binding_groups = { id: this.tabAnillados.selectedIndex + 1, position: tab.files.length }
    console.log(this.configFiles)

    // if (!ringType) {
    //   //  this.ringExceededSwal.fire();
    //   console.error("no es posible anillar mas documentos en este grupo");
    // } else {
    //    tab.quantityPages += quantityPagesByConfiguration;
    //    tab.files.push({
    //       name: file.file.name,
    //       configuration: file.configurations.length > 1 ? file.configurations[indexConfiguration] : file.configurations[0],
    //       courses: file.file.courses,
    //       indexFile: indexFile,
    //       indexConfiguration: indexConfiguration,
    //       quantityPages: quantityPagesByConfiguration
    //    });
    //    tab.ringType = ringType;
    // }
  }
}
