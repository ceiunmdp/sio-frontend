import { Career } from "./career";
import { Course } from "./course";

export interface File {
   id: number;
   name: string;
   format: string;
   numberOfSheets: number;
   year?: number;
   course?: Course;
   career?: Career;
}
