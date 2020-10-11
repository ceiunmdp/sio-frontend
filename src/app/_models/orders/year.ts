import { Course } from './course';
import { TREE_TYPES } from 'src/app/logged/orders/orders.service';
import { Career } from './career';

export interface Year {
    id: string;
    name: string;
    careers?: Career[];
}
