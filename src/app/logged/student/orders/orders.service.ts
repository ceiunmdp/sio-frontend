import {Binding} from '../../../_models/binding';
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {API} from "src/app/_api/api";
import {environment} from "../../../../environments/environment";
import {File} from "../../../_models/orders/file";
import {Order} from "../../../_models/orders/order";
import {Career} from "../../../_models/orders/career";
import {Course} from "../../../_models/orders/course";
import {Year} from "../../../_models/orders/year";
import {Campus} from "src/app/_models/campus";
import {Item} from "src/app/_models/item";
import {OR, AND} from 'src/app/_helpers/filterBuilder';
import {ResponseAPI} from 'src/app/_models/response-api';
import {Sort} from 'src/app/_models/sort';
import {RestUtilitiesService} from 'src/app/_services/rest-utilities.service';
import {Pagination} from 'src/app/_models/pagination';
import {UnproccesedOrder} from './pages/new-order/new-order.component';
import MultiRange from 'multi-integer-range';
import {ORDER_STATES} from 'src/app/_orderStates/states';

export interface PostOrder {
  campus_id: string,
  use_free_copies?: boolean,
  order_files: {
    file_id: string,
    copies: number,
    configuration: {
      colour: boolean,
      double_sided: boolean,
      range: string,
      slides_per_sheet: number
    },
    binding_groups?: {
      id: number,
      position: number
    }[]
  }[]
}
export interface ExternalOrder {
  campusId: number;
  totalPrice: number;
  amountPaid: number;
  files: ExternalFile[];
}

export enum TREE_TYPES {
  CAREER,
  YEAR,
  COURSE,
  FILE
}

export interface ExternalFile {
  id: number;
  name: string;
  quantity: number;
  sameConfiguration: boolean;
  configurations: ExternalConfiguration[];
}

export interface ExternalConfiguration {
  doubleFace: boolean;
  color: boolean;
  fromUntil: string;
  slidesPerSheet: number;
  price: number;
  ringedGroupFrontId?: number;
  ringedOrder?: number;
}

interface TreeArchivos {
  idCarrera: number;
  name: string;
  children: [
    {
      idAnio: number;
      name: string;
      children: [
        {
          idMateria: number;
          name: string;
          children: [
            {
              idArchivo: number;
              cantidad_hojas: number;
              extension: string;
              name: string;
            }
          ];
        }
      ];
    }
  ];
}

export enum PRICES_CODES {
  colour = 'colour',
  simple_sided = 'simple_sided',
  double_sided = 'double_sided',
}
@Injectable({
    providedIn: 'root',
})
export class OrdersService {
    constructor(private http: HttpClient, private restService: RestUtilitiesService) {}

    getOrders(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<ResponseAPI<Order[]>> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        const params: HttpParams = this.restService.formatCreateAndAppendQps({ filter, sort, pagination });
        return this.http
            .get(`${environment.apiUrl}/${API.ORDERS}`, {
                headers: queryHeaders,
                observe: 'response',
                params: params,
            })
            .pipe(
                map<HttpResponse<any>, any>((response) => {
                    return response.body;
                })
            );
    }

    getMyOrders(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<ResponseAPI<Order[]>> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        const params: HttpParams = this.restService.formatCreateAndAppendQps({ filter, sort, pagination });
        return this.http
            .get(`${environment.apiUrl}/${API.MY_ORDERS}`, {
                headers: queryHeaders,
                observe: 'response',
                params,
            })
            .pipe(
                map<HttpResponse<ResponseAPI<Order[]>>, ResponseAPI<Order[]>>((response) => {
                    return response.body;
                })
            );
    }

    getOrderById(orderId: number): Observable<Order> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');

