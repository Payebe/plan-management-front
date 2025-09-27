import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinDate: Date;
  preferences: {
    notifications: {
      watering: boolean;
      care: boolean;
      weather: boolean;
      newsletter: boolean;
    };
    units: 'metric' | 'imperial';
    language: 'fr' | 'en' | 'es';
    theme: 'light' | 'dark' | 'auto';
    privacy: 'public' | 'private';
  };
  stats: {
    totalPlants: number;
    careTasksCompleted: number;
    daysActive: number;
    plantsAdded: number;
  };
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div class="max-w-5xl mx-auto px-4 py-8">
        
        <!-- Header avec Avatar moderne -->
        <div class="relative mb-8">
          <div class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <!-- Background décoratif -->
            <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10"></div>
            
            <div class="relative p-8">
              <div class="flex flex-col lg:flex-row items-center gap-8">
                
                <!-- Avatar Section modernisé -->
                <div class="relative group">
                  <div class="relative">
                    <!-- Avatar principal -->
                    <div class="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-500 p-1 shadow-2xl">
                      <div class="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                        @if (userProfile().avatar) {
                          <img [src]="userProfile().avatar" [alt]="userProfile().firstName" 
                               class="w-full h-full object-cover">
                        } @else {
                          <span class="text-2xl font-bold bg-gradient-to-br from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                            {{ getInitials() }}
                          </span>
                        }
                      </div>
                    </div>
                    
                    <!-- Status indicator -->
                    <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm animate-pulse"></div>
                  </div>
                  
                  <!-- Upload Button modernisé -->
                  <button 
                    class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full bg-white hover:bg-gray-50 text-gray-700 rounded-full p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 border border-gray-200"
                    (click)="fileInput.click()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                  </button>
                  
                  <input #fileInput type="file" accept="image/*" (change)="onAvatarChange($event)" class="hidden">
                </div>
                
                <!-- Informations utilisateur -->
                <div class="flex-1 text-center lg:text-left">
                  <h1 class="text-3xl font-bold text-gray-900 mb-2">
                    {{ userProfile().firstName }} {{ userProfile().lastName }}
                  </h1>
                  <p class="text-gray-600 mb-3 max-w-md">
                    {{ userProfile().bio || 'Passionné de plantes et de jardinage 🌱' }}
                  </p>
                  <div class="flex items-center justify-center lg:justify-start gap-2 text-sm text-gray-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4V7a2 2 0 012-2h4a2 2 0 012 2v4m-6 10h4a8.013 8.013 0 007.843-6.43c.12-.83.13-1.67-.006-2.5L17 12H7l-.837 5.57c-.135.83-.127 1.67.006 2.5A8.013 8.013 0 0013 22z"/>
                    </svg>
                    <span>Membre depuis {{ formatDate(userProfile().joinDate) }}</span>
                  </div>
                </div>
                
                <!-- Stats modernisées -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div class="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                    <div class="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <span class="text-2xl">🌿</span>
                    </div>
                    <div class="text-2xl font-bold text-emerald-600">{{ userProfile().stats.totalPlants }}</div>
                    <div class="text-xs text-gray-600 font-medium">Plantes</div>
                  </div>
                  
                  <div class="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <span class="text-2xl">💧</span>
                    </div>
                    <div class="text-2xl font-bold text-blue-600">{{ userProfile().stats.careTasksCompleted }}</div>
                    <div class="text-xs text-gray-600 font-medium">Soins</div>
                  </div>
                  
                  <div class="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                    <div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <span class="text-2xl">📅</span>
                    </div>
                    <div class="text-2xl font-bold text-purple-600">{{ userProfile().stats.daysActive }}</div>
                    <div class="text-xs text-gray-600 font-medium">Jours actifs</div>
                  </div>
                  
                  <div class="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                    <div class="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <span class="text-2xl">➕</span>
                    </div>
                    <div class="text-2xl font-bold text-orange-600">{{ userProfile().stats.plantsAdded }}</div>
                    <div class="text-xs text-gray-600 font-medium">Ajoutées</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs moderne -->
        <div class="mb-8">
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-2">
            <nav class="flex space-x-2" aria-label="Tabs">
              @for (tab of tabs; track tab.id) {
                <button
                  (click)="activeTab.set(tab.id)"
                  [class]="activeTab() === tab.id 
                    ? 'bg-white text-emerald-600 shadow-md border border-emerald-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'"
                  class="flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200">
                  <span [innerHTML]="tab.icon" class="w-5 h-5"></span>
                  <span class="hidden sm:inline">{{ tab.label }}</span>
                </button>
              }
            </nav>
          </div>
        </div>

        <!-- Contenu des Tabs -->
        <div class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div class="p-8">
            
            <!-- Profil Tab -->
            @if (activeTab() === 'profile') {
              <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="space-y-8">
                
                <div class="space-y-2 mb-8">
                  <h2 class="text-2xl font-bold text-gray-900">Informations personnelles</h2>
                  <p class="text-gray-600">Gérez vos informations de profil et vos préférences.</p>
                </div>

                <!-- Champs du profil avec design moderne -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">Prénom *</label>
                    <input
                      type="text"
                      formControlName="firstName"
                      class="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm">
                    @if (profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched) {
                      <p class="text-sm text-red-500 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        Le prénom est requis
                      </p>
                    }
                  </div>

                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">Nom *</label>
                    <input
                      type="text"
                      formControlName="lastName"
                      class="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm">
                    @if (profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched) {
                      <p class="text-sm text-red-500 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        Le nom est requis
                      </p>
                    }
                  </div>

                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">Email *</label>
                    <input
                      type="email"
                      formControlName="email"
                      class="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm">
                  </div>

                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">Localisation</label>
                    <input
                      type="text"
                      formControlName="location"
                      placeholder="Ville, Pays"
                      class="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm">
                  </div>
                </div>

                <!-- Bio -->
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700">À propos de vous</label>
                  <textarea
                    formControlName="bio"
                    rows="4"
                    placeholder="Parlez-nous de votre passion pour les plantes..."
                    class="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm resize-none">
                  </textarea>
                  <div class="flex justify-between items-center">
                    <p class="text-sm text-gray-500">{{ getBioLength() }}/500 caractères</p>
                    <div class="w-32 bg-gray-200 rounded-full h-1.5">
                      <div class="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" 
                           [style.width.%]="(getBioLength() / 500) * 100"></div>
                    </div>
                  </div>
                </div>

                <!-- Boutons d'action -->
                <div class="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    (click)="resetProfileForm()"
                    class="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium">
                    Annuler
                  </button>
                  <button
                    type="submit"
                    [disabled]="profileForm.invalid || isLoading()"
                    class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl transition-all duration-200 font-medium flex items-center gap-2 min-w-[120px] justify-center">
                    @if (isLoading()) {
                      <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    } @else {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    }
                    Sauvegarder
                  </button>
                </div>
              </form>
            }

            <!-- Préférences Tab -->
            @if (activeTab() === 'preferences') {
              <form [formGroup]="preferencesForm" (ngSubmit)="updatePreferences()" class="space-y-8">
                
                <div class="space-y-2 mb-8">
                  <h2 class="text-2xl font-bold text-gray-900">Préférences</h2>
                  <p class="text-gray-600">Personnalisez votre expérience selon vos besoins.</p>
                </div>
                
                <!-- Notifications -->
                <div class="space-y-6">
                  <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span class="text-xl">🔔</span>
                    Notifications
                  </h3>
                  <div class="space-y-4">
                    @for (notif of notificationTypes; track notif.key) {
                      <div class="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-gray-100">
                        <div class="flex-1">
                          <label class="text-sm font-medium text-gray-900 cursor-pointer">
                            {{ notif.label }}
                          </label>
                          <p class="text-sm text-gray-500 mt-1">{{ notif.description }}</p>
                        </div>
                        <!-- Toggle Switch moderne -->
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            [formControlName]="'notifications.' + notif.key"
                            class="sr-only peer">
                          <div class="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                        </label>
                      </div>
                    }
                  </div>
                </div>

                <!-- Unités -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span class="text-xl">📏</span>
                    Unités de mesure
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @for (unit of units; track unit.value) {
                      <label class="relative cursor-pointer">
                        <input
                          type="radio"
                          [value]="unit.value"
                          formControlName="units"
                          class="sr-only peer">
                        <div class="p-4 bg-white/60 border-2 border-gray-200 rounded-2xl peer-checked:border-emerald-500 peer-checked:bg-emerald-50/80 transition-all duration-200">
                          <div class="flex items-center justify-between">
                            <div>
                              <span class="text-sm font-medium text-gray-900">{{ unit.label }}</span>
                              <p class="text-sm text-gray-500">{{ unit.description }}</p>
                            </div>
                            <div class="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-emerald-500 peer-checked:bg-emerald-500 flex items-center justify-center">
                              <div class="w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100"></div>
                            </div>
                          </div>
                        </div>
                      </label>
                    }
                  </div>
                </div>

                <!-- Langue et Thème -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <!-- Langue -->
                  <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span class="text-xl">🌍</span>
                      Langue
                    </h3>
                    <select
                      formControlName="language"
                      class="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
                      @for (lang of languages; track lang.value) {
                        <option [value]="lang.value">{{ lang.label }}</option>
                      }
                    </select>
                  </div>

                  <!-- Thème -->
                  <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span class="text-xl">🎨</span>
                      Thème
                    </h3>
                    <select
                      formControlName="theme"
                      class="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
                      <option value="light">Clair</option>
                      <option value="dark">Sombre</option>
                      <option value="auto">Automatique</option>
                    </select>
                  </div>
                </div>

                <!-- Confidentialité -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span class="text-xl">🔒</span>
                    Confidentialité
                  </h3>
                  <div class="space-y-3">
                    @for (privacy of privacyOptions; track privacy.value) {
                      <label class="relative cursor-pointer">
                        <input
                          type="radio"
                          [value]="privacy.value"
                          formControlName="privacy"
                          class="sr-only peer">
                        <div class="p-4 bg-white/60 border-2 border-gray-200 rounded-2xl peer-checked:border-emerald-500 peer-checked:bg-emerald-50/80 transition-all duration-200">
                          <div class="flex items-start gap-3">
                            <div class="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-emerald-500 peer-checked:bg-emerald-500 flex items-center justify-center mt-0.5">
                              <div class="w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100"></div>
                            </div>
                            <div>
                              <span class="text-sm font-medium text-gray-900">{{ privacy.label }}</span>
                              <p class="text-sm text-gray-500 mt-1">{{ privacy.description }}</p>
                            </div>
                          </div>
                        </div>
                      </label>
                    }
                  </div>
                </div>

                <!-- Boutons -->
                <div class="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    (click)="resetPreferencesForm()"
                    class="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium">
                    Annuler
                  </button>
                  <button
                    type="submit"
                    [disabled]="preferencesForm.invalid || isLoading()"
                    class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl transition-all duration-200 font-medium flex items-center gap-2 min-w-[120px] justify-center">
                    @if (isLoading()) {
                      <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    } @else {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    }
                    Sauvegarder
                  </button>
                </div>
              </form>
            }

            <!-- Sécurité Tab -->
            @if (activeTab() === 'security') {
              <div class="space-y-8">
                
                <div class="space-y-2 mb-8">
                  <h2 class="text-2xl font-bold text-gray-900">Sécurité</h2>
                  <p class="text-gray-600">Gérez la sécurité de votre compte et vos sessions actives.</p>
                </div>

                <!-- Changement mot de passe -->
                <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-6">
                  <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span class="text-xl">🔑</span>
                    Changer le mot de passe
                  </h3>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Mot de passe actuel -->
                    <div class="space-y-2">
                      <label class="block text-sm font-semibold text-gray-700">Mot de passe actuel *</label>
                      <div class="relative">
                        <input
                          [type]="showCurrentPassword() ? 'text' : 'password'"
                          formControlName="currentPassword"
                          class="w-full px-4 py-3 pr-12 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
                        <button
                          type="button"
                          (click)="showCurrentPassword.set(!showCurrentPassword())"
                          class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                          @if (showCurrentPassword()) {
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                          } @else {
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m-3.122-3.122L12 12m0 0l3.878 3.878M12 12l3.878-3.878m-7.756 0L12 12m0 0L3.122 3.122"/>
                            </svg>
                          }
                        </button>
                      </div>
                    </div>

                    <!-- Nouveau mot de passe -->
                    <div class="space-y-2">
                      <label class="block text-sm font-semibold text-gray-700">Nouveau mot de passe *</label>
                      <div class="relative">
                        <input
                          [type]="showNewPassword() ? 'text' : 'password'"
                          formControlName="newPassword"
                          class="w-full px-4 py-3 pr-12 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
                        <button
                          type="button"
                          (click)="showNewPassword.set(!showNewPassword())"
                          class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                          @if (showNewPassword()) {
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                          } @else {
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m-3.122-3.122L12 12m0 0l3.878 3.878M12 12l3.878-3.878m-7.756 0L12 12m0 0L3.122 3.122"/>
                            </svg>
                          }
                        </button>
                      </div>
                      
                      <!-- Indicateur de force du mot de passe -->
                      @if (passwordForm.get('newPassword')?.value) {
                        <div class="space-y-2">
                          <div class="flex justify-between text-xs">
                            <span class="text-gray-500">Force du mot de passe</span>
                            <span [class]="getPasswordStrengthColor()">{{ getPasswordStrengthText() }}</span>
                          </div>
                          <div class="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              [class]="getPasswordStrengthColor().replace('text-', 'bg-').split(' ')[0]"
                              class="h-2 rounded-full transition-all duration-300"
                              [style.width.%]="getPasswordStrengthPercentage()">
                            </div>
                          </div>
                        </div>
                      }
                    </div>

                    <!-- Confirmer mot de passe -->
                    <div class="space-y-2 md:col-span-2">
                      <label class="block text-sm font-semibold text-gray-700">Confirmer le nouveau mot de passe *</label>
                      <input
                        type="password"
                        formControlName="confirmPassword"
                        class="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
                      @if (passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched) {
                        <p class="text-sm text-red-500 flex items-center gap-2">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                          </svg>
                          Les mots de passe ne correspondent pas
                        </p>
                      }
                    </div>
                  </div>

                  <div class="flex justify-end gap-4">
                    <button
                      type="button"
                      (click)="resetPasswordForm()"
                      class="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium">
                      Annuler
                    </button>
                    <button
                      type="submit"
                      [disabled]="passwordForm.invalid || isLoading()"
                      class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl transition-all duration-200 font-medium">
                      Changer le mot de passe
                    </button>
                  </div>
                </form>

                <!-- Sessions actives -->
                <div class="space-y-6">
                  <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span class="text-xl">📱</span>
                    Sessions actives
                  </h3>
                  <div class="space-y-3">
                    @for (session of activeSessions; track session.id) {
                      <div class="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-gray-100">
                        <div class="flex items-center gap-4">
                          <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                          </div>
                          <div>
                            <div class="font-medium text-gray-900">{{ session.device }}</div>
                            <p class="text-sm text-gray-500">{{ session.location }} • {{ session.lastActive }}</p>
                          </div>
                        </div>
                        <div class="flex items-center gap-3">
                          @if (session.current) {
                            <span class="px-3 py-1.5 text-xs bg-emerald-100 text-emerald-700 rounded-full font-medium">Session actuelle</span>
                          } @else {
                            <button 
                              (click)="revokeSession(session.id)"
                              class="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-medium transition-all duration-200">
                              Révoquer
                            </button>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Zone danger -->
                <div class="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
                  <div class="flex items-start gap-3 mb-4">
                    <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-red-800 mb-2">Zone de danger</h3>
                      <p class="text-sm text-red-600 mb-4">
                        Ces actions sont irréversibles. Procédez avec prudence.
                      </p>
                    </div>
                  </div>
                  
                  <div class="flex flex-col sm:flex-row gap-3">
                    <button 
                      (click)="exportData()"
                      class="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition-all duration-200">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      Exporter mes données
                    </button>
                    <button 
                      (click)="deleteAccount()"
                      class="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Messages de notification -->
    @if (showSuccessMessage()) {
      <div class="fixed bottom-6 right-6 bg-white border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 backdrop-blur-sm bg-emerald-50/90 animate-slide-up">
        <div class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <span class="font-medium">{{ successMessage() }}</span>
      </div>
    }

    @if (showErrorMessage()) {
      <div class="fixed bottom-6 right-6 bg-white border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 backdrop-blur-sm bg-red-50/90 animate-slide-up">
        <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <span class="font-medium">{{ errorMessage() }}</span>
      </div>
    }
  `,
  styles: [`
    @keyframes slide-up {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    .animate-slide-up {
      animation: slide-up 0.3s ease-out;
    }
    
    .peer:checked ~ .peer-checked\\:after\\:translate-x-full::after {
      transform: translateX(100%);
    }
  `]
})
export class ProfileComponent implements OnInit {
  // Signals
  activeTab = signal<'profile' | 'preferences' | 'security'>('profile');
  isLoading = signal<boolean>(false);
  showSuccessMessage = signal<boolean>(false);
  showErrorMessage = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');
  showCurrentPassword = signal<boolean>(false);
  showNewPassword = signal<boolean>(false);

  // Forms
  profileForm!: FormGroup;
  preferencesForm!: FormGroup;
  passwordForm!: FormGroup;

  // Mock user profile
  userProfile = signal<UserProfile>({
    id: '1',
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie.dupont@email.com',
    avatar: '',
    bio: 'Passionnée de plantes depuis plus de 10 ans. J\'adore prendre soin de mes plantes vertes et découvrir de nouvelles espèces.',
    location: 'Paris, France',
    joinDate: new Date(2023, 0, 15),
    preferences: {
      notifications: {
        watering: true,
        care: true,
        weather: false,
        newsletter: true
      },
      units: 'metric',
      language: 'fr',
      theme: 'light',
      privacy: 'public'
    },
    stats: {
      totalPlants: 24,
      careTasksCompleted: 156,
      daysActive: 89,
      plantsAdded: 8
    }
  });

  // Data
  tabs: Array<{ id: 'profile' | 'preferences' | 'security', label: string, icon: string }> = [
    {
      id: 'profile' as const,
      label: 'Profil',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>`
    },
    {
      id: 'preferences' as const,
      label: 'Préférences',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>`
    },
    {
      id: 'security' as const,
      label: 'Sécurité',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>`
    }
  ];

  notificationTypes = [
    {
      key: 'watering',
      label: 'Rappels d\'arrosage',
      description: 'Recevoir des notifications pour arroser vos plantes'
    },
    {
      key: 'care',
      label: 'Soins des plantes',
      description: 'Rappels pour fertiliser, rempoter, tailler vos plantes'
    },
    {
      key: 'weather',
      label: 'Alertes météo',
      description: 'Notifications en cas de conditions météo extrêmes'
    },
    {
      key: 'newsletter',
      label: 'Newsletter',
      description: 'Conseils de jardinage et nouveautés via email'
    }
  ];

  units = [
    {
      value: 'metric',
      label: 'Métrique',
      description: 'Celsius, centimètres, litres'
    },
    {
      value: 'imperial',
      label: 'Impérial',
      description: 'Fahrenheit, pouces, gallons'
    }
  ];

  languages = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' }
  ];

  privacyOptions = [
    {
      value: 'public',
      label: 'Public',
      description: 'Votre profil et vos plantes sont visibles par tous'
    },
    {
      value: 'private',
      label: 'Privé',
      description: 'Seul vous pouvez voir votre profil et vos plantes'
    }
  ];

  activeSessions = [
    {
      id: '1',
      device: 'Chrome sur Windows',
      location: 'Paris, France',
      lastActive: 'Session actuelle',
      current: true
    },
    {
      id: '2',
      device: 'Safari sur iPhone',
      location: 'Paris, France',
      lastActive: 'Il y a 2 heures',
      current: false
    },
    {
      id: '3',
      device: 'Firefox sur MacBook',
      location: 'Lyon, France',
      lastActive: 'Il y a 3 jours',
      current: false
    }
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.initializeForms();
  }

  initializeForms() {
    const profile = this.userProfile();

    // Profile form
    this.profileForm = this.fb.group({
      firstName: [profile.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [profile.lastName, [Validators.required, Validators.minLength(2)]],
      email: [profile.email, [Validators.required, Validators.email]],
      location: [profile.location],
      bio: [profile.bio, [Validators.maxLength(500)]]
    });

    // Preferences form
    this.preferencesForm = this.fb.group({
      'notifications.watering': [profile.preferences.notifications.watering],
      'notifications.care': [profile.preferences.notifications.care],
      'notifications.weather': [profile.preferences.notifications.weather],
      'notifications.newsletter': [profile.preferences.notifications.newsletter],
      units: [profile.preferences.units],
      language: [profile.preferences.language],
      theme: [profile.preferences.theme],
      privacy: [profile.preferences.privacy]
    });

    // Password form
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    return newPassword && confirmPassword && newPassword.value === confirmPassword.value
      ? null : { mismatch: true };
  }

  // Utility methods
  getInitials(): string {
    const profile = this.userProfile();
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  }

  getBioLength(): number {
    return this.profileForm.get('bio')?.value?.length || 0;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long'
    });
  }

  showSuccess(message: string) {
    this.successMessage.set(message);
    this.showSuccessMessage.set(true);
    setTimeout(() => {
      this.showSuccessMessage.set(false);
    }, 3000);
  }

  showError(message: string) {
    this.errorMessage.set(message);
    this.showErrorMessage.set(true);
    setTimeout(() => {
      this.showErrorMessage.set(false);
    }, 3000);
  }

  resetProfileForm() {
    const profile = this.userProfile();
    this.profileForm.patchValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      location: profile.location,
      bio: profile.bio
    });
  }

  resetPreferencesForm() {
    const profile = this.userProfile();
    this.preferencesForm.patchValue({
      'notifications.watering': profile.preferences.notifications.watering,
      'notifications.care': profile.preferences.notifications.care,
      'notifications.weather': profile.preferences.notifications.weather,
      'notifications.newsletter': profile.preferences.notifications.newsletter,
      units: profile.preferences.units,
      language: profile.preferences.language,
      theme: profile.preferences.theme,
      privacy: profile.preferences.privacy
    });
  }

  getPasswordStrengthPercentage(): number {
    const password = this.passwordForm.get('newPassword')?.value || '';
    let strength = 0;

    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;

    return strength;
  }

  getPasswordStrengthText(): string {
    const percentage = this.getPasswordStrengthPercentage();
    if (percentage < 50) return 'Faible';
    if (percentage < 75) return 'Moyen';
    return 'Fort';
  }

  getPasswordStrengthColor(): string {
    const percentage = this.getPasswordStrengthPercentage();
    if (percentage < 50) return 'bg-red-500 text-red-600';
    if (percentage < 75) return 'bg-yellow-500 text-yellow-600';
    return 'bg-green-500 text-green-600';
  }

  // Actions
  onAvatarChange(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.userProfile.update(profile => ({
          ...profile,
          avatar: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile() {
    if (this.profileForm.valid) {
      this.isLoading.set(true);

      // Simulation API call
      setTimeout(() => {
        const formData = this.profileForm.value;
        this.userProfile.update(profile => ({
          ...profile,
          ...formData
        }));

        this.showSuccess('Profil mis à jour avec succès');
        this.isLoading.set(false);
      }, 1000);
    }
  }

  updatePreferences() {
    if (this.preferencesForm.valid) {
      this.isLoading.set(true);

      // Simulation API call  
      setTimeout(() => {
        const formData = this.preferencesForm.value;
        this.userProfile.update(profile => ({
          ...profile,
          preferences: {
            notifications: {
              watering: formData['notifications.watering'],
              care: formData['notifications.care'],
              weather: formData['notifications.weather'],
              newsletter: formData['notifications.newsletter']
            },
            units: formData.units,
            language: formData.language,
            theme: formData.theme,
            privacy: formData.privacy
          }
        }));

        this.showSuccess('Préférences mises à jour avec succès');
        this.isLoading.set(false);
      }, 1000);
    }
  }

  changePassword() {
    if (this.passwordForm.valid) {
      this.isLoading.set(true);

      // Simulation API call
      setTimeout(() => {
        this.showSuccess('Mot de passe modifié avec succès');
        this.passwordForm.reset();
        this.isLoading.set(false);
      }, 1000);
    }
  }

  resetPasswordForm() {
    this.passwordForm.reset();
    this.showCurrentPassword.set(false);
    this.showNewPassword.set(false);
  }

  revokeSession(sessionId: string) {
    // Simulation API call
    this.activeSessions = this.activeSessions.filter(s => s.id !== sessionId);
    this.showSuccess('Session révoquée avec succès');
  }

  exportData() {
    // Simulation export
    this.showSuccess('Export de données en cours...');

    setTimeout(() => {
      const dataStr = JSON.stringify(this.userProfile(), null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = 'mes-donnees-plantes.json';
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      this.showSuccess('Données exportées avec succès');
    }, 2000);
  }

  deleteAccount() {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      if (confirm('Confirmez-vous la suppression définitive de votre compte et de toutes vos données ?')) {
        this.showSuccess('Suppression du compte en cours...');
        // TODO: Redirection vers page de confirmation
      }
    }
  }
}
