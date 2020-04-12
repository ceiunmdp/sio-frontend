import { OrderFile } from './order-file';
import { OrderStatus } from './order-status';
import { User } from '../users/user';

export interface Order {
    id: number;
    totalPrice: number;
    paidPrice: number;
    campus: string;
    state: string;
    numberOfFiles: number;
    date: Date;
    files?: OrderFile[];
    status?: OrderStatus[];
    user?: User;
}
