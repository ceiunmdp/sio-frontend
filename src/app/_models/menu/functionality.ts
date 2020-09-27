export interface Functionality {
   id: number;
   code: CODE;
   name: string;
   sub_functionalities: Functionality[];
}

type CODE = 'home';
