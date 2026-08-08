import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Auth } from './components/auth/auth';
import { AddCar } from './components/add-car/add-car';
import { Register } from './components/register/register';
import { authGuard } from './guards/auth-guard';
import { ErorPage } from './components/eror-page/eror-page';
import { Cars } from './components/cars/cars';
import { Cardetals } from './components/cardetals/cardetals';
import { guestGuard } from './guards/guest-guard-guard';
import { Profile } from './components/profile/profile';

export const routes: Routes = [
    {
        path: '', component: Home,
        data: {
            title: 'MyCar.ge — მანქანების ყიდვა-გაყიდვა საქართველოში',
            description: 'იყიდე და გაყიდე მანქანა მარტივად MyCar.ge-ზე. ათასობით განცხადება, გამარტივებული ძებნა მარკის, მოდელის, წლის და ფასის მიხედვით.'
        }
    },
    {
        path: 'cars', component: Cars,
        data: {
            title: 'მანქანების კატალოგი',
            description: 'დაათვალიერე ყველა გამოცხადებული მანქანა — გაფილტრე მარკის, მოდელის, ფასის, წლის და საწვავის ტიპის მიხედვით.'
        }
    },
    { path: 'car/:id', component: Cardetals }, // SEO მონაცემები დინამურად, კომპონენტში (SeoService)
    {
        path: 'auth', component: Auth, canActivate: [guestGuard],
        data: { title: 'ავტორიზაცია', description: 'შედი MyCar.ge-ის ანგარიშში მანქანის გასაყიდად ან საყიდლად.', noindex: true }
    },
    {
        path: 'add-car', component: AddCar, canActivate: [authGuard],
        data: { title: 'მანქანის დამატება', description: 'დაამატე შენი მანქანა გასაყიდად MyCar.ge-ზე რამდენიმე წუთში.', noindex: true }
    },
    {
        path: 'register', component: Register, canActivate: [guestGuard],
        data: { title: 'რეგისტრაცია', description: 'დარეგისტრირდი MyCar.ge-ზე და დაიწყე მანქანების ყიდვა-გაყიდვა.', noindex: true }
    },
    {
        path: 'profile', component: Profile, canActivate: [authGuard],
        data: { title: 'ჩემი პროფილი', description: 'მართე შენი პროფილი და განცხადებები MyCar.ge-ზე.', noindex: true }
    },
    {
        path: '**', component: ErorPage,
        data: { title: 'გვერდი ვერ მოიძებნა', description: 'მოთხოვნილი გვერდი არ არსებობს.', noindex: true }
    }
];