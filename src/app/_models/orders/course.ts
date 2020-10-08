import { File } from "./file";
import { TREE_TYPES } from 'src/app/logged/orders/orders.service';
import { Year } from './year';

export interface Course {
   id: number;
   name: string;
   type?: TREE_TYPES.COURSE;
   relations?: Year[];
   children?: File[];
}
