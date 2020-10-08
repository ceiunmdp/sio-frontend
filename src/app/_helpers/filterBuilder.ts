export enum OPERATORS {
   IS = 'is',
   NOT = 'not',
   IN = 'in',
   NOT_IN = 'not_in',
   LT = 'lt',
   LTE = 'lte',
   GT = 'gt',
   GTE = 'gte',
   CONTAINS = 'contains',
   NOT_CONTAINS = 'not_contains',
   STARTS_WITH = 'starts_with',
   NOT_STARTS_WITH = 'not_starts_with',
   ENDS_WITH = 'ends_with',
   NOT_ENDS_WITH = 'not_ends_with'
}

export interface OR {
   OR: OR[] | AND[] | WHERE[]
}
export interface AND {
   AND: OR[] | AND[] | WHERE[]
}
interface WHERE {
   [key: string]: {
      [oasd: string]: string | number | Date
   }
}
export class FilterBuilder {
   public or(...args: OR[] | AND[] | WHERE[]): OR {
      return {
         OR: args
      }
   }

   public and(...args: OR[] | AND[] | WHERE[]): AND {
      return {
         AND: args
      }
   }

   public where(property: string, operator: OPERATORS, value: string | number | Date): WHERE {
      const c: any = property;
      return {
         [c]: {
            [operator]: value
         }
      }
   }
}