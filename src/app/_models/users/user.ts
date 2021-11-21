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
   serverStatus?: {
     free: number,
     size: number
   }
}

export interface Student extends User {
   dni?: number;
   balance: number;

}
