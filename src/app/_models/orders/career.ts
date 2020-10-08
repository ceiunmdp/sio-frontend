import { Year } from './year';
import { TREE_TYPES } from 'src/app/logged/orders/orders.service';

export interface Career {
    id: number;
    name: string;
    type?: TREE_TYPES.CAREER
    children: Year[];
}
