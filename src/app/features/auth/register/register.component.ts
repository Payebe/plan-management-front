// src/app/features/auth/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterDto } from '../../../core/services/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-center">Inscription</h2>
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Nom</label>
            <div class="mt-1 relative">
              <fa-icon [icon]="faUser" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></fa-icon>
              <input
                id="name"
                type="text"
                [(ngModel)]="registerDto.name"
                name="name"
                required
                class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-plant-green-500 focus:border-plant-green-500"
                placeholder="Entrez votre nom"
              />
            </div>
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <div class="mt-1 relative">
              <fa-icon [icon]="faEnvelope" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></fa-icon>
              <input
                id="email"
                type="email"
                [(ngModel)]="registerDto.email"
                name="email"
                required
                class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-plant-green-500 focus:border-plant-green-500"
                placeholder="Entrez votre email"
              />
            </div>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
            <div class="mt-1 relative">
              <fa-icon [icon]="faLock" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></fa-icon>
              <input
                id="password"
                type="password"
                [(ngModel)]="registerDto.password"
                name="password"
                required
                class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-plant-green-500 focus:border-plant-green-500"
                placeholder="Entrez votre mot de passe"
              />
            </div>
          </div>
          <div *ngIf="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</div>
          <div *ngIf="successMessage" class="text-green-600 text-sm">{{ successMessage }}</div>
          <button
            type="submit"
            [disabled]="isLoading"
            class="w-full bg-plant-green-600 text-white py-2 px-4 rounded-md hover:bg-plant-green-700 focus:outline-none focus:ring-2 focus:ring-plant-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {{ isLoading ? 'Inscription en cours...' : 'S'inscrire' }}
          </button>
        </form>
        <p class="mt-4 text-center text-sm text-gray-600">
          Déjà un compte ? <a href="/login" class="text-plant-green-600 hover:underline">Connectez-vous</a>
        </p>
      </div>
    </div>
  `,
  styles: [],
})
export class RegisterComponent {
  faUser = faUser;
  faEnvelope = faEnvelope;
  faLock = faLock;

  registerDto: RegisterDto = { email: '', password: '', name: '' };
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    if (!this.registerDto.email || !this.registerDto.password || !this.registerDto.name) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService.register(this.registerDto).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.data.accessToken) {
          this.authService.saveToken(response.data.accessToken);
          this.successMessage = 'Inscription réussie !';
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        } else {
          this.errorMessage = 'Inscription échouée : aucun token reçu.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || "Erreur lors de l'inscription.";
      },
    });
  }
}