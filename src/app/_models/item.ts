import { ITEM_TYPES } from 'src/app/_items/types';
export interface Item {
   id: string;
   code: string;
   name: string;
   price: number;
   type: ITEM_TYPES;
}
