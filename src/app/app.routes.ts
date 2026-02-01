import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent() {
            return import('./features/home/core/src/index').then(m => m.Home);
        },
    },
    {
        path: 'about',
        loadComponent() {
            return import('./features/about/core/src/index').then(m => m.About);
        },
    },
];
