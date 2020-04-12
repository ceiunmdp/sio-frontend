import { Item } from "../item";

export interface Configuration {
   id: number;
   color: boolean;
   doubleFace: boolean;
   fromUntil: string;
   ringedGroup?: {
      id: number;
      price: number;
      item: Item;
   };
   ringedOrder?: number;
   slidesPerSheet: number;
}
