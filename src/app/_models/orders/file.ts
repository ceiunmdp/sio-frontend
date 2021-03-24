import { Career } from "./career";
import { Course } from "./course";
import { TREE_TYPES } from 'src/app/logged/orders/orders.service';

export interface File {
   id: number;
   name: string;
   format: string;
   number_of_sheets: number;
   year?: number;
   course?: Course;
   career?: Career;
}
