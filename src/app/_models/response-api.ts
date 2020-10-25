export interface ResponseAPI<Data> {
   data: {
      items: Data,
      meta: {
         item_count: number,
         total_items: number,
         items_per_page: number,
         total_pages: number,
         current_page: number
      },
      links: {
         first: string,
         previous: string,
         next: string,
         last: string
      }
   }
}
