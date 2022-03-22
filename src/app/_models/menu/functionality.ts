export interface Functionality {
   id: number;
   code: string;
   name: string;
   sub_functionalities: Functionality[];
}
