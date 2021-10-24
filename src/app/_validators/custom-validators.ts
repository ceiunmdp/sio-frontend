import { AbstractControl, ValidatorFn } from "@angular/forms";

export class CustomValidators {
   static required(message: string): ValidatorFn {
      return (control: AbstractControl): { [key: string]: any } | null => {
         return control && (!control.value || (typeof control.value !== "number" ? control.value.length < 1 : false))
            ? {
               required: message
            }
            : null;
      };
   }

   static number(message: string): ValidatorFn {
      return (control: AbstractControl): { [key: string]: any } | null => {
         return control && !/^\d+$/.test(control.value)
            ? {
               number: message
            }
            : null;
      };
   }

   static minLength(minLength: number, message: string): ValidatorFn {
      return (control: AbstractControl): { [key: string]: any } | null => {
         if (control.value === null) {
            return null;
         }
         if (typeof control.value !== "number") {
            return control && control.value.trim().length < minLength
               ? {
                  minLength: message
               }
               : null;
         } else {
            return control && control.value.toString().length < minLength
               ? {
                  minLength: message
               }
               : null;
         }
      };
   }

   static maxLength(maxLength: number, message: string): ValidatorFn {
      return (control: AbstractControl): { [key: string]: any } | null => {
         if (typeof control.value !== "number") {
            return control && control.value && control.value.trim().length > maxLength
               ? {
                  maxLength: message
               }
               : null;
         } else {
            return control && control.value.toString().length > maxLength
               ? {
                  maxLength: message
               }
               : null;
         }
      };
   }

   static minValue(minValue: number, message: string): ValidatorFn {
      return (control: AbstractControl): { [key: string]: any } | null => {
         if (typeof control.value !== 'number') {
            return {
               minValue: message,
            }
         } else {
            console.log('min value', minValue);
            console.log('control value', control.value);
            console.log('condition', (control && control.value && control.value < minValue));
            return control && control.value && control.value < minValue
               ? {
                  minValue: message,
               }
               : null;
         }
      };
   }

   static maxValue(maxValue: number, message: string): ValidatorFn {
      return (control: AbstractControl): { [key: string]: any } | null => {
         if (typeof control.value !== 'number') {
            return {
               maxValue: message,
            }
         } else {
            return control && control.value && control.value > maxValue
               ? {
                  maxValue: message,
               }
               : null;
         }
      };
   }

   static email(message: string): ValidatorFn {
      return (control: AbstractControl): { [key: string]: any } | null => {
         return control &&
            new RegExp(
               // tslint:disable-next-line: max-line-length
               /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            ).test(control.value.trim())
            ? null
            : {
               email: message
            };
      };
   }

   static password(message: string): ValidatorFn {
      return (control: AbstractControl): { [key: string]: any } | null => {
         return control &&
            new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+-])[A-Za-z\d@$!%*?&+-]{8,}$/, "i").test(control.value.trim())
            ? null
            : {
               password: message
            };
      };
   }

   static phoneNumberInvalidValidator(prefixName: string, suffixName: string, message: string): ValidatorFn {
      return (control: AbstractControl): { [key: string]: any } | null => {
         const prefix = control.get(prefixName);
         const suffix = control.get(suffixName);

         return prefix && suffix && prefix.value.trim().length + suffix.value.trim().length !== 10
            ? {
               phoneNumberInvalid: message
            }
            : null;
      };
   }
}
