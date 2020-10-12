import { File } from "./file";
import { TREE_TYPES } from 'src/app/logged/orders/orders.service';
import { Year } from './year';

export interface Course {
   id: string;
   name: string;
   relations?: Year[];
}
