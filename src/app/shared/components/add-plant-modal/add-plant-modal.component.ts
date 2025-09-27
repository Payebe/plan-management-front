import { Component, EventEmitter, Input, Output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface PlantSpecies {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lightRequirement: 'low' | 'medium' | 'bright' | 'direct';
  wateringFrequency: number; // jours
  humidity: number; // pourcentage
  temperature: { min: number; max: number };
  description: string;
  image: string;
  tips: string[];
}

interface NewPlant {
  name: string;
  speciesId: string;
  location: string;
  acquiredDate: Date;
  size: 'small' | 'medium' | 'large';
  pot: {
    type: 'terracotta' | 'plastic' | 'ceramic' | 'other';
    size: string;
    drainage: boolean;
  };
  soil: string;
  notes: string;
  image?: string;
  customWateringSchedule?: boolean;
  wateringFrequency?: number;
}

@Component({
  selector: 'app-add-plant-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <!-- Modal Overlay -->
    <div 
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      [class.hidden]="!isOpen"
      (click)="closeModal($event)">
      
      <!-- Modal Background -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <!-- Modal Content -->
      <div 
        class="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">🌱 Ajouter une nouvelle plante</h2>
              <p class="text-gray-600 mt-1">Étape {{ currentStep() }} sur {{ totalSteps }}</p>
            </div>
            <button 
              class="text-gray-400 hover:text-gray-600 transition-colors"
              (click)="closeModal()">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <!-- Progress Bar -->
          <div class="mt-4">
            <div class="flex items-center">
              @for (step of steps; track step.id; let i = $index) {
                <div class="flex items-center">
                  <!-- Step Circle -->
                  <div 
                    class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors"
                    [class]="getStepClass(i + 1)">
                    @if (i + 1 < currentStep()) {
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    } @else {
                      {{ i + 1 }}
                    }
                  </div>
                  
                  <!-- Step Label -->
                  <span 
                    class="ml-2 text-sm font-medium"
                    [class]="i + 1 <= currentStep() ? 'text-green-600' : 'text-gray-400'">
                    {{ step.label }}
                  </span>
                  
                  <!-- Connector Line -->
                  @if (i < steps.length - 1) {
                    <div 
                      class="ml-4 w-16 h-0.5 transition-colors"
                      [class]="i + 1 < currentStep() ? 'bg-green-600' : 'bg-gray-300'">
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Form Content -->
        <form [formGroup]="plantForm" (ngSubmit)="onSubmit()" class="p-6">
          
          <!-- Étape 1: Choix de l'espèce -->
          @if (currentStep() === 1) {
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Choisissez l'espèce de votre plante</h3>
                
                <!-- Barre de recherche -->
                <div class="relative mb-4">
                  <input 
                    type="text"
                    placeholder="Rechercher une espèce..."
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    [(ngModel)]="speciesSearch"
                    [ngModelOptions]="{standalone: true}"
                    (input)="filterSpecies()">
                  <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>

                <!-- Filtres par catégorie -->
                <div class="flex flex-wrap gap-2 mb-6">
                  <button 
                    type="button"
                    class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    [class]="selectedCategory === '' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    (click)="filterByCategory('')">
                    Toutes
                  </button>
                  @for (category of categories; track category) {
                    <button 
                      type="button"
                      class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                      [class]="selectedCategory === category ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                      (click)="filterByCategory(category)">
                      {{ category }}
                    </button>
                  }
                </div>

                <!-- Grille d'espèces -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  @for (species of filteredSpecies(); track species.id) {
                    <div 
                      class="border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
                      [class]="selectedSpeciesId === species.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'"
                      (click)="selectSpecies(species)">
                      
                      <img 
                        [src]="species.image" 
                        [alt]="species.name"
                        class="w-full h-32 object-cover rounded-lg mb-3">
                      
                      <h4 class="font-semibold text-gray-900">{{ species.name }}</h4>
                      <p class="text-sm text-gray-500 italic mb-2">{{ species.scientificName }}</p>
                      
                      <div class="flex items-center gap-2 mb-2">
                        <span 
                          class="px-2 py-1 text-xs rounded-full"
                          [class]="getDifficultyClass(species.difficulty)">
                          {{ getDifficultyLabel(species.difficulty) }}
                        </span>
                        <span class="text-xs text-gray-500">{{ species.category }}</span>
                      </div>
                      
                      <div class="text-xs text-gray-600 space-y-1">
                        <div class="flex items-center gap-1">
                          <span>☀️</span>
                          <span>{{ getLightLabel(species.lightRequirement) }}</span>
                        </div>
                        <div class="flex items-center gap-1">
                          <span>💧</span>
                          <span>Tous les {{ species.wateringFrequency }}j</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>

                @if (filteredSpecies().length === 0) {
                  <div class="text-center py-8">
                    <div class="text-4xl mb-2">🔍</div>
                    <p class="text-gray-500">Aucune espèce trouvée avec ces critères</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Étape 2: Informations de base -->
          @if (currentStep() === 2) {
            <div class="space-y-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations de votre plante</h3>
              
              <!-- Espèce sélectionnée -->
              @if (selectedSpecies()) {
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="flex items-center gap-3">
                    <img 
                      [src]="selectedSpecies()!.image" 
                      [alt]="selectedSpecies()!.name"
                      class="w-16 h-16 object-cover rounded-lg">
                    <div>
                      <h4 class="font-semibold text-green-900">{{ selectedSpecies()!.name }}</h4>
                      <p class="text-green-700 text-sm italic">{{ selectedSpecies()!.scientificName }}</p>
                    </div>
                  </div>
                </div>
              }

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Nom de la plante -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nom de votre plante *
                  </label>
                  <input 
                    type="text"
                    formControlName="name"
                    placeholder="ex: Monstera du salon"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    [class.border-red-500]="plantForm.get('name')?.invalid && plantForm.get('name')?.touched">
                  @if (plantForm.get('name')?.invalid && plantForm.get('name')?.touched) {
                    <p class="text-red-500 text-sm mt-1">Le nom est obligatoire</p>
                  }
                </div>

                <!-- Emplacement -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Emplacement *
                  </label>
                  <input 
                    type="text"
                    formControlName="location"
                    placeholder="ex: Salon, près de la fenêtre"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    [class.border-red-500]="plantForm.get('location')?.invalid && plantForm.get('location')?.touched">
                  @if (plantForm.get('location')?.invalid && plantForm.get('location')?.touched) {
                    <p class="text-red-500 text-sm mt-1">L'emplacement est obligatoire</p>
                  }
                </div>

                <!-- Date d'acquisition -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Date d'acquisition
                  </label>
                  <input 
                    type="date"
                    formControlName="acquiredDate"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                </div>

                <!-- Taille -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Taille actuelle
                  </label>
                  <select 
                    formControlName="size"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="small">🌱 Petite (< 30cm)</option>
                    <option value="medium">🪴 Moyenne (30-80cm)</option>
                    <option value="large">🌳 Grande (> 80cm)</option>
                  </select>
                </div>
              </div>

              <!-- Photo -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Photo de votre plante
                </label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  <input 
                    type="file"
                    accept="image/*"
                    class="hidden"
                    #fileInput
                    (change)="onFileSelected($event)">
                  
                  @if (previewImage) {
                    <div class="relative inline-block">
                      <img 
                        [src]="previewImage" 
                        alt="Aperçu"
                        class="max-w-48 max-h-48 object-cover rounded-lg">
                      <button 
                        type="button"
                        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        (click)="removeImage()">
                        ×
                      </button>
                    </div>
                  } @else {
                    <div>
                      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <p class="text-gray-600 mb-2">Cliquez pour ajouter une photo</p>
                      <button 
                        type="button"
                        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                        (click)="fileInput.click()">
                        Choisir une photo
                      </button>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Étape 3: Pot et substrat -->
          @if (currentStep() === 3) {
            <div class="space-y-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Pot et substrat</h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Type de pot -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Type de pot
                  </label>
                  <select 
                    formControlName="potType"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="terracotta">🏺 Terre cuite</option>
                    <option value="plastic">🪣 Plastique</option>
                    <option value="ceramic">🏺 Céramique</option>
                    <option value="other">🪴 Autre</option>
                  </select>
                </div>

                <!-- Taille de pot -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Taille du pot
                  </label>
                  <input 
                    type="text"
                    formControlName="potSize"
                    placeholder="ex: 20cm de diamètre"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                </div>
              </div>

              <!-- Drainage -->
              <div>
                <label class="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    formControlName="drainage"
                    class="rounded border-gray-300 text-green-600 focus:ring-green-500">
                  <span class="text-sm text-gray-700">Le pot a des trous de drainage</span>
                </label>
              </div>

              <!-- Type de substrat -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Type de substrat
                </label>
                <input 
                  type="text"
                  formControlName="soil"
                  placeholder="ex: Terreau universel, mélange pour plantes tropicales..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              </div>
            </div>
          }

          <!-- Étape 4: Programmation et notes -->
          @if (currentStep() === 4) {
            <div class="space-y-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Programmation et notes</h3>

              <!-- Programme d'arrosage -->
              @if (selectedSpecies()) {
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 class="font-medium text-blue-900 mb-2">📅 Programme d'arrosage recommandé</h4>
                  <p class="text-blue-700 text-sm">
                    Basé sur l'espèce {{ selectedSpecies()!.name }}: 
                    <strong>tous les {{ selectedSpecies()!.wateringFrequency }} jours</strong>
                  </p>
                </div>
              }

              <!-- Personnaliser l'arrosage -->
              <div>
                <label class="flex items-center space-x-2 mb-4">
                  <input 
                    type="checkbox"
                    formControlName="customWateringSchedule"
                    class="rounded border-gray-300 text-green-600 focus:ring-green-500">
                  <span class="text-sm text-gray-700">Personnaliser la fréquence d'arrosage</span>
                </label>

                @if (plantForm.get('customWateringSchedule')?.value) {
                  <div class="ml-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Fréquence d'arrosage (en jours)
                    </label>
                    <input 
                      type="number"
                      formControlName="wateringFrequency"
                      min="1"
                      max="30"
                      placeholder="7"
                      class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <span class="text-sm text-gray-500 ml-2">jours</span>
                  </div>
                }
              </div>

              <!-- Notes -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Notes personnelles
                </label>
                <textarea 
                  formControlName="notes"
                  rows="4"
                  placeholder="Ajoutez vos observations, l'historique de la plante, des rappels particuliers..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none">
                </textarea>
              </div>

              <!-- Conseils d'entretien -->
              @if (selectedSpecies() && selectedSpecies()!.tips.length > 0) {
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 class="font-medium text-green-900 mb-2">💡 Conseils pour {{ selectedSpecies()!.name }}</h4>
                  <ul class="space-y-1">
                    @for (tip of selectedSpecies()!.tips; track tip) {
                      <li class="text-green-700 text-sm flex items-start gap-2">
                        <span class="text-green-500 mt-1">•</span>
                        <span>{{ tip }}</span>
                      </li>
                    }
                  </ul>
                </div>
              }
            </div>
          }
        </form>

        <!-- Footer avec actions -->
        <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              @if (currentStep() === 1) {
                @if (selectedSpeciesId) {
                  <span class="text-green-600">✓ Espèce sélectionnée</span>
                } @else {
                  <span>Sélectionnez une espèce pour continuer</span>
                }
              } @else {
                <button 
                  type="button"
                  class="text-gray-600 hover:text-gray-800 font-medium"
                  (click)="previousStep()">
                  ← Étape précédente
                </button>
              }
            </div>

            <div class="flex gap-3">
              <button 
                type="button"
                class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                (click)="closeModal()">
                Annuler
              </button>

              @if (currentStep() < totalSteps) {
                <button 
                  type="button"
                  class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  [disabled]="!canContinue()"
                  (click)="nextStep()">
                  Continuer →
                </button>
              } @else {
                <button 
                  type="button"
                  class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  [disabled]="!plantForm.valid"
                  (click)="onSubmit()">
                  <span class="flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Ajouter ma plante
                  </span>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./add-plant-modal.component.css']
})
export class AddPlantModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() plantAdded = new EventEmitter<NewPlant>();

  plantForm: FormGroup;
  currentStep = signal(1);
  totalSteps = 4;

  steps = [
    { id: 1, label: 'Espèce' },
    { id: 2, label: 'Informations' },
    { id: 3, label: 'Pot & Substrat' },
    { id: 4, label: 'Configuration' }
  ];

  // Données pour l'étape 1
  speciesSearch = '';
  selectedCategory = '';
  selectedSpeciesId = '';
  categories = ['Plantes d\'intérieur', 'Succulentes', 'Plantes tropicales', 'Fougères', 'Orchidées'];

  // Données mockées des espèces
  allSpecies: PlantSpecies[] = [
    {
      id: 's1',
      name: 'Monstera Deliciosa',
      scientificName: 'Monstera deliciosa',
      category: 'Plantes tropicales',
      difficulty: 'easy',
      lightRequirement: 'bright',
      wateringFrequency: 7,
      humidity: 60,
      temperature: { min: 18, max: 27 },
      description: 'Plante tropicale aux feuilles spectaculaires',
      image: '/assets/species/monstera.jpg',
      tips: [
        'Vaporisez régulièrement les feuilles',
        'Placez près d\'une fenêtre lumineuse',
        'Tuteurez les tiges qui grimpent'
      ]
    },
    {
      id: 's2',
      name: 'Pothos Doré',
      scientificName: 'Epipremnum aureum',
      category: 'Plantes d\'intérieur',
      difficulty: 'easy',
      lightRequirement: 'medium',
      wateringFrequency: 5,
      humidity: 40,
      temperature: { min: 16, max: 24 },
      description: 'Plante grimpante très facile d\'entretien',
      image: '/assets/species/pothos.jpg',
      tips: [
        'Très tolérant à la négligence',
        'Se propage facilement dans l\'eau',
        'Peut pousser dans des conditions de faible luminosité'
      ]
    },
    {
      id: 's3',
      name: 'Sansevieria',
      scientificName: 'Sansevieria trifasciata',
      category: 'Succulentes',
      difficulty: 'easy',
      lightRequirement: 'low',
      wateringFrequency: 14,
      humidity: 30,
      temperature: { min: 15, max: 30 },
      description: 'Plante graphique très résistante',
      image: '/assets/species/sansevieria.jpg',
      tips: [
        'Arrosez très peu en hiver',
        'Parfait pour les débutants',
        'Supporte très bien la négligence'
      ]
    }
    // Ajoutez plus d'espèces ici...
  ];

  filteredSpecies = signal<PlantSpecies[]>([]);
  selectedSpecies = signal<PlantSpecies | null>(null);

  // Image preview
  previewImage: string | null = null;

  constructor(private fb: FormBuilder) {
    this.plantForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      acquiredDate: [new Date().toISOString().split('T')[0]],
      size: ['medium'],
      potType: ['plastic'],
      potSize: [''],
      drainage: [true],
      soil: [''],
      customWateringSchedule: [false],
      wateringFrequency: [7],
      notes: ['']
    });

    this.filteredSpecies.set(this.allSpecies);
  }

  ngOnInit() {
    this.filterSpecies();
  }

  // Navigation entre étapes
  nextStep() {
    if (this.canContinue()) {
      this.currentStep.update(step => Math.min(step + 1, this.totalSteps));
    }
  }

  previousStep() {
    this.currentStep.update(step => Math.max(step - 1, 1));
  }

  canContinue(): boolean {
    switch (this.currentStep()) {
      case 1:
        return !!this.selectedSpeciesId;
      case 2:
        const nameControl = this.plantForm.get('name');
        const locationControl = this.plantForm.get('location');
        return (nameControl?.valid === true) && (locationControl?.valid === true);
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  }

  // Gestion des espèces
  filterSpecies() {
    let filtered = this.allSpecies;

    // Filtre par recherche
    if (this.speciesSearch) {
      const search = this.speciesSearch.toLowerCase();
      filtered = filtered.filter(species =>
        species.name.toLowerCase().includes(search) ||
        species.scientificName.toLowerCase().includes(search) ||
        species.category.toLowerCase().includes(search)
      );
    }

    // Filtre par catégorie
    if (this.selectedCategory) {
      filtered = filtered.filter(species => species.category === this.selectedCategory);
    }

    this.filteredSpecies.set(filtered);
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.filterSpecies();
  }

  selectSpecies(species: PlantSpecies) {
    this.selectedSpeciesId = species.id;
    this.selectedSpecies.set(species);

    // Pré-remplir le nom si vide
    if (!this.plantForm.get('name')?.value) {
      this.plantForm.patchValue({ name: species.name });
    }

    // Définir la fréquence d'arrosage par défaut
    this.plantForm.patchValue({
      wateringFrequency: species.wateringFrequency
    });
  }

  // Gestion des fichiers
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.previewImage = null;
  }

  // Soumission du formulaire
  onSubmit() {
    if (this.plantForm.valid && this.selectedSpecies()) {
      const formData = this.plantForm.value;
      const newPlant: NewPlant = {
        name: formData.name,
        speciesId: this.selectedSpeciesId,
        location: formData.location,
        acquiredDate: new Date(formData.acquiredDate),
        size: formData.size,
        pot: {
          type: formData.potType,
          size: formData.potSize,
          drainage: formData.drainage
        },
        soil: formData.soil,
        notes: formData.notes,
        customWateringSchedule: formData.customWateringSchedule,
        wateringFrequency: formData.customWateringSchedule ?
          formData.wateringFrequency :
          this.selectedSpecies()!.wateringFrequency,
        image: this.previewImage || undefined
      };

      this.plantAdded.emit(newPlant);
      this.closeModal();
    }
  }

  // Gestion de la modal
  closeModal(event?: Event) {
    if (event && event.target !== event.currentTarget) {
      return;
    }

    this.close.emit();
    this.resetForm();
  }

  resetForm() {
    this.currentStep.set(1);
    this.plantForm.reset({
      acquiredDate: new Date().toISOString().split('T')[0],
      size: 'medium',
      potType: 'plastic',
      drainage: true,
      customWateringSchedule: false,
      wateringFrequency: 7
    });
    this.selectedSpeciesId = '';
    this.selectedSpecies.set(null);
    this.speciesSearch = '';
    this.selectedCategory = '';
    this.previewImage = null;
    this.filterSpecies();
  }

  // Classes CSS utilitaires
  getStepClass(step: number): string {
    if (step < this.currentStep()) {
      return 'bg-green-600 border-green-600 text-white';
    } else if (step === this.currentStep()) {
      return 'bg-green-600 border-green-600 text-white';
    } else {
      return 'bg-white border-gray-300 text-gray-400';
    }
  }

  getDifficultyClass(difficulty: string): string {
    const classes = {
      'easy': 'bg-green-100 text-green-700',
      'medium': 'bg-yellow-100 text-yellow-700',
      'hard': 'bg-red-100 text-red-700'
    };
    return classes[difficulty as keyof typeof classes];
  }

  getDifficultyLabel(difficulty: string): string {
    const labels = {
      'easy': 'Facile',
      'medium': 'Moyen',
      'hard': 'Difficile'
    };
    return labels[difficulty as keyof typeof labels];
  }

  getLightLabel(light: string): string {
    const labels = {
      'low': 'Peu de lumière',
      'medium': 'Lumière modérée',
      'bright': 'Lumière vive',
      'direct': 'Soleil direct'
    };
    return labels[light as keyof typeof labels];
  }
}
