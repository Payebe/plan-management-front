import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AddPlantModalComponent } from "../../shared/components/add-plant-modal/add-plant-modal.component";

interface Plant {
  id: string;
  name: string;
  species: string;
  lastWatered: Date;
  nextWatering: Date;
  location: string;
  healthStatus: 'excellent' | 'good' | 'needs-attention' | 'poor';
  image: string;
}

@Component({
  selector: 'app-plants',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AddPlantModalComponent],
  template: `
    <div class="space-y-8">
      <!-- Header Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-sm">
              <span class="text-3xl">🌿</span>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Ma Collection</h1>
              <p class="text-gray-600">Gérez et surveillez vos {{ plants().length }} plantes en toute simplicité</p>
            </div>
          </div>
          <button 
            class="group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 shadow-sm hover:shadow-md hover:scale-[1.02] font-medium"
            (click)="openAddPlantModal()">
            <svg class="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Ajouter une plante
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Collection totale</p>
              <p class="text-3xl font-bold text-gray-900">{{ plants().length }}</p>
              <p class="text-xs text-emerald-600 font-medium mt-2">🏆 Votre jardin grandit</p>
            </div>
            <div class="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="text-2xl">🌱</span>
            </div>
          </div>
        </div>

        <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">À arroser</p>
              <p class="text-3xl font-bold text-gray-900">{{ plantsNeedingWater().length }}</p>
              <p class="text-xs text-blue-600 font-medium mt-2">💧 Action nécessaire</p>
            </div>
            <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="text-2xl">💧</span>
            </div>
          </div>
        </div>

        <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-amber-200 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Attention requise</p>
              <p class="text-3xl font-bold text-gray-900">{{ plantsNeedingAttention().length }}</p>
              <p class="text-xs text-amber-600 font-medium mt-2">⚠️ Surveillance active</p>
            </div>
            <div class="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="text-2xl">⚠️</span>
            </div>
          </div>
        </div>

        <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-green-200 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">En bonne santé</p>
              <p class="text-3xl font-bold text-gray-900">{{ healthyPlants().length }}</p>
              <p class="text-xs text-green-600 font-medium mt-2">✨ Excellent état</p>
            </div>
            <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="text-2xl">✨</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Filtrer par catégorie</label>
            <select 
              class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              [value]="selectedFilter()"
              (change)="setFilter($event)">
              <option value="all">🌿 Toutes les plantes ({{ plants().length }})</option>
              <option value="needs-water">💧 À arroser ({{ plantsNeedingWater().length }})</option>
              <option value="healthy">✨ En bonne santé ({{ healthyPlants().length }})</option>
              <option value="needs-attention">⚠️ Attention requise ({{ plantsNeedingAttention().length }})</option>
            </select>
          </div>
          
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Nom, espèce, localisation..."
                class="w-full pl-12 border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                [value]="searchTerm()"
                (input)="setSearchTerm($event)">
            </div>
          </div>
        </div>
      </div>

      <!-- Plants Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        @for (plant of filteredPlants(); track plant.id) {
          <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:scale-[1.02]">
            <!-- Plant Image/Icon -->
            <div class="relative h-48 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 overflow-hidden">
              <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div class="relative h-full flex items-center justify-center">
                <div class="text-7xl opacity-90 group-hover:scale-110 transition-transform duration-300">
                  {{ getPlantEmoji(plant.species) }}
                </div>
              </div>
              
              <!-- Health Status Badge -->
              <div class="absolute top-4 right-4">
                <span [class]="getHealthBadgeClass(plant.healthStatus)" 
                      class="px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
                  {{ getHealthText(plant.healthStatus) }}
                </span>
              </div>
              
              <!-- Urgent Water Badge -->
              @if (needsWaterUrgently(plant)) {
                <div class="absolute top-4 left-4">
                  <span class="bg-red-500/90 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg backdrop-blur-sm animate-pulse">
                    💧 Urgent
                  </span>
                </div>
              }
            </div>

            <!-- Plant Content -->
            <div class="p-6">
              <div class="mb-4">
                <h3 class="font-bold text-gray-900 text-xl mb-1 group-hover:text-emerald-700 transition-colors">{{ plant.name }}</h3>
                <p class="text-sm text-gray-500 italic font-medium">{{ plant.species }}</p>
              </div>
              
              <div class="space-y-3 mb-6">
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">📍</span>
                    <span class="text-gray-600 font-medium">Localisation</span>
                  </div>
                  <span class="text-gray-900 font-semibold">{{ plant.location }}</span>
                </div>
                
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">💧</span>
                    <span class="text-gray-600 font-medium">Dernier arrosage</span>
                  </div>
                  <span class="text-gray-900 font-semibold">{{ formatDate(plant.lastWatered) }}</span>
                </div>
                
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">⏰</span>
                    <span class="text-gray-600 font-medium">Prochain arrosage</span>
                  </div>
                  <span [class]="getNextWateringClass(plant.nextWatering)" class="font-bold">
                    {{ formatDate(plant.nextWatering) }}
                  </span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2 pt-4 border-t border-gray-100">
                <button 
                  class="flex-1 group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm py-3 px-4 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] shadow-sm"
                  (click)="waterPlant(plant.id)">
                  <span class="text-lg group-hover:animate-bounce">💧</span>
                  Arroser
                </button>
                <button 
                  class="p-3 border-2 border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 text-lg hover:scale-105"
                  title="Modifier la plante"
                  (click)="editPlant(plant.id)">
                  ✏️
                </button>
                <button 
                  class="p-3 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-lg hover:scale-105"
                  title="Voir les détails"
                  (click)="viewPlant(plant.id)">
                  👁️
                </button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-full">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-5xl opacity-50">🌵</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-3">Aucune plante trouvée</h3>
              <p class="text-gray-600 mb-6 max-w-md mx-auto">
                @if (searchTerm() || selectedFilter() !== 'all') {
                  Aucune plante ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou votre recherche.
                } @else {
                  Votre collection est encore vide. Commencez par ajouter votre première plante pour démarrer votre jardin virtuel !
                }
              </p>
              @if (!searchTerm() && selectedFilter() === 'all') {
                <button 
                  class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl transition-all duration-200 font-semibold hover:scale-[1.02] shadow-sm inline-flex items-center gap-3"
                  (click)="openAddPlantModal()">
                  <span class="text-lg">🌱</span>
                  Ajouter ma première plante
                </button>
              } @else {
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition-colors font-medium"
                    (click)="clearFilters()">
                    Effacer les filtres
                  </button>
                  <button 
                    class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2 rounded-xl transition-all duration-200 font-medium inline-flex items-center gap-2"
                    (click)="openAddPlantModal()">
                    <span>🌱</span>
                    Ajouter une plante
                  </button>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Quick Stats Footer -->
      @if (filteredPlants().length > 0) {
        <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div class="flex flex-col items-center">
              <span class="text-2xl mb-2">🏆</span>
              <span class="text-sm text-gray-600">Affichage</span>
              <span class="font-bold text-gray-900">{{ filteredPlants().length }} / {{ plants().length }}</span>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-2xl mb-2">💪</span>
              <span class="text-sm text-gray-600">Santé moyenne</span>
              <span class="font-bold text-emerald-600">{{ getAverageHealthScore() }}%</span>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-2xl mb-2">📅</span>
              <span class="text-sm text-gray-600">Prochains arrosages</span>
              <span class="font-bold text-blue-600">{{ getUpcomingWatering() }}</span>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-2xl mb-2">📍</span>
              <span class="text-sm text-gray-600">Lieux différents</span>
              <span class="font-bold text-purple-600">{{ getUniqueLocations() }}</span>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Floating Action Button (Mobile) -->
    <button 
      class="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-4 rounded-full shadow-xl lg:hidden z-50 hover:scale-110 transition-all duration-200"
      (click)="openAddPlantModal()">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
    </button>

    <!-- Add Plant Modal -->
    <app-add-plant-modal
      [isOpen]="showAddPlantModal"
      (close)="showAddPlantModal = false"
      (plantAdded)="onPlantAdded($event)">
    </app-add-plant-modal>
  `,
  styles: [`
    .animate-bounce {
      animation: bounce 0.5s ease-in-out;
    }
    
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-5px); }
      60% { transform: translateY(-3px); }
    }
    
    .space-y-8 > * + * { margin-top: 2rem; }
    .space-y-6 > * + * { margin-top: 1.5rem; }
    .space-y-4 > * + * { margin-top: 1rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
  `]
})
export class PlantsComponent {
  // Données de test
  plants = signal<Plant[]>([
    {
      id: '1',
      name: 'Monstera Deliciosa',
      species: 'Monstera deliciosa',
      lastWatered: new Date('2024-01-10'),
      nextWatering: new Date('2024-01-15'),
      location: 'Salon',
      healthStatus: 'excellent',
      image: ''
    },
    {
      id: '2',
      name: 'Ficus Benjamin',
      species: 'Ficus benjamina',
      lastWatered: new Date('2024-01-12'),
      nextWatering: new Date('2024-01-13'), // En retard
      location: 'Bureau',
      healthStatus: 'needs-attention',
      image: ''
    },
    {
      id: '3',
      name: 'Pothos Doré',
      species: 'Epipremnum aureum',
      lastWatered: new Date('2024-01-08'),
      nextWatering: new Date('2024-01-16'),
      location: 'Cuisine',
      healthStatus: 'good',
      image: ''
    },
    {
      id: '4',
      name: 'Sansevieria',
      species: 'Sansevieria trifasciata',
      lastWatered: new Date('2024-01-05'),
      nextWatering: new Date('2024-01-20'),
      location: 'Chambre',
      healthStatus: 'excellent',
      image: ''
    },
    {
      id: '5',
      name: 'Aloe Vera',
      species: 'Aloe barbadensis',
      lastWatered: new Date('2024-01-11'),
      nextWatering: new Date('2024-01-14'), // Bientôt
      location: 'Salle de bain',
      healthStatus: 'good',
      image: ''
    }
  ]);

