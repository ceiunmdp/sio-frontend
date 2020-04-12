import { Functionality } from './functionality';

export interface Module {
   id: number;
   name: string;
   modules: Module[];
   functionalities: Functionality[];
}
