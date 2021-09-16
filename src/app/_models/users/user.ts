export interface User {
   id?: number;
   course?: any;
   dark_theme?: number;
   disabled?: number;
   display_name?: string;
   email?: string;
   email_verified?: boolean;
   token?: string;
   type?: string;
   rootPath?: string;
   homePath?: string;
}

export interface Student extends User {
   dni?: number;
   balance: number;

}
