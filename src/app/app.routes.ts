import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

// Définition des routes principales de l'application
export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./layout/main-layout/main-layout.component').then(
                (m) => m.MainLayoutComponent
            ),
        canActivate: [AuthGuard], // Protège toutes les routes enfants avec AuthGuard
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full', // Redirige vers /dashboard par défaut
            },
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./features/dashboard/dashboard.component').then(
                        (m) => m.DashboardComponent
                    ),
            },
            {
                path: 'plants',
                loadComponent: () =>
                    import('./features/plants/plants.component').then(
                        (m) => m.PlantsComponent
                    ),
            },
            {
                path: 'watering-schedule',
                loadComponent: () =>
                    import('./features/watering-schedule/watering-schedule.component').then(
                        (m) => m.WateringScheduleComponent
                    ),
            },
            {
                path: 'care-logs',
                loadComponent: () =>
                    import('./features/care-logs/care-logs.component').then(
                        (m) => m.CareLogsComponent
                    ),
            },
            {
                path: 'notifications',
                loadComponent: () =>
                    import('./features/notifications/notifications.component').then(
                        (m) => m.NotificationsComponent
                    ),
            },
            {
                path: 'profile',
                loadComponent: () =>
                    import('./features/profile/profile.component').then(
                        (m) => m.ProfileComponent
                    ),
            },
        ],
    },
    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/login/login.component').then(
                (m) => m.LoginComponent
            ),
    },
    {
        path: 'register',
        loadComponent: () =>
            import('./features/auth/register/register.component').then(
                (m) => m.RegisterComponent
            ),
    },
    {
        path: '**',
        redirectTo: 'login', // Redirection vers la page de connexion pour les routes inconnues
        pathMatch: 'full',
    },
];