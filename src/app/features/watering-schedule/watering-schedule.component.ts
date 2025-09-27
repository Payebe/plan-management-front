import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface WateringEvent {
  id: string;
  plantId: string;
  plantName: string;
  scheduledDate: Date;
  completed: boolean;
  completedDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: WateringEvent[];
}

@Component({
  selector: 'app-watering-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <!-- Header Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-sm">
              <span class="text-3xl">💧</span>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Planning d'Arrosage</h1>
              <p class="text-gray-600">Organisez et suivez vos sessions d'arrosage</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button 
              class="group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 shadow-sm hover:shadow-md hover:scale-[1.02] font-medium"
              (click)="showTodayView = !showTodayView">
              <svg class="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 9l2 2 4-4"/>
              </svg>
              {{ showTodayView ? 'Voir Calendrier' : 'Vue Aujourd\'hui' }}
            </button>
            <button 
              class="group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 shadow-sm hover:shadow-md hover:scale-[1.02] font-medium"
              (click)="openScheduleModal()">
              <svg class="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Programmer
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-red-200 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">En retard</p>
              <p class="text-3xl font-bold text-gray-900">{{ overdueEvents().length }}</p>
              <p class="text-xs text-red-600 font-medium mt-2 flex items-center gap-1">
                <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Action urgente
              </p>
            </div>
            <div class="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="text-2xl">⚠️</span>
            </div>
          </div>
        </div>

        <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-orange-200 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Aujourd'hui</p>
              <p class="text-3xl font-bold text-gray-900">{{ todayEvents().length }}</p>
              <p class="text-xs text-orange-600 font-medium mt-2">📅 Programmés</p>
            </div>
            <div class="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-amber-200 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Cette semaine</p>
              <p class="text-3xl font-bold text-gray-900">{{ thisWeekEvents().length }}</p>
              <p class="text-xs text-amber-600 font-medium mt-2">🗓️ À venir</p>
            </div>
            <div class="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="text-2xl">🗓️</span>
            </div>
          </div>
        </div>

        <div class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-green-200 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Complétés</p>
              <p class="text-3xl font-bold text-gray-900">{{ completedThisWeek().length }}</p>
              <p class="text-xs text-green-600 font-medium mt-2">✅ Cette semaine</p>
            </div>
            <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span class="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue conditionnelle : Today vs Calendar -->
      @if (showTodayView) {
        <!-- Vue Aujourd'hui -->
        <div class="space-y-6">
          <!-- Arrosages en retard -->
          @if (overdueEvents().length > 0) {
            <div class="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                  <span class="text-white text-lg animate-pulse">⚠️</span>
                </div>
                <div>
                  <h2 class="text-xl font-bold text-red-800">Arrosages en retard</h2>
                  <p class="text-red-600 text-sm">{{ overdueEvents().length }} plante(s) nécessitent une attention immédiate</p>
                </div>
              </div>
              <div class="space-y-4">
                @for (event of overdueEvents(); track event.id) {
                  <div class="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-red-200 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div class="flex items-center gap-4">
                      <div class="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
                      <div>
                        <p class="font-semibold text-gray-900">{{ event.plantName }}</p>
                        <p class="text-sm text-red-700 font-medium">
                          Prévu le {{ formatDate(event.scheduledDate) }} 
                          <span class="bg-red-100 px-2 py-0.5 rounded-full text-xs ml-2">
                            {{ getDaysLate(event.scheduledDate) }} jour(s) de retard
                          </span>
                        </p>
                      </div>
                    </div>
                    <button 
                      class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-xl transition-all duration-200 font-medium hover:scale-105 shadow-sm"
                      (click)="completeWatering(event.id)">
                      💧 Arroser maintenant
                    </button>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Arrosages du jour -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div class="p-6 border-b border-gray-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span class="text-blue-600 text-lg">📅</span>
                </div>
                <div>
                  <h2 class="text-xl font-bold text-gray-900">Arrosages d'aujourd'hui</h2>
                  <p class="text-gray-600 text-sm">{{ todayEvents().length }} tâche(s) programmée(s)</p>
                </div>
              </div>
            </div>
            <div class="p-6">
              @if (todayEvents().length === 0) {
                <div class="text-center py-12">
                  <div class="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span class="text-4xl">🎉</span>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Journée libre !</h3>
                  <p class="text-gray-600">Aucun arrosage prévu aujourd'hui. Profitez-en pour observer vos plantes.</p>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (event of todayEvents(); track event.id) {
                    <div 
                      class="group p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md"
                      [class.bg-gray-50]="event.completed"
                      [class.border-gray-200]="event.completed"
                      [class.bg-blue-50]="!event.completed"
                      [class.border-blue-200]="!event.completed"
                      [class.hover:border-blue-300]="!event.completed"
                      [class.hover:bg-blue-100]="!event.completed">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                          <div 
                            class="w-4 h-4 rounded-full transition-all"
                            [class.bg-gray-400]="event.completed"
                            [class.bg-blue-500]="!event.completed"
                            [class.animate-pulse]="!event.completed">
                          </div>
                          <div>
                            <p 
                              class="font-semibold transition-all"
                              [class.text-gray-500]="event.completed"
                              [class.line-through]="event.completed"
                              [class.text-gray-900]="!event.completed">
                              {{ event.plantName }}
                            </p>
                            <div class="flex items-center gap-2 mt-1">
                              <span class="text-xs px-2 py-1 rounded-full font-medium" [class]="getPriorityBadgeClass(event.priority)">
                                {{ getPriorityLabel(event.priority) }}
                              </span>
                              @if (event.completed && event.completedDate) {
                                <span class="text-xs text-green-600 font-medium">
                                  ✅ Arrosé à {{ formatTime(event.completedDate) }}
                                </span>
                              }
                            </div>
                          </div>
                        </div>
                        @if (!event.completed) {
                          <button 
                            class="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-2 rounded-xl transition-all duration-200 font-medium hover:scale-105 shadow-sm group-hover:shadow-md"
                            (click)="completeWatering(event.id)">
                            ✓ Terminé
                          </button>
                        } @else {
                          <div class="flex items-center gap-2 text-green-600 font-medium">
                            <span class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">✓</span>
                            Terminé
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <!-- Vue Calendrier -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
          <!-- Header du calendrier -->
          <div class="flex items-center justify-between p-6 border-b border-gray-100">
            <button 
              class="group p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105"
              (click)="previousMonth()">
              <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            
            <div class="text-center">
              <h2 class="text-2xl font-bold text-gray-900">{{ getMonthYear() }}</h2>
              <p class="text-sm text-gray-600 mt-1">{{ getTotalEventsForMonth() }} événement(s) ce mois</p>
            </div>
            
            <button 
              class="group p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105"
              (click)="nextMonth()">
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <!-- Grille du calendrier -->
          <div class="p-6">
            <!-- En-têtes des jours -->
            <div class="grid grid-cols-7 gap-2 mb-4">
              @for (day of ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']; track day) {
                <div class="p-3 text-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg">
                  {{ day }}
                </div>
              }
            </div>

            <!-- Jours du calendrier -->
            <div class="grid grid-cols-7 gap-2">
              @for (day of calendarDays(); track day.date.getTime()) {
                <div 
                  class="min-h-[120px] p-3 border-2 rounded-xl relative transition-all duration-200 hover:shadow-sm cursor-pointer"
                  [class.bg-gray-50]="!day.isCurrentMonth"
                  [class.border-gray-200]="!day.isToday && !day.events.length"
                  [class.border-blue-400]="day.isToday"
                  [class.bg-blue-50]="day.isToday"
                  [class.border-emerald-200]="day.events.length && !day.isToday"
                  [class.hover:border-blue-300]="!day.isToday">
                  
                  <!-- Numéro du jour -->
                  <div 
                    class="text-sm font-semibold mb-2 flex items-center justify-between"
                    [class.text-gray-400]="!day.isCurrentMonth"
                    [class.text-blue-600]="day.isToday"
                    [class.text-gray-900]="day.isCurrentMonth && !day.isToday">
                    {{ day.date.getDate() }}
                    @if (day.events.length > 0) {
                      <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    }
                  </div>

                  <!-- Événements du jour -->
                  <div class="space-y-1">
                    @for (event of day.events.slice(0, 2); track event.id) {
                      <div 
                        class="text-xs px-2 py-1.5 rounded-lg cursor-pointer truncate font-medium transition-all duration-200 hover:scale-105"
                        [class]="getEventClass(event)"
                        [title]="event.plantName + (event.completed ? ' (Terminé)' : '')"
                        (click)="selectEvent(event)">
                        <span class="mr-1">{{ getEventEmoji(event) }}</span>
                        {{ event.plantName }}
                        @if (event.completed) {
                          <span class="ml-1">✓</span>
                        }
                      </div>
                    }
                    @if (day.events.length > 2) {
                      <div class="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-lg font-medium">
                        +{{ day.events.length - 2 }} autre(s)
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Résumé de performance (affiché uniquement en vue aujourd'hui) -->
      @if (showTodayView && (todayEvents().length > 0 || overdueEvents().length > 0)) {
        <div class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span class="text-2xl">🎯</span>
              </div>
              <p class="text-sm text-gray-600">Taux de réussite</p>
              <p class="text-2xl font-bold text-emerald-600">{{ getCompletionRate() }}%</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span class="text-2xl">⏰</span>
              </div>
              <p class="text-sm text-gray-600">Prochaine session</p>
              <p class="text-lg font-bold text-blue-600">{{ getNextSessionTime() }}</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span class="text-2xl">📊</span>
              </div>
              <p class="text-sm text-gray-600">Tendance hebdomadaire</p>
              <p class="text-lg font-bold text-purple-600">{{ getWeeklyTrend() }}</p>
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
    .space-y-1 > * + * { margin-top: 0.25rem; }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class WateringScheduleComponent implements OnInit {
  showTodayView = true;
  currentDate = signal(new Date());

  // Données mockées - à remplacer par un service
  events = signal<WateringEvent[]>([
    {
      id: '1',
      plantId: 'p1',
      plantName: 'Monstera Deliciosa',
      scheduledDate: new Date(2024, 11, 20), // Hier (en retard)
      completed: false,
      priority: 'urgent'
    },
    {
      id: '2',
      plantId: 'p2',
      plantName: 'Ficus Benjamin',
      scheduledDate: new Date(), // Aujourd'hui
      completed: false,
      priority: 'high'
    },
    {
      id: '3',
      plantId: 'p3',
      plantName: 'Pothos',
      scheduledDate: new Date(), // Aujourd'hui
      completed: true,
      completedDate: new Date(2024, 11, 21, 9, 30),
      priority: 'medium'
    },
    {
      id: '4',
      plantId: 'p4',
      plantName: 'Sansevieria',
      scheduledDate: new Date(2024, 11, 23), // Dans 2 jours
      completed: false,
      priority: 'low'
    },
    {
      id: '5',
      plantId: 'p5',
      plantName: 'Philodendron',
      scheduledDate: new Date(2024, 11, 25), // Dans 4 jours
      completed: false,
      priority: 'medium'
    }
  ]);

  // Computed values
  todayEvents = computed(() => {
    const today = new Date();
    return this.events().filter(event => this.isSameDay(event.scheduledDate, today));
  });

  overdueEvents = computed(() => {
    const today = new Date();
    return this.events().filter(event =>
      event.scheduledDate < today && !event.completed
    );
  });

  thisWeekEvents = computed(() => {
    const today = new Date();
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);

    return this.events().filter(event =>
      event.scheduledDate >= today &&
      event.scheduledDate <= weekEnd &&
      !event.completed
    );
  });

  completedThisWeek = computed(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const today = new Date();

    return this.events().filter(event =>
      event.completed &&
      event.completedDate &&
      event.completedDate >= weekStart &&
      event.completedDate <= today
    );
  });

  calendarDays = computed(() => {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();

    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);

    // Début de la semaine (dimanche précédent)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Fin de la semaine (samedi suivant)
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    const today = new Date();

    while (current <= endDate) {
      const dayEvents = this.events().filter(event =>
        this.isSameDay(event.scheduledDate, current)
      );

      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: this.isSameDay(current, today),
        events: dayEvents
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  });

  ngOnInit() { }

  // Navigation du calendrier
  previousMonth() {
    this.currentDate.update(date => {
      const newDate = new Date(date);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }

  nextMonth() {
    this.currentDate.update(date => {
      const newDate = new Date(date);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }

  getMonthYear(): string {
    return this.currentDate().toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  }

  getTotalEventsForMonth(): number {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();

    return this.events().filter(event =>
      event.scheduledDate.getFullYear() === year &&
      event.scheduledDate.getMonth() === month
    ).length;
  }

  // Actions
  completeWatering(eventId: string) {
    this.events.update(events =>
      events.map(event =>
        event.id === eventId
          ? { ...event, completed: true, completedDate: new Date() }
          : event
      )
    );
  }

  openScheduleModal() {
    console.log('Ouvrir modal de programmation');
    // TODO: Implémenter le modal
  }

  selectEvent(event: WateringEvent) {
    console.log('Event sélectionné:', event);
    // TODO: Ouvrir détails/édition de l'événement
  }

  // Utilitaires
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR');
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDaysLate(scheduledDate: Date): number {
    const today = new Date();
    const diffTime = today.getTime() - scheduledDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getPriorityLabel(priority: WateringEvent['priority']): string {
    const labels = {
      'low': 'Faible',
      'medium': 'Moyenne',
      'high': 'Haute',
      'urgent': 'Urgente'
    };
    return labels[priority];
  }

  getPriorityBadgeClass(priority: WateringEvent['priority']): string {
    const classes = {
      'low': 'bg-green-100 text-green-700',
      'medium': 'bg-amber-100 text-amber-700',
      'high': 'bg-orange-100 text-orange-700',
      'urgent': 'bg-red-100 text-red-700'
    };
    return classes[priority];
  }

  getEventEmoji(event: WateringEvent): string {
    if (event.completed) return '✅';
    if (event.scheduledDate < new Date()) return '⚠️';
    return '💧';
  }

  getEventClass(event: WateringEvent): string {
    if (event.completed) {
      return 'bg-gray-100/80 text-gray-600 border border-gray-200';
    }

    const today = new Date();
    if (event.scheduledDate < today) {
      return 'bg-red-100/80 text-red-700 border border-red-300'; // En retard
    }

    if (this.isSameDay(event.scheduledDate, today)) {
      return 'bg-blue-100/80 text-blue-700 border border-blue-300'; // Aujourd'hui
    }

    switch (event.priority) {
      case 'urgent':
        return 'bg-red-50/80 text-red-600 border border-red-200';
      case 'high':
        return 'bg-orange-50/80 text-orange-600 border border-orange-200';
      case 'medium':
        return 'bg-amber-50/80 text-amber-600 border border-amber-200';
      case 'low':
        return 'bg-emerald-50/80 text-emerald-600 border border-emerald-200';
      default:
        return 'bg-gray-50/80 text-gray-600 border border-gray-200';
    }
  }

  // Méthodes pour les statistiques de performance
  getCompletionRate(): number {
    const totalEvents = this.events().length;
    if (totalEvents === 0) return 0;
    const completed = this.events().filter(event => event.completed).length;
    return Math.round((completed / totalEvents) * 100);
  }

  getNextSessionTime(): string {
    const upcomingEvents = this.events()
      .filter(event => event.scheduledDate > new Date() && !event.completed)
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());

    if (upcomingEvents.length === 0) return 'Aucune';

    const nextEvent = upcomingEvents[0];
    const diffTime = nextEvent.scheduledDate.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Demain';
    return `Dans ${diffDays} jours`;
  }

  getWeeklyTrend(): string {
    const thisWeekCompleted = this.completedThisWeek().length;
    const thisWeekTotal = this.thisWeekEvents().length + thisWeekCompleted;

    if (thisWeekTotal === 0) return 'Stable';

    const rate = (thisWeekCompleted / thisWeekTotal) * 100;

    if (rate >= 80) return '📈 Excellent';
    if (rate >= 60) return '📊 Bon';
    if (rate >= 40) return '📉 Moyen';
    return '🔻 À améliorer';
  }
}