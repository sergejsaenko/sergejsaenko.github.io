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
    {
        path: 'servers',
        loadComponent() {
            return import('./features/servers/core/src/index').then(m => m.Servers);
        },
    },
];
