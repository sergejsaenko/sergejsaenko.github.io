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
        path: 'login',
        loadComponent() {
            return import('./features/auth/core/src/index').then(m => m.Login);
        },
    },
];
