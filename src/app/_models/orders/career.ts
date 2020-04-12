import { Year } from './year';

export interface Career {
    id: number;
    name: string;
    children: Year[];
}
