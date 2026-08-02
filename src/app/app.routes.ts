import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Auth } from './components/auth/auth';
import { AddCar } from './components/add-car/add-car';
import { Register } from './components/register/register';
import { authGuard } from './guards/auth-guard';
import { ErorPage } from './components/eror-page/eror-page';


export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'auth',
        component: Auth
    },
    {
        path: 'add-car',
        component: AddCar,
        canActivate: [authGuard]
    },
    {
        path: 'register',
        component: Register
    },
    {
        path: '**',
        component: ErorPage
    }

];
