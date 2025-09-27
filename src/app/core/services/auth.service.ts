// src/app/core/services/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Structure de la réponse du backend
export interface AuthResponse {
    statusCode: number;
    message: string;
    data: {
        user: { id: string; email: string; name?: string };
        accessToken: string | null;
    };
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    password: string;
    name: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    register(registerDto: RegisterDto): Observable<AuthResponse> {
        return this.http
            .post<any>(`${this.apiUrl}/register`, registerDto)
            .pipe(
                map((response) => {
                    // Normaliser la réponse imbriquée
                    const normalizedResponse: AuthResponse = {
                        statusCode: response.statusCode,
                        message: response.message,
                        data: response.data.data || response.data,
                    };
                    return normalizedResponse;
                }),
                catchError(this.handleError)
            );
    }

    login(loginDto: LoginDto): Observable<AuthResponse> {
        return this.http
            .post<any>(`${this.apiUrl}/login`, loginDto)
            .pipe(
                map((response) => {
                    // Normaliser la réponse imbriquée
                    const normalizedResponse: AuthResponse = {
                        statusCode: response.statusCode,
                        message: response.message,
                        data: response.data.data || response.data,
                    };
                    return normalizedResponse;
                }),
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Erreur : ${error.error.message}`;
        } else {
            errorMessage = error.error.message || errorMessage;
            if (error.status === 403 || error.error.message?.includes('confirm')) {
                errorMessage = 'Veuillez vérifier votre email pour confirmer votre compte.';
            }
        }
        return throwError(() => new Error(errorMessage));
    }

    saveToken(token: string): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('accessToken', token);
        }
    }

    getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem('accessToken');
        }
        return null;
    }

    clearToken(): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('accessToken');
        }
    }
}