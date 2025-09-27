import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent() {
            return import('./home/home').then(m => m.Home);
        },
    },
    {
        path: 'about',
        loadComponent() {
            return import('./components/about/about').then(m => m.About);
        },
    },
];
