export interface ResponseAPI<Data> {
   data: {
      items: Data,
      meta: MetadataAPI,
      links: LinksAPI
   }
}

export interface MetadataAPI {
   item_count: number,
   total_items: number,
   items_per_page: number,
   total_pages: number,
   current_page: number
}

export interface LinksAPI {
   first: string,
   previous: string,
   next: string,
   last: string
}
