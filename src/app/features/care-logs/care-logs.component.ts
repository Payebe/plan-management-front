import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Plant {
  id: string;
  name: string;
  species: string;
  image: string;
}

interface CareLog {
  id: string;
  plantId: string;
  plantName: string;
  plantImage: string;
  type: 'watering' | 'fertilizing' | 'pruning' | 'repotting' | 'inspection' | 'treatment' | 'other';
  title: string;
  description: string;
  date: Date;
  images?: string[];
  tags?: string[];
  measurements?: {
    height?: number;
    width?: number;
    leafCount?: number;
    notes?: string;
  };
  mood?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  weather?: string;
  location?: string;
}

@Component({
  selector: 'app-care-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <!-- Header Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
              <span class="text-3xl">📝</span>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Journal des Soins</h1>
              <p class="text-gray-600">{{ careLogs().length }} entrées documentées • {{ activePlants().length }} plantes suivies</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button 
              class="group bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 shadow-sm hover:shadow-md hover:scale-[1.02] font-medium"
              (click)="toggleViewMode()">
              <svg class="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                @if (viewMode() === 'timeline') {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v8a2 2 0 002 2h5.586a1 1 0 00.707-.293l5.414-5.414a1 1 0 000-1.414l-4.586-4.586A1 1 0 0013.414 5H11V3a1 1 0 10-2 0v2z"/>
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                }
              </svg>
              {{ viewMode() === 'timeline' ? 'Vue Grille' : 'Vue Timeline' }}
            </button>
            <button 
              class="group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 shadow-sm hover:shadow-md hover:scale-[1.02] font-medium"
              (click)="openAddLogModal()">
              <svg class="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Nouveau Soin
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Cette semaine</p>
              <p class="text-3xl font-bold text-gray-900">{{ thisWeekLogs().length }}</p>
              <p class="text-xs text-blue-600 font-medium mt-2">📅 Soins récents</p>
            </div>
            <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-cyan-200 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Arrosages</p>
              <p class="text-3xl font-bold text-gray-900">{{ wateringLogs().length }}</p>
              <p class="text-xs text-cyan-600 font-medium mt-2">💧 Sessions hydratation</p>
            </div>
            <div class="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="text-2xl">💧</span>
            </div>
          </div>
        </div>

        <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Fertilisations</p>
              <p class="text-3xl font-bold text-gray-900">{{ fertilizingLogs().length }}</p>
              <p class="text-xs text-emerald-600 font-medium mt-2">🌱 Nutrition apportée</p>
            </div>
            <div class="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="text-2xl">🌱</span>
            </div>
          </div>
        </div>

        <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-amber-200 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Inspections</p>
              <p class="text-3xl font-bold text-gray-900">{{ inspectionLogs().length }}</p>
              <p class="text-xs text-amber-600 font-medium mt-2">🔍 Contrôles santé</p>
            </div>
            <div class="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="text-2xl">🔍</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span class="text-xl">🔧</span>
          Filtres et recherche
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Filtre par plante -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Plante</label>
            <select 
              class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              [(ngModel)]="selectedPlant"
              (ngModelChange)="applyFilters()">
              <option value="">🌿 Toutes les plantes</option>
              @for (plant of plants(); track plant.id) {
                <option [value]="plant.id">{{ plant.name }}</option>
              }
            </select>
          </div>

          <!-- Filtre par type de soin -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type de soin</label>
            <select 
              class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              [(ngModel)]="selectedType"
              (ngModelChange)="applyFilters()">
              <option value="">🎯 Tous les types</option>
              <option value="watering">💧 Arrosage</option>
              <option value="fertilizing">🌱 Fertilisation</option>
              <option value="pruning">✂️ Taille</option>
              <option value="repotting">🪴 Rempotage</option>
              <option value="inspection">🔍 Inspection</option>
              <option value="treatment">💊 Traitement</option>
              <option value="other">📝 Autre</option>
            </select>
          </div>

          <!-- Filtre par période -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Période</label>
            <select 
              class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              [(ngModel)]="selectedPeriod"
              (ngModelChange)="applyFilters()">
              <option value="">📆 Toutes les périodes</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">3 derniers mois</option>
            </select>
          </div>

          <!-- Recherche -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input 
                type="text"
                placeholder="Rechercher dans les soins..."
                class="w-full pl-12 border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                [(ngModel)]="searchTerm"
                (ngModelChange)="applyFilters()">
            </div>
          </div>
        </div>
        
        @if (hasActiveFilters()) {
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span class="text-sm text-gray-600">{{ filteredLogs().length }} résultat(s) trouvé(s)</span>
            <button 
              class="text-sm text-purple-600 hover:text-purple-700 font-medium"
              (click)="clearAllFilters()">
              Effacer tous les filtres
            </button>
          </div>
        }
      </div>

      <!-- Vue Timeline -->
      @if (viewMode() === 'timeline') {
        <div class="relative">
          <!-- Ligne de timeline -->
          <div class="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-200 via-indigo-200 to-transparent rounded-full"></div>
          
          <div class="space-y-8">
            @for (log of filteredLogs(); track log.id; let i = $index) {
              <div class="relative flex items-start gap-6">
                <!-- Point de timeline -->
                <div 
                  class="relative z-10 w-16 h-16 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-2xl group hover:scale-110 transition-transform"
                  [class]="getTypeBackgroundClass(log.type)">
                  {{ getTypeIcon(log.type) }}
                  <!-- Pulse effect pour les entrées récentes -->
                  @if (isRecent(log.date)) {
                    <div class="absolute -inset-1 rounded-2xl animate-pulse bg-gradient-to-r from-purple-400 to-indigo-400 opacity-20"></div>
                  }
                </div>

                <!-- Contenu -->
                <div class="flex-1 group">
                  <div class="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all duration-300">
                    <!-- Header de l'entrée -->
                    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                          <div class="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                            {{ getPlantInitial(log.plantName) }}
                          </div>
                        </div>
                        <div>
                          <h3 class="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{{ log.title }}</h3>
                          <p class="text-purple-600 font-medium">{{ log.plantName }}</p>
                          <p class="text-sm text-gray-500 mt-1">{{ formatDateWithTime(log.date) }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <!-- Type badge -->
                        <span class="px-3 py-1.5 rounded-full text-sm font-semibold" [class]="getTypeBadgeClass(log.type)">
                          {{ getTypeIcon(log.type) }} {{ getTypeLabel(log.type) }}
                        </span>
                        <!-- Mood indicator -->
                        @if (log.mood) {
                          <span 
                            class="px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1"
                            [class]="getMoodClass(log.mood)">
                            {{ getMoodIcon(log.mood) }} {{ getMoodLabel(log.mood) }}
                          </span>
                        }
                      </div>
                    </div>

                    <!-- Description -->
                    <div class="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-4">
                      <p class="text-gray-700 leading-relaxed">{{ log.description }}</p>
                    </div>

                    <!-- Mesures -->
                    @if (log.measurements) {
                      <div class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-4">
                        <h4 class="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                          <span class="text-lg">📏</span>
                          Mesures et observations
                        </h4>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          @if (log.measurements.height) {
                            <div class="bg-white rounded-lg p-3 text-center">
                              <div class="text-2xl font-bold text-emerald-600">{{ log.measurements.height }}</div>
                              <div class="text-gray-600">cm de hauteur</div>
                            </div>
                          }
                          @if (log.measurements.width) {
                            <div class="bg-white rounded-lg p-3 text-center">
                              <div class="text-2xl font-bold text-blue-600">{{ log.measurements.width }}</div>
                              <div class="text-gray-600">cm de largeur</div>
                            </div>
                          }
                          @if (log.measurements.leafCount) {
                            <div class="bg-white rounded-lg p-3 text-center">
                              <div class="text-2xl font-bold text-green-600">{{ log.measurements.leafCount }}</div>
                              <div class="text-gray-600">feuilles</div>
                            </div>
                          }
                        </div>
                        @if (log.measurements.notes) {
                          <div class="mt-3 bg-white rounded-lg p-3">
                            <p class="text-sm text-gray-700 italic">{{ log.measurements.notes }}</p>
                          </div>
                        }
                      </div>
                    }

                    <!-- Tags -->
                    @if (log.tags && log.tags.length > 0) {
                      <div class="flex flex-wrap gap-2 mb-4">
                        @for (tag of log.tags; track tag) {
                          <span class="px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-sm rounded-full font-medium border border-purple-200">
                            #{{ tag }}
                          </span>
                        }
                      </div>
                    }

                    <!-- Images -->
                    @if (log.images && log.images.length > 0) {
                      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        @for (image of log.images; track image) {
                          <div class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 aspect-square">
                            <div class="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 opacity-20"></div>
                            <div class="absolute inset-0 flex items-center justify-center">
                              <span class="text-4xl opacity-60">🖼️</span>
                            </div>
                            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center cursor-pointer">
                              <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                              </svg>
                            </div>
                          </div>
                        }
                      </div>
                    }

                    <!-- Actions -->
                    <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <button 
                        class="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium text-sm"
                        (click)="editLog(log)">
                        ✏️ Modifier
                      </button>
                      <button 
                        class="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium text-sm"
                        (click)="deleteLog(log.id)">
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Vue Grille -->
      @if (viewMode() === 'grid') {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          @for (log of filteredLogs(); track log.id) {
            <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-purple-200 transition-all duration-300 hover:scale-[1.02]">
              <!-- Image principale -->
              @if (log.images && log.images.length > 0) {
                <div class="h-48 bg-gradient-to-br from-purple-400 to-indigo-500 relative overflow-hidden">
                  <div class="absolute inset-0 bg-white/10"></div>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-6xl opacity-80">🖼️</span>
                  </div>
                  @if (log.images.length > 1) {
                    <div class="absolute top-3 right-3 bg-black/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                      +{{ log.images.length - 1 }}
                    </div>
                  }
                </div>
              } @else {
                <div class="h-48 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center relative overflow-hidden">
                  <div class="absolute inset-0 bg-white/10"></div>
                  <span class="relative text-6xl opacity-90">{{ getTypeIcon(log.type) }}</span>
                </div>
              }

              <div class="p-6">
                <!-- Header -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {{ getPlantInitial(log.plantName) }}
                    </div>
                    <div class="min-w-0">
                      <h3 class="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors truncate">{{ log.title }}</h3>
                      <p class="text-sm text-purple-600 font-medium">{{ log.plantName }}</p>
                    </div>
                  </div>
                  @if (log.mood) {
                    <span class="text-xl flex-shrink-0">{{ getMoodIcon(log.mood) }}</span>
                  }
                </div>

                <!-- Description -->
                <p class="text-sm text-gray-600 mb-4 line-clamp-3">{{ log.description }}</p>

                <!-- Measurements preview -->
                @if (log.measurements) {
                  <div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 mb-4">
                    <div class="flex justify-between text-sm">
                      @if (log.measurements.height) {
                        <span class="text-emerald-700">📏 {{ log.measurements.height }}cm</span>
                      }
                      @if (log.measurements.leafCount) {
                        <span class="text-green-700">🍃 {{ log.measurements.leafCount }} feuilles</span>
                      }
                    </div>
                  </div>
                }

                <!-- Tags -->
                @if (log.tags && log.tags.length > 0) {
                  <div class="flex flex-wrap gap-1 mb-4">
                    @for (tag of log.tags.slice(0, 3); track tag) {
                      <span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                        #{{ tag }}
                      </span>
                    }
                    @if (log.tags.length > 3) {
                      <span class="text-xs text-gray-500 px-2 py-1">+{{ log.tags.length - 3 }}</span>
                    }
                  </div>
                }

                <!-- Footer -->
                <div class="flex items-center justify-between text-xs pt-4 border-t border-gray-100">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded-full font-medium" [class]="getTypeBadgeClass(log.type)">
                      {{ getTypeIcon(log.type) }}
                    </span>
                    <span class="text-gray-500">{{ formatDate(log.date) }}</span>
                  </div>
                  <div class="flex gap-2">
                    <button 
                      class="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-all"
                      (click)="editLog(log)">
                      ✏️
                    </button>
                    <button 
                      class="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                      (click)="deleteLog(log.id)">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- État vide -->
      @if (filteredLogs().length === 0) {
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div class="w-24 h-24 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span class="text-5xl opacity-50">📝</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">
            @if (hasActiveFilters()) {
              Aucun résultat trouvé
            } @else {
              Votre journal est vide
            }
          </h3>
          <p class="text-gray-600 mb-6 max-w-md mx-auto">
            @if (hasActiveFilters()) {
              Aucun soin ne correspond à vos critères de recherche. Essayez de modifier vos filtres.
            } @else {
              Commencez à documenter les soins que vous apportez à vos plantes pour suivre leur évolution.
            }
          </p>
          @if (!hasActiveFilters()) {
            <button 
              class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl transition-all duration-200 font-semibold hover:scale-[1.02] shadow-sm inline-flex items-center gap-3"
              (click)="openAddLogModal()">
              <span class="text-lg">✨</span>
              Créer ma première entrée
            </button>
          } @else {
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition-colors font-medium"
                (click)="clearAllFilters()">
                Effacer les filtres
              </button>
              <button 
                class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2 rounded-xl transition-all duration-200 font-medium inline-flex items-center gap-2"
                (click)="openAddLogModal()">
                <span>✨</span>
                Nouveau soin
              </button>
            </div>
          }
        </div>
      }

      <!-- Summary Stats (visible only when logs exist) -->
      @if (filteredLogs().length > 0) {
        <div class="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span class="text-xl">📊</span>
            Résumé de vos soins
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="text-center">
              <div class="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span class="text-2xl">🎯</span>
              </div>
              <p class="text-sm text-gray-600">Fréquence moyenne</p>
              <p class="text-xl font-bold text-purple-600">{{ getAverageFrequency() }}</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span class="text-2xl">🌱</span>
              </div>
              <p class="text-sm text-gray-600">Type le plus fréquent</p>
              <p class="text-lg font-bold text-emerald-600">{{ getMostFrequentType() }}</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span class="text-2xl">⭐</span>
              </div>
              <p class="text-sm text-gray-600">Humeur moyenne</p>
              <p class="text-lg font-bold text-blue-600">{{ getAverageMood() }}</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span class="text-2xl">📈</span>
              </div>
              <p class="text-sm text-gray-600">Tendance</p>
              <p class="text-lg font-bold text-amber-600">{{ getTrend() }}</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .space-y-8 > * + * { margin-top: 2rem; }
    .space-y-6 > * + * { margin-top: 1.5rem; }
    .space-y-4 > * + * { margin-top: 1rem; }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class CareLogsComponent implements OnInit {
  viewMode = signal<'timeline' | 'grid'>('timeline');

  // Filtres
  selectedPlant = '';
  selectedType = '';
  selectedPeriod = '';
  searchTerm = '';

  // Données mockées
  plants = signal<Plant[]>([
    { id: 'p1', name: 'Monstera Deliciosa', species: 'Monstera deliciosa', image: '/assets/plants/monstera.jpg' },
    { id: 'p2', name: 'Ficus Benjamin', species: 'Ficus benjamina', image: '/assets/plants/ficus.jpg' },
    { id: 'p3', name: 'Pothos Doré', species: 'Epipremnum aureum', image: '/assets/plants/pothos.jpg' },
    { id: 'p4', name: 'Sansevieria', species: 'Sansevieria trifasciata', image: '/assets/plants/sansevieria.jpg' },
    { id: 'p5', name: 'Philodendron', species: 'Philodendron scandens', image: '/assets/plants/philodendron.jpg' }
  ]);

  careLogs = signal<CareLog[]>([
    {
      id: '1',
      plantId: 'p1',
      plantName: 'Monstera Deliciosa',
      plantImage: '/assets/plants/monstera.jpg',
      type: 'watering',
      title: 'Arrosage hebdomadaire',
      description: 'Arrosage normal avec de l\'eau à température ambiante. Le terreau était sec sur 2cm de profondeur.',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      mood: 'good',
      tags: ['routine', 'hebdomadaire'],
      measurements: {
        height: 85,
        leafCount: 12,
        notes: 'Nouvelle pousse visible'
      }
    },
    {
      id: '2',
      plantId: 'p2',
      plantName: 'Ficus Benjamin',
      plantImage: '/assets/plants/ficus.jpg',
      type: 'inspection',
      title: 'Inspection des feuilles jaunissantes',
      description: 'Découverte de quelques feuilles qui jaunissent à la base. Possible excès d\'arrosage ou manque de lumière.',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      mood: 'fair',
      tags: ['problème', 'feuilles-jaunes'],
      images: ['/assets/care-logs/ficus-leaves.jpg']
    },
    {
      id: '3',
      plantId: 'p3',
      plantName: 'Pothos Doré',
      plantImage: '/assets/plants/pothos.jpg',
      type: 'pruning',
      title: 'Taille des tiges trop longues',
      description: 'Taille de 3 tiges qui devenaient trop longues. Les boutures seront mises en eau pour propagation.',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      mood: 'excellent',
      tags: ['taille', 'propagation'],
      images: ['/assets/care-logs/pothos-cutting.jpg', '/assets/care-logs/propagation.jpg']
    },
    {
      id: '4',
      plantId: 'p4',
      plantName: 'Sansevieria',
      plantImage: '/assets/plants/sansevieria.jpg',
      type: 'fertilizing',
      title: 'Fertilisation mensuelle',
      description: 'Application d\'engrais liquide pour plantes vertes, dilué à 50%. Première fertilisation du printemps.',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      mood: 'good',
      tags: ['fertilisant', 'printemps'],
      measurements: {
        height: 42,
        leafCount: 8
      }
    },
    {
      id: '5',
      plantId: 'p5',
      plantName: 'Philodendron',
      plantImage: '/assets/plants/philodendron.jpg',
      type: 'repotting',
      title: 'Rempotage dans un pot plus grand',
      description: 'Rempotage nécessaire car les racines sortaient du pot. Nouveau pot de 2cm de diamètre supérieur avec nouveau terreau.',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      mood: 'excellent',
      tags: ['rempotage', 'croissance'],
      images: ['/assets/care-logs/repotting-before.jpg', '/assets/care-logs/repotting-after.jpg'],
      measurements: {
        height: 35,
        width: 40,
        leafCount: 15,
        notes: 'Système racinaire bien développé'
      }
    }
  ]);

  filteredLogs = signal<CareLog[]>([]);

  // Computed properties
  activePlants = computed(() =>
    this.plants().filter(plant =>
      this.careLogs().some(log => log.plantId === plant.id)
    )
  );

  thisWeekLogs = computed(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return this.careLogs().filter(log => log.date >= weekAgo);
  });

  wateringLogs = computed(() =>
    this.careLogs().filter(log => log.type === 'watering')
  );

  fertilizingLogs = computed(() =>
    this.careLogs().filter(log => log.type === 'fertilizing')
  );

  inspectionLogs = computed(() =>
    this.careLogs().filter(log => log.type === 'inspection')
  );

  ngOnInit() {
    this.filteredLogs.set(this.careLogs());
  }

  // Actions
  toggleViewMode() {
    this.viewMode.update(mode => mode === 'timeline' ? 'grid' : 'timeline');
  }

  applyFilters() {
    let logs = this.careLogs();

    // Filtre par plante
    if (this.selectedPlant) {
      logs = logs.filter(log => log.plantId === this.selectedPlant);
    }

    // Filtre par type
    if (this.selectedType) {
      logs = logs.filter(log => log.type === this.selectedType);
    }

    // Filtre par période
    if (this.selectedPeriod) {
      const now = new Date();
      let startDate: Date;

      switch (this.selectedPeriod) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      logs = logs.filter(log => log.date >= startDate);
    }

    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      logs = logs.filter(log =>
        log.title.toLowerCase().includes(term) ||
        log.description.toLowerCase().includes(term) ||
        log.plantName.toLowerCase().includes(term) ||
        log.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    this.filteredLogs.set(logs);
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedPlant || this.selectedType || this.selectedPeriod || this.searchTerm);
  }

  clearAllFilters() {
    this.selectedPlant = '';
    this.selectedType = '';
    this.selectedPeriod = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  openAddLogModal() {
    console.log('Ouvrir modal d\'ajout de soin');
    // TODO: Implémenter la modal
  }

  editLog(log: CareLog) {
    console.log('Modifier le soin:', log);
    // TODO: Ouvrir modal d'édition
  }

  deleteLog(logId: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      this.careLogs.update(logs => logs.filter(log => log.id !== logId));
      this.applyFilters();
    }
  }

  // Utilitaires
  isRecent(date: Date): boolean {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    return date >= twoDaysAgo;
  }

  getPlantInitial(plantName: string): string {
    return plantName.charAt(0).toUpperCase();
  }

  getTypeIcon(type: CareLog['type']): string {
    const icons = {
      'watering': '💧',
      'fertilizing': '🌱',
      'pruning': '✂️',
      'repotting': '🪴',
      'inspection': '🔍',
      'treatment': '💊',
      'other': '📝'
    };
    return icons[type];
  }

  getTypeLabel(type: CareLog['type']): string {
    const labels = {
      'watering': 'Arrosage',
      'fertilizing': 'Fertilisation',
      'pruning': 'Taille',
      'repotting': 'Rempotage',
      'inspection': 'Inspection',
      'treatment': 'Traitement',
      'other': 'Autre'
    };
    return labels[type];
  }

  getTypeBackgroundClass(type: CareLog['type']): string {
    const classes = {
      'watering': 'bg-gradient-to-br from-blue-400 to-cyan-500',
      'fertilizing': 'bg-gradient-to-br from-emerald-400 to-green-500',
      'pruning': 'bg-gradient-to-br from-orange-400 to-red-500',
      'repotting': 'bg-gradient-to-br from-purple-400 to-pink-500',
      'inspection': 'bg-gradient-to-br from-amber-400 to-yellow-500',
      'treatment': 'bg-gradient-to-br from-red-400 to-pink-500',
      'other': 'bg-gradient-to-br from-gray-400 to-slate-500'
    };
    return classes[type];
  }

  getTypeBadgeClass(type: CareLog['type']): string {
    const classes = {
      'watering': 'bg-blue-100 text-blue-700 border border-blue-200',
      'fertilizing': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      'pruning': 'bg-orange-100 text-orange-700 border border-orange-200',
      'repotting': 'bg-purple-100 text-purple-700 border border-purple-200',
      'inspection': 'bg-amber-100 text-amber-700 border border-amber-200',
      'treatment': 'bg-red-100 text-red-700 border border-red-200',
      'other': 'bg-gray-100 text-gray-700 border border-gray-200'
    };
    return classes[type];
  }

  getMoodIcon(mood: CareLog['mood']): string {
    const icons = {
      'excellent': '😍',
      'good': '😊',
      'fair': '😐',
      'poor': '😟',
      'critical': '😰'
    };
    return icons[mood || 'good'];
  }

  getMoodLabel(mood: CareLog['mood']): string {
    const labels = {
      'excellent': 'Excellent',
      'good': 'Bon',
      'fair': 'Moyen',
      'poor': 'Préoccupant',
      'critical': 'Critique'
    };
    return labels[mood || 'good'];
  }

  getMoodClass(mood: CareLog['mood']): string {
    const classes = {
      'excellent': 'bg-green-100 text-green-700 border border-green-200',
      'good': 'bg-blue-100 text-blue-700 border border-blue-200',
      'fair': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      'poor': 'bg-orange-100 text-orange-700 border border-orange-200',
      'critical': 'bg-red-100 text-red-700 border border-red-200'
    };
    return classes[mood || 'good'];
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  }

  formatDateWithTime(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Méthodes pour les statistiques
  getAverageFrequency(): string {
    const logs = this.filteredLogs();
    if (logs.length < 2) return 'N/A';

    const totalDays = Math.ceil((Date.now() - Math.min(...logs.map(l => l.date.getTime()))) / (1000 * 60 * 60 * 24));
    const frequency = Math.ceil(totalDays / logs.length);

    return `${frequency} jours`;
  }

  getMostFrequentType(): string {
    const logs = this.filteredLogs();
    const typeCounts: { [key: string]: number } = {};

    logs.forEach(log => {
      typeCounts[log.type] = (typeCounts[log.type] || 0) + 1;
    });

    const mostFrequent = Object.entries(typeCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);
    return mostFrequent[0] ? this.getTypeLabel(mostFrequent[0] as CareLog['type']) : 'N/A';
  }

  getAverageMood(): string {
    const logs = this.filteredLogs().filter(log => log.mood);
    if (logs.length === 0) return 'N/A';

    const moodScores = { excellent: 5, good: 4, fair: 3, poor: 2, critical: 1 };
    const avgScore = logs.reduce((sum, log) => sum + moodScores[log.mood!], 0) / logs.length;

    if (avgScore >= 4.5) return 'Excellent';
    if (avgScore >= 3.5) return 'Bon';
    if (avgScore >= 2.5) return 'Moyen';
    if (avgScore >= 1.5) return 'Préoccupant';
    return 'Critique';
  }

  getTrend(): string {
    const logs = this.filteredLogs().slice(-10); // 10 dernières entrées
    if (logs.length < 5) return 'Stable';

    const recent = logs.slice(-5);
    const older = logs.slice(0, -5);

    const recentAvg = recent.length;
    const olderAvg = older.length;

    if (recentAvg > olderAvg * 1.2) return '📈 Croissante';
    if (recentAvg < olderAvg * 0.8) return '📉 Décroissante';
    return '📊 Stable';
  }
}