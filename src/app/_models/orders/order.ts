import { OrderFile } from './order-file';
import { OrderStatus } from './order-status';
import { Student, User } from '../users/user';

interface State{
  code: string,
  id: string,
  name: string
}
export interface Order {
  campus: {
    id: string,
    name: string
  };
  deposit: number,
  id: number;
  student: Student,
  state: State,
  total: number,
  tracking: {
    state: State,
    timestamp: Date
  } [],
  totalPrice: number;
  paidPrice: number;
  dateOrdered: Date;
  numberOfFiles: number;
  date: Date;
  files?: OrderFile[];
  status?: OrderStatus[];
  user?: User;
}