  selectedFilter = signal<string>('all');
  searchTerm = signal<string>('');

  // Computed signals pour les statistiques
  plantsNeedingWater = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.plants().filter(plant => plant.nextWatering <= today);
  });

  plantsNeedingAttention = computed(() =>
    this.plants().filter(plant => plant.healthStatus === 'needs-attention' || plant.healthStatus === 'poor')
  );

  healthyPlants = computed(() =>
    this.plants().filter(plant => plant.healthStatus === 'excellent' || plant.healthStatus === 'good')
  );

  // Plantes filtrées
  filteredPlants = computed(() => {
    let filtered = this.plants();

    // Filtre par catégorie
    const filter = this.selectedFilter();
    if (filter === 'needs-water') {
      filtered = this.plantsNeedingWater();
    } else if (filter === 'healthy') {
      filtered = this.healthyPlants();
    } else if (filter === 'needs-attention') {
      filtered = this.plantsNeedingAttention();
    }

    // Filtre par recherche
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(plant =>
        plant.name.toLowerCase().includes(search) ||
        plant.species.toLowerCase().includes(search) ||
        plant.location.toLowerCase().includes(search)
      );
    }

    return filtered;
  });

  setFilter(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedFilter.set(target.value);
  }

  setSearchTerm(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  clearFilters() {
    this.selectedFilter.set('all');
    this.searchTerm.set('');
  }

  getPlantEmoji(species: string): string {
    const emojis: { [key: string]: string } = {
      'Monstera deliciosa': '🌿',
      'Ficus benjamina': '🌳',
      'Epipremnum aureum': '🍃',
      'Sansevieria trifasciata': '🌵',
      'Aloe barbadensis': '🪴'
    };
    return emojis[species] || '🌱';
  }

  getHealthBadgeClass(status: Plant['healthStatus']): string {
    const classes = {
      'excellent': 'bg-green-100/90 text-green-800 border border-green-200/50',
      'good': 'bg-blue-100/90 text-blue-800 border border-blue-200/50',
      'needs-attention': 'bg-amber-100/90 text-amber-800 border border-amber-200/50',
      'poor': 'bg-red-100/90 text-red-800 border border-red-200/50'
    };
    return classes[status];
  }

  getHealthText(status: Plant['healthStatus']): string {
    const texts = {
      'excellent': '✨ Parfaite',
      'good': '👍 Bonne',
      'needs-attention': '⚠️ Attention',
      'poor': '🚨 Critique'
    };
    return texts[status];
  }

  needsWaterUrgently(plant: Plant): boolean {
    const today = new Date();
    return plant.nextWatering < today;
  }

  getNextWateringClass(nextWatering: Date): string {
    const today = new Date();
    const diffDays = Math.ceil((nextWatering.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) return 'text-red-600'; // En retard
    if (diffDays === 0) return 'text-orange-600'; // Aujourd'hui
    if (diffDays <= 2) return 'text-amber-600'; // Bientôt
    return 'text-emerald-600'; // OK
  }

  formatDate(date: Date): string {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Demain";
    if (diffDays === -1) return "Hier";
    if (diffDays < -1) return `Il y a ${Math.abs(diffDays)} jours`;
    if (diffDays > 1) return `Dans ${diffDays} jours`;

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  }

  getAverageHealthScore(): number {
    if (this.filteredPlants().length === 0) return 0;

    const scores = { excellent: 100, good: 75, 'needs-attention': 50, poor: 25 };
    const totalScore = this.filteredPlants().reduce((sum, plant) => sum + scores[plant.healthStatus], 0);
    return Math.round(totalScore / this.filteredPlants().length);
  }

  getUpcomingWatering(): string {
    const upcoming = this.filteredPlants().filter(plant => {
      const today = new Date();
      const diffDays = Math.ceil((plant.nextWatering.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return diffDays >= 0 && diffDays <= 3;
    }).length;
    return upcoming.toString();
  }

  getUniqueLocations(): number {
    const locations = new Set(this.filteredPlants().map(plant => plant.location));
    return locations.size;
  }

  waterPlant(plantId: string) {
    // Mettre à jour les dates d'arrosage
    this.plants.update(plants =>
      plants.map(plant =>
        plant.id === plantId
          ? {
            ...plant,
            lastWatered: new Date(),
            nextWatering: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 jours
          }
          : plant
      )
    );
    console.log('Plante arrosée:', plantId);
  }

  editPlant(plantId: string) {
    console.log('Éditer la plante:', plantId);
    // TODO: Ouvrir modal d'édition ou naviguer vers page d'édition
  }

  viewPlant(plantId: string) {
    console.log('Voir détails de la plante:', plantId);
    // TODO: Naviguer vers la page de détail
  }

  showAddPlantModal = false;

  openAddPlantModal() {
    this.showAddPlantModal = true;
  }

  onPlantAdded(newPlant: any) {
    console.log('Nouvelle plante ajoutée:', newPlant);
    // TODO: Ajouter la plante à la liste
    // this.plants.update(plants => [...plants, newPlant]);
  }
}