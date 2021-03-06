import { Career } from "./career";
import { Course } from "./course";

export interface File {
   id: string;
   name: string;
   format: string;
   number_of_sheets: number;
   year?: number;
   course?: Course;
   career?: Career;
}