        return this.http
            .get<Order>(`${environment.apiUrl}/${API.ORDERS}/${orderId}`, {
                headers: queryHeaders,
                observe: 'response',
            })
            .pipe(
                map<HttpResponse<any>, Order>((response) => {
                    return response.body.data;
                })
            );
    }

    getOrderFiles(orderId: number): Observable<any> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');

        return this.http
            .get<Order>(`${environment.apiUrl}/${API.ORDERS}/${orderId}/order-files`, {
                headers: queryHeaders,
                observe: 'response',
            })
            .pipe(
                map<HttpResponse<any>, Order>((response) => {
                    return response.body.data;
                })
            );
    }

    patchOrder(body: { state: { code: ORDER_STATES } }, orderId: number): Observable<Order> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        return this.http
            .patch<any>(`${environment.apiUrl}/${API.ORDERS}/${orderId}`, body, {
                headers: queryHeaders,
                observe: 'response',
            })
            .pipe(
                map<HttpResponse<ResponseAPI<Order>>, Order>((response) => {
                    return response.body.data.items;
                })
            );
    }

    // TODO:NUEVO
    getCareers(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<ResponseAPI<Career[]>> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        const params: HttpParams = this.restService.formatCreateAndAppendQps({ filter, sort, pagination });
        return this.http
            .get(environment.apiUrl + '/' + API.CAREERS, {
                headers: queryHeaders,
                observe: 'response',
                params,
            })
            .pipe(
                map<HttpResponse<ResponseAPI<Career[]>>, ResponseAPI<Career[]>>((result) => {
                    return result.body;
                })
            );
    }

    // TODO:NUEVO
    getYears(filter?: OR | AND, sort?: Sort[]): Observable<ResponseAPI<Year[]>> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        const params: HttpParams = this.restService.formatCreateAndAppendQps({ filter, sort });
        return this.http
            .get(environment.apiUrl + '/' + API.RELATIONS, {
                headers: queryHeaders,
                observe: 'response',
                params,
            })
            .pipe(
                map<HttpResponse<ResponseAPI<Year[]>>, ResponseAPI<Year[]>>((result) => {
                    return result.body;
                    // return years.map((yearResponse: YearResponse) => { const year: any = yearResponse; year.children = []; year.type = TREE_TYPES.YEAR; return year });
                })
            );
    }

    // TODO:NUEVO
    getCourses(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<ResponseAPI<Course[]>> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        const params: HttpParams = this.restService.formatCreateAndAppendQps({ filter, sort, pagination });
        return this.http
            .get(environment.apiUrl + API.COURSES, {
                headers: queryHeaders,
                observe: 'response',
                params,
            })
            .pipe(
                map<HttpResponse<any>, any>((result) => {
                    return result.body;
                    // return courses.map((courseResponse: CourseResponse) => { const course: any = courseResponse; course.children = []; course.type = TREE_TYPES.COURSE; return course });
                })
            );
    }

    // Todo: Nuevo
    getFilesV2(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<ResponseAPI<File[]>> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        const params: HttpParams = this.restService.formatCreateAndAppendQps({ filter, sort, pagination });
        return this.http
            .get(environment.apiUrl + API.FILES, {
                headers: queryHeaders,
                observe: 'response',
                params,
            })
            .pipe(
                map<HttpResponse<any>, any>((result) => {
                    return result.body;
                    // return courses.map((courseResponse: CourseResponse) => { const course: any = courseResponse; course.children = []; course.type = TREE_TYPES.COURSE; return course });
                })
            );
    }

    getFilesByCourse(filter: OR | AND): Observable<File[]> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        const queryParams = new HttpParams().append('filter', JSON.stringify(filter));
        return this.http.get(environment.apiUrl + '/files', { headers: queryHeaders, observe: 'response', params: queryParams }).pipe(
            map<HttpResponse<any>, any>((result) => {
                return result.body.data.items;
            })
        );
    }

    getFiles(): Observable<Career[]> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        return this.http.get(environment.apiUrl + '/' + API.CAREERS, { headers: queryHeaders, observe: 'response' }).pipe(
            map<HttpResponse<any>, any>((result) => {
                return null;
            })
        );
    }

    getCampuses(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<ResponseAPI<Campus[]>> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        const params: HttpParams = this.restService.formatCreateAndAppendQps({ filter, sort, pagination });
        return this.http
            .get(environment.apiUrl + '/' + API.CAMPUSES, {
                headers: queryHeaders,
                observe: 'response',
                params,
            })
            .pipe(
                map<HttpResponse<ResponseAPI<Campus[]>>, ResponseAPI<Campus[]>>((result) => {
                    return result.body;
                })
            );
    }

    getFile(fileId: number): Observable<Career[]> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/x-www-form-urlencoded');
        const queryParams = new HttpParams().append('download', 'true');

        return this.http
            .get(`${environment.apiUrl}/files/${fileId}/content`, {
                headers: queryHeaders,
                responseType: 'blob',
                observe: 'response',
                params: queryParams,
            })
            .pipe(
                map<any, any>((result) => {
                    return result.body;
                })
            );
    }

    getItems(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<ResponseAPI<Item[]>> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        const params: HttpParams = this.restService.formatCreateAndAppendQps({ filter, sort, pagination });
        return this.http.get(environment.apiUrl + '/' + API.ITEMS, { headers: queryHeaders, params: params, observe: 'response' }).pipe(
            map<HttpResponse<any>, any>((result) => {
                return result.body;
                // return items.map(item => {
                //    item.price = item.price ? parseFloat(item.price.toString()) : null;
                //    return item;
                // });
            })
        );
    }

    getBindings(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<ResponseAPI<Binding[]>> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        const params: HttpParams = this.restService.formatCreateAndAppendQps({ filter, sort, pagination });
        return this.http
            .get(environment.apiUrl + '/' + API.ITEMS + '/' + API.BINDINGS, { headers: queryHeaders, params: params, observe: 'response' })
            .pipe(
                map<HttpResponse<any>, any>((result) => {
                    return result.body;
                    // return items.map(item => {
                    //    item.price = item.price ? parseFloat(item.price.toString()) : null;
                    //    return item;
                    // });
                })
            );
    }

    getOwnFiles(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<ResponseAPI<File[]>> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      const params: HttpParams = this.restService.formatCreateAndAppendQps({filter, sort, pagination})
      return this.http.get(environment.apiUrl + API.FILES + "/me",
        {
          headers: queryHeaders,
          observe: "response",
          params
        }).pipe(
          map<HttpResponse<any>, any>(result => {
            return result.body;
            // return courses.map((courseResponse: CourseResponse) => { const course: any = courseResponse; course.children = []; course.type = TREE_TYPES.COURSE; return course });
          })
        );
    }

    mapToOrderApi(order: UnproccesedOrder): PostOrder {
        let postOrder: Partial<PostOrder> = {
            campus_id: order.campus_id,
            order_files: []
        };
        console.log(order);
        if (order.use_free_copies != undefined && order.use_free_copies != null) {
          postOrder['use_free_copies'] = order.use_free_copies;
        }
        order.order_files.forEach((orderFile) => {
            if (orderFile.same_config) {
                // Sacar los bindings groups de cada configuration
                // pushear la primera configuracion a postOrder
                // pushear, a la par de la configuracion, los binding groups que habia sacado antes
                const binding_groups = orderFile.configurations.reduce((previousValue, currentValue) => {
                    if (currentValue.binding_groups) {
                        delete currentValue.binding_groups.binding;
                        previousValue.push(currentValue.binding_groups);
                    }
                    return previousValue;
                }, []);
                const configuration: any = { ...orderFile.configurations[0] };
                delete configuration.binding_groups;
                configuration.double_sided = !configuration.double_sided ? false : true;
                delete configuration.options_range;
                configuration.slides_per_sheet = Number(configuration.slides_per_sheet);
                configuration.range = new MultiRange(configuration.range).toString();
                const copies = orderFile.copies;
                const file_id = orderFile.file_id;
                // Hacer opcional el binding groups
                postOrder.order_files.push({ ...(binding_groups.length > 0 && { binding_groups }), configuration, copies, file_id });
            } else {
                // por cada configuracion crear un nuevo order file (junto con el file id)
                // en cada nuevo order file creado, tambien guardar el binding group que estaba en el configuration
                orderFile.configurations.forEach((_configuration) => {
                    const copies = 1;
                    const file_id = orderFile.file_id;
                    if (_configuration.binding_groups) {
                        delete _configuration.binding_groups.binding;
                    }
                    const configuration: any = { ..._configuration };
                    configuration.double_sided = !configuration.double_sided ? false : true;
                    delete configuration.options_range;
                    configuration.slides_per_sheet = Number(configuration.slides_per_sheet);
                    configuration.range = new MultiRange(configuration.range).toString();
                    delete configuration.binding_groups;
                    postOrder.order_files.push({
                        ...(!!_configuration.binding_groups && { binding_groups: [_configuration.binding_groups] }),
                        configuration,
                        copies,
                        file_id,
                    });
                });
            }
        });
        return postOrder as PostOrder;
    }

    splitRange(input) {
        // Pregunto tipo para saber si ya se modificó el rango del input
        if (typeof input !== 'object') {
            let splitedArrayInput = [];
            // Remove spaces and split by ","
            const splitedArray = input.split(' ').join('').split(',');
            splitedArray.forEach((element) => {
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
        const array = element.split('-');
        let min;
        let max;
        if (array.length > 1) {
            parseInt(array[0]) > parseInt(array[1]) ? ((max = array[0]), (min = array[1])) : ((max = array[1]), (min = array[0]));
            min = parseInt(min);
            max = parseInt(max);

            for (let i = min; i <= max; i++) {
                splitedArrayInputParam.push(i);
            }
        } else {
            splitedArrayInputParam.push(parseInt(array[0]));
        }
    }

    calculateVeneers(range) {
        return this.splitRange(range).length;
    }

    calculatePages(range, doubleSided: boolean = true, slidesPerSheet: number = 1) {
        const veneers = this.calculateVeneers(range);
        const quantityPagesRangedAndSlided = Math.ceil(veneers / slidesPerSheet);
        const quantityPagesRangedAndSlidedAndSided = doubleSided ? Math.ceil(quantityPagesRangedAndSlided / 2) : quantityPagesRangedAndSlided;
        return quantityPagesRangedAndSlidedAndSided;
    }

    // Nuevo
    postNewOrder(order: PostOrder): Observable<ResponseAPI<Order>> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        return this.http
            .post<ResponseAPI<Order>>(environment.apiUrl + '/orders', JSON.stringify(order), {
                headers: queryHeaders,
                observe: 'response',
            })
            .pipe(
                map<HttpResponse<ResponseAPI<Order>>, any>((response) => {
                    return response.body;
                })
            );
    }
}
