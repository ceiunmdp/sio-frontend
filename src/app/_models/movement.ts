import { MovementType } from './orders/movementType';
import { Student, User } from './users/user';

export interface Movement {
   id: string;
   amount: number,
   date: Date,
   source: User,
   target: User,
   type: MovementType
}
