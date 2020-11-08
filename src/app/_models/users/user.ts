export interface User {
   id?: number;
   dark_theme?: number;
   disabled?: number;
   display_name?: string;
   email?: string;
   email_verified?: boolean;
   token?: string;
   type?: string;
}

export interface Student extends User {
   dni?: number;
   balance: number;

}
