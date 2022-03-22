export interface User {
   id?: number;
   course?: any;
   dark_theme?: boolean;
   disabled?: number;
   display_name?: string;
   email?: string;
   email_verified?: boolean;
   token?: string;
   type?: string;
   rootPath?: string;
   homePath?: string;
   remaining_copies?: number;
   balance?: number;
   available_storage?: number;
   storage_used?: number;
   links?: {
     code: string;
     id: string;
     name: string;
     value: string;
   }[];
   serverStatus?: {
     free: number,
     size: number
   }
}

export interface Student extends User {
   dni?: number;
   balance: number;

}
