import { OrderFile } from "./order-file";
import { OrderStatus } from "./order-status";
import { User } from "../users/user";
import { Campus } from "../campus";

export interface OrderCampus {
   id: number;
   amountPaid: number;
   campus: Campus;
   dateOrdered: Date;
   orderFiles: OrderFile[];
   state: {
      id: number;
      name: string;
   };
   totalPrice: number;
   tracking: {
      date: Date;
      state: {
         id: number;
         name: string;
      };
   }[];
   user: User;
}
