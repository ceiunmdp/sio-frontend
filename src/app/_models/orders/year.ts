import { Course } from './course';

export interface Year {
    id: number;
    name: string;
    children: Course[];
}
