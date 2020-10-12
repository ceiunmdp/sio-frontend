import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { UtilsModule } from '../_utils/utils.module';
import { HeaderComponent } from './sections/header/header.component';
import { StartPageComponent } from './start-page/start-page.component';
import { UnloggedRoutingModule } from './unlogged-routing.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { FormRulesModule } from 'ng-form-rules';
import { MatListModule } from '@angular/material/list';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { firebaseConfig } from '../app.module';

export function fbfunction() { return 'my_factory' };


@NgModule({
    declarations: [StartPageComponent, HeaderComponent],
    imports: [
        CommonModule,
        MatTabsModule,
        UnloggedRoutingModule,
        UtilsModule,
        FlexLayoutModule,
        MatInputModule,
        MatCardModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatToolbarModule,
        MatIconModule,
        FormRulesModule,
        MatListModule,
        SweetAlert2Module.forRoot(),
        NgxAuthFirebaseUIModule.forRoot(firebaseConfig, fbfunction,
            {
                toastMessageOnAuthSuccess: false, // whether to open/show a snackbar message on auth success - default : true
                toastMessageOnAuthError: false, // whether to open/show a snackbar message on auth error - default : true
                authGuardLoggedInURL: '/cei', // url for authenticated users - to use in combination with canActivate feature on a route
            }),
    ]
})


export class UnloggedModule { }
