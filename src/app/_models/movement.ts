import { MovementType } from './orders/movementType';

export interface Movement {
   id: string;
   amount: number,
   date: Date,
   source: {
      id: string
   },
   target: {
      id: string
   },
   type: MovementType
}
