import { OrderFile } from './order-file';
import { OrderStatus } from './order-status';
import { Student, User } from '../users/user';

interface State{
  code: string;
  id: string;
  name: string;
}
export interface Order {
  campus: {
    id: string,
    name: string
  };
  deposit: number;
  id: number;
  id_number: number;
  student: Student;
  state: State;
  subtotal: number;
  discount: number;
  total: number;
  tracking: {
    state: State,
    timestamp: Date
  } [];
  totalPrice: number;
  paidPrice: number;
  dateOrdered: Date;
  numberOfFiles: number;
  date: Date;
  files?: OrderFile[];
  status?: OrderStatus[];
  user?: User;
}
