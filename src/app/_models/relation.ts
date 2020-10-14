import { Career } from './orders/career';

export interface Relation {
  id: string;
  name: string;
  careers: Career[];
}
