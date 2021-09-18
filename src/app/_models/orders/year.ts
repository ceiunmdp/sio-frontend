import { Career } from './career';

// TODO: DEPRECATED -> USE RELATION
export interface Year {
    id: string;
    name: string;
    careers: Career[];
}
