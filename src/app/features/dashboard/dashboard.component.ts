import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLeaf, faSeedling, faDroplet, faTriangleExclamation, faBell, faRocket, faPlus, faMobileScreenButton, faChartBar, faArrowUp, faArrowDown, faCalendarCheck, faClock, faHeart } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="space-y-8">
      <!-- Header avec greeting personnalisé -->
      <div class="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-2xl shadow-xl">
        <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div class="relative p-8 lg:p-12">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-4xl lg:text-5xl font-bold text-white mb-3">
                {{ getGreeting() }} ! 👋
              </h1>
              <p class="text-emerald-100 text-lg lg:text-xl font-medium mb-2">
                Vos plantes vous attendent
              </p>
              <p class="text-emerald-200 text-sm">
                {{ getCurrentDate() }}
              </p>
            </div>
            <div class="hidden lg:block">
              <div class="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <fa-icon [icon]="faLeaf" class="text-6xl text-white"></fa-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques principales -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Plantes saines</p>
              <p class="text-3xl font-bold text-gray-900">12</p>
              <div class="flex items-center mt-2">
                <fa-icon [icon]="faArrowUp" class="text-xs text-green-500 mr-1"></fa-icon>
                <span class="text-xs text-green-500 font-medium">+2 cette semaine</span>
              </div>
            </div>
            <div class="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <fa-icon [icon]="faSeedling" class="text-2xl text-emerald-600"></fa-icon>
            </div>
          </div>
        </div>

        <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-amber-200 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">À arroser bientôt</p>
              <p class="text-3xl font-bold text-gray-900">3</p>
              <div class="flex items-center mt-2">
                <fa-icon [icon]="faClock" class="text-xs text-amber-500 mr-1"></fa-icon>
                <span class="text-xs text-amber-500 font-medium">Dans 24h</span>
              </div>
            </div>
            <div class="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <fa-icon [icon]="faDroplet" class="text-2xl text-amber-600"></fa-icon>
            </div>
          </div>
        </div>

        <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-red-200 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Attention requise</p>
              <p class="text-3xl font-bold text-gray-900">1</p>
              <div class="flex items-center mt-2">
                <fa-icon [icon]="faTriangleExclamation" class="text-xs text-red-500 mr-1"></fa-icon>
                <span class="text-xs text-red-500 font-medium">Action urgente</span>
              </div>
            </div>
            <div class="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <fa-icon [icon]="faBell" class="text-2xl text-red-600"></fa-icon>
            </div>
          </div>
        </div>

        <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Collection totale</p>
              <p class="text-3xl font-bold text-gray-900">16</p>
              <div class="flex items-center mt-2">
                <fa-icon [icon]="faHeart" class="text-xs text-blue-500 mr-1"></fa-icon>
                <span class="text-xs text-blue-500 font-medium">Bien entretenue</span>
              </div>
            </div>
            <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <fa-icon [icon]="faChartBar" class="text-2xl text-blue-600"></fa-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Section principale avec deux colonnes -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Plantes nécessitant attention (2/3) -->
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div class="p-6 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900 flex items-center">
                <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <fa-icon [icon]="faBell" class="text-red-600"></fa-icon>
                </div>
                Attention requise
              </h2>
              <span class="text-sm text-gray-500">{{ getPlantsNeedingAttention().length }} plante(s)</span>
            </div>
          </div>
          
          <div class="p-6">
            <div class="space-y-4">
              <div *ngFor="let plant of getPlantsNeedingAttention(); trackBy: trackByPlantId" 
                   class="group flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                   [ngClass]="{
                     'bg-red-50 border-red-200': plant.priority === 'urgent',
                     'bg-amber-50 border-amber-200': plant.priority === 'soon',
                     'bg-blue-50 border-blue-200': plant.priority === 'scheduled'
                   }">
                <div class="flex items-center space-x-4">
                  <div class="relative">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                         [ngClass]="{
                           'bg-red-100': plant.priority === 'urgent',
                           'bg-amber-100': plant.priority === 'soon',
                           'bg-blue-100': plant.priority === 'scheduled'
                         }">
                      <fa-icon [icon]="faLeaf" 
                               [ngClass]="{
                                 'text-red-600': plant.priority === 'urgent',
                                 'text-amber-600': plant.priority === 'soon',
                                 'text-blue-600': plant.priority === 'scheduled'
                               }" 
                               class="text-xl"></fa-icon>
                    </div>
                    <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full"
                         [ngClass]="{
                           'bg-red-500': plant.priority === 'urgent',
                           'bg-amber-500': plant.priority === 'soon',
                           'bg-blue-500': plant.priority === 'scheduled'
                         }"></div>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ plant.name }}</h3>
                    <p class="text-sm"
                       [ngClass]="{
                         'text-red-600': plant.priority === 'urgent',
                         'text-amber-600': plant.priority === 'soon',
                         'text-blue-600': plant.priority === 'scheduled'
                       }">{{ plant.status }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ plant.location }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
                          [ngClass]="{
                            'bg-red-600 text-white hover:bg-red-700': plant.priority === 'urgent',
                            'bg-amber-600 text-white hover:bg-amber-700': plant.priority === 'soon',
                            'bg-blue-600 text-white hover:bg-blue-700': plant.priority === 'scheduled'
                          }">
                    {{ plant.action }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel latéral (1/3) -->
        <div class="space-y-6">
          <!-- Actions rapides -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                <fa-icon [icon]="faRocket" class="text-emerald-600"></fa-icon>
              </div>
              Actions rapides
            </h2>
            <div class="space-y-3">
              <button class="w-full group flex items-center justify-center px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md">
                <fa-icon [icon]="faPlus" class="mr-3 group-hover:rotate-90 transition-transform"></fa-icon>
                <span class="font-medium">Ajouter une plante</span>
              </button>
              <button class="w-full group flex items-center justify-center px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 hover:scale-[1.02]">
                <fa-icon [icon]="faMobileScreenButton" class="mr-3 group-hover:scale-110 transition-transform"></fa-icon>
                <span class="font-medium">Scanner QR code</span>
              </button>
            </div>
          </div>

          <!-- Statistiques hebdomadaires -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <fa-icon [icon]="faCalendarCheck" class="text-blue-600"></fa-icon>
              </div>
              Cette semaine
            </h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                    <fa-icon [icon]="faDroplet" class="text-emerald-600"></fa-icon>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">Arrosages</p>
                    <p class="text-sm text-gray-500">Effectués</p>
                  </div>
                </div>
                <span class="text-2xl font-bold text-emerald-600">8</span>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <fa-icon [icon]="faPlus" class="text-blue-600"></fa-icon>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">Nouvelles</p>
                    <p class="text-sm text-gray-500">Ajoutées</p>
                  </div>
                </div>
                <span class="text-2xl font-bold text-blue-600">2</span>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <fa-icon [icon]="faHeart" class="text-green-600"></fa-icon>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">Problèmes</p>
                    <p class="text-sm text-gray-500">Résolus</p>
                  </div>
                </div>
                <span class="text-2xl font-bold text-green-600">3</span>
              </div>
            </div>
          </div>

          <!-- Conseil du jour -->
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <fa-icon [icon]="faLeaf" class="text-purple-600"></fa-icon>
              </div>
              💡 Conseil du jour
            </h2>
            <p class="text-gray-700 text-sm leading-relaxed">
              Les plantes d'intérieur apprécient une légère brumisation sur leurs feuilles, surtout en hiver quand l'air est plus sec. Évitez cependant les plantes à feuilles velues comme les violettes africaines !
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .space-y-8 > * + * { margin-top: 2rem; }
      .space-y-6 > * + * { margin-top: 1.5rem; }
      .space-y-4 > * + * { margin-top: 1rem; }
      .space-y-3 > * + * { margin-top: 0.75rem; }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .group:hover .group-hover\\:scale-105 {
        animation: fadeIn 0.3s ease-out;
      }
    `,
  ],
})
export class DashboardComponent {
  faLeaf = faLeaf;
  faSeedling = faSeedling;
  faDroplet = faDroplet;
  faTriangleExclamation = faTriangleExclamation;
  faBell = faBell;
  faRocket = faRocket;
  faPlus = faPlus;
  faMobileScreenButton = faMobileScreenButton;
  faChartBar = faChartBar;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faCalendarCheck = faCalendarCheck;
  faClock = faClock;
  faHeart = faHeart;

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getPlantsNeedingAttention() {
    return [
      {
        id: 1,
        name: 'Rose du salon',
        status: 'En retard d\'arrosage (2 jours)',
        location: 'Salon, près de la fenêtre',
        priority: 'urgent',
        action: 'Arroser maintenant'
      },
      {
        id: 2,
        name: 'Cactus de bureau',
        status: 'À arroser dans 1 jour',
        location: 'Bureau, étagère droite',
        priority: 'soon',
        action: 'Programmer'
      },
      {
        id: 3,
        name: 'Tournesol terrasse',
        status: 'À arroser dans 2 jours',
        location: 'Terrasse, bac n°3',
        priority: 'scheduled',
        action: 'Planifier'
      }
    ];
  }

  trackByPlantId(index: number, plant: any): number {
    return plant.id;
  }
}