import { ParameterType } from './../_parameters/parameter-types';
export interface Parameter {
   id: string;
   name: string;
   code: ParameterType;
   value: number | string;
}
