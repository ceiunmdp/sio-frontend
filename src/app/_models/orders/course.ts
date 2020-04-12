import { File } from "./file";

export interface Course {
   id: number;
   name: string;
   children?: File[];
}
