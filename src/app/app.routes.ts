import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Auth } from './components/auth/auth';
import { AddCar } from './components/add-car/add-car';
import { Register } from './components/register/register';
import { authGuard } from './guards/auth-guard';
import { ErorPage } from './components/eror-page/eror-page';
import { Cars } from './components/cars/cars';
import { Cardetals } from './components/cardetals/cardetals';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'cars', component: Cars },
    { path: 'car/:id', component: Cardetals },
    { path: 'auth', component: Auth },
    { path: 'add-car', component: AddCar, canActivate: [authGuard] },
    { path: 'register', component: Register },
    { path: '**', component: ErorPage }
];