import { Routes } from '@angular/router';
import { ConversionComponent } from './currencies/conversion/conversion.component';

export const routes: Routes = [
    { path: '', redirectTo: '/convert', pathMatch: 'full' }, // Redirect to /list by default
    { path: 'convert', component: ConversionComponent }, // also possible to set via subject/subscriber
    { path: '**', redirectTo: '/convert' }
]
