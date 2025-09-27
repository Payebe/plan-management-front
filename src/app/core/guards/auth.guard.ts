// src/app/core/guards/auth.guard.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    canActivate(): Observable<boolean> {
        if (!isPlatformBrowser(this.platformId)) {
            return of(true);
        }

        const token = this.authService.getToken();
        if (token) {
            return of(true);
        } else {
            this.router.navigate(['/login']);
            return of(false);
        }
    }
}