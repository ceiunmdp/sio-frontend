import { Configuration } from "./configuration";

export interface OrderFile {
   id: number;
   configuration: Configuration;
   file: File;
   price: number;
   state: {
      id: number;
      name: string;
   };
}
