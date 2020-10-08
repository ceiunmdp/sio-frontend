import { Career } from "./career";
import { Course } from "./course";
import { TREE_TYPES } from 'src/app/logged/orders/orders.service';

export interface File {
   id: number;
   name: string;
   type?: TREE_TYPES.YEAR;
   format: string;
   numberOfSheets: number;
   year?: number;
   course?: Course;
   career?: Career;
}
