import { Year } from './year';

export interface Course {
   id: string;
   name: string;
   relations?: Year[];
}
