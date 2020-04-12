export interface UserRegister {
    name: string;
    surname: string;
    email: string;
    dni: number;
    password: string;
    passwordConfirm?: string;
}
