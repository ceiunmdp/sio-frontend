import { Relation } from './relation';


export interface Subject {
  id: string;
  name: string;
  relations: Relation[];
}
