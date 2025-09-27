import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Notification {
  id: string;
  type: 'watering' | 'health' | 'fertilizing' | 'repotting' | 'general';
  title: string;
  message: string;
  plantId?: string;
  plantName?: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionRequired?: boolean;
  actionUrl?: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div class="max-w-4xl mx-auto px-4 py-8">
        <!-- Header moderne -->
        <div class="mb-8">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div class="space-y-2">
              <h1 class="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                Notifications
              </h1>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span class="text-sm font-medium text-slate-600">{{ unreadCount() }} nouvelles</span>
                </div>
                <div class="w-1 h-1 bg-slate-300 rounded-full"></div>
                <span class="text-sm text-slate-500">{{ notifications().length }} au total</span>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <button 
                class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow"
                (click)="markAllAsRead()"
                [disabled]="unreadCount() === 0"
                [class.opacity-50]="unreadCount() === 0"
                [class.cursor-not-allowed]="unreadCount() === 0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Tout lire
              </button>
              <button 
                class="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow"
                (click)="clearAllRead()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7"/>
                </svg>
                Nettoyer
              </button>
            </div>
          </div>
        </div>

        <!-- Filtres épurés -->
        <div class="mb-8">
          <div class="bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
            <div class="flex flex-wrap gap-1">
              <button 
                class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap"
                [class]="activeFilter() === 'all' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
                (click)="setFilter('all')">
                Toutes <span class="ml-1 text-xs opacity-75">({{ notifications().length }})</span>
              </button>
              <button 
                class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap"
                [class]="activeFilter() === 'unread' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
                (click)="setFilter('unread')">
                Non lues <span class="ml-1 text-xs opacity-75">({{ unreadNotifications().length }})</span>
              </button>
              <button 
                class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap"
                [class]="activeFilter() === 'urgent' 
                  ? 'bg-red-500 text-white shadow-sm' 
                  : 'text-red-600 hover:text-red-700 hover:bg-red-50'"
                (click)="setFilter('urgent')">
                Urgentes <span class="ml-1 text-xs opacity-75">({{ urgentNotifications().length }})</span>
              </button>
              <button 
                class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1.5"
                [class]="activeFilter() === 'watering' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
                (click)="setFilter('watering')">
                <span class="text-sm">💧</span>
                Arrosage <span class="ml-1 text-xs opacity-75">({{ wateringNotifications().length }})</span>
              </button>
              <button 
                class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1.5"
                [class]="activeFilter() === 'health' 
                  ? 'bg-green-500 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
                (click)="setFilter('health')">
                <span class="text-sm">🌿</span>
                Santé <span class="ml-1 text-xs opacity-75">({{ healthNotifications().length }})</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Liste des notifications -->
        <div class="space-y-3">
          @if (filteredNotifications().length === 0) {
            <div class="text-center py-16">
              <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-5 5v-5zM9 7V4a1 1 0 00-1-1H6a1 1 0 00-1 1v3M5 7h4m0 0v12a2 2 0 002 2h6a2 2 0 002-2V7m-10 0V6a2 2 0 012-2h6a2 2 0 012 2v1"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-slate-900 mb-2">Aucune notification</h3>
              <p class="text-slate-500 max-w-sm mx-auto">
                @if (activeFilter() === 'all') {
                  Vous êtes à jour ! Aucune notification pour le moment.
                } @else {
                  Aucune notification ne correspond à ce filtre.
                }
              </p>
            </div>
          } @else {
            @for (notification of filteredNotifications(); track notification.id) {
              <div 
                class="group relative bg-white rounded-2xl transition-all duration-300 hover:shadow-lg border"
                [class.shadow-sm]="notification.read"
                [class.shadow-md]="!notification.read"
                [class.border-slate-200]="notification.read"
                [class.border-blue-200]="!notification.read"
                [class.bg-gradient-to-r]="!notification.read"
                [class.from-white]="!notification.read"
                [class.to-blue-50/30]="!notification.read">

                <!-- Indicateur de priorité -->
                <div class="absolute left-0 top-6 w-1 h-12 rounded-r-full"
                     [class.bg-red-400]="notification.priority === 'urgent'"
                     [class.bg-orange-400]="notification.priority === 'high'"
                     [class.bg-yellow-400]="notification.priority === 'medium'"
                     [class.bg-green-400]="notification.priority === 'low'">
                </div>

                <div class="p-6 pl-8">
                  <div class="flex items-start justify-between gap-4">
                    <!-- Contenu principal -->
                    <div class="flex-1 min-w-0">
                      <!-- Header avec icône et titre -->
                      <div class="flex items-start gap-3 mb-3">
                        <!-- Icône du type -->
                        <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                             [class.bg-blue-100]="notification.type === 'watering'"
                             [class.bg-green-100]="notification.type === 'health'"
                             [class.bg-yellow-100]="notification.type === 'fertilizing'"
                             [class.bg-purple-100]="notification.type === 'repotting'"
                             [class.bg-slate-100]="notification.type === 'general'">
                          <span class="text-lg">
                            @switch (notification.type) {
                              @case ('watering') {💧}
                              @case ('health') {🌿}
                              @case ('fertilizing') {🌱}
                              @case ('repotting') {🪴}
                              @default {🔔}
                            }
                          </span>
                        </div>

                        <div class="flex-1 min-w-0">
                          <!-- Titre et badges -->
                          <div class="flex items-center gap-2 mb-2">
                            <h3 class="font-semibold text-slate-900 truncate" 
                                [class.text-slate-600]="notification.read">
                              {{ notification.title }}
                            </h3>
                            
                            @if (notification.actionRequired) {
                              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                Action requise
                              </span>
                            }
                            
                            @if (!notification.read) {
                              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                            }
                          </div>

                          <!-- Message -->
                          <p class="text-sm text-slate-600 mb-3 leading-relaxed">
                            {{ notification.message }}
                          </p>

                          <!-- Informations additionnelles -->
                          <div class="flex items-center gap-4 text-xs">
                            @if (notification.plantName) {
                              <div class="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c1.1 0 2 .9 2 2v1M9 21h6c1.1 0 2-.9 2-2V9a1.99 1.99 0 00-2-2h-1"/>
                                </svg>
                                <span class="font-medium">{{ notification.plantName }}</span>
                              </div>
                            }
                            
                            <span class="text-slate-500 font-medium">
                              {{ formatRelativeTime(notification.timestamp) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      @if (notification.actionRequired && notification.actionUrl) {
                        <button 
                          class="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                          (click)="handleAction(notification)">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4"/>
                          </svg>
                          Action
                        </button>
                      }

                      <button 
                        class="p-2 rounded-lg transition-all hover:scale-105"
                        [class.text-slate-400]="notification.read"
                        [class.hover:bg-slate-100]="notification.read"
                        [class.text-blue-500]="!notification.read"
                        [class.hover:bg-blue-50]="!notification.read"
                        [title]="notification.read ? 'Marquer comme non lu' : 'Marquer comme lu'"
                        (click)="toggleRead(notification.id)">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          @if (notification.read) {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          } @else {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          }
                        </svg>
                      </button>

                      <button 
                        class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-105"
                        title="Supprimer"
                        (click)="deleteNotification(notification.id)">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          }
        </div>

        <!-- Pagination moderne -->
        @if (filteredNotifications().length > 10) {
          <div class="flex justify-center mt-8">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-3">
              <span class="text-sm text-slate-600 font-medium">
                Affichage de <span class="text-slate-900">{{ Math.min(filteredNotifications().length, 10) }}</span> 
                sur <span class="text-slate-900">{{ filteredNotifications().length }}</span> notifications
              </span>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  activeFilter = signal<string>('all');

  // Données mockées - à remplacer par un service
  notifications = signal<Notification[]>([
    {
      id: '1',
      type: 'watering',
      title: 'Arrosage en retard',
      message: 'Votre Monstera Deliciosa devait être arrosée il y a 2 jours.',
      plantId: 'p1',
      plantName: 'Monstera Deliciosa',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: false,
      priority: 'urgent',
      actionRequired: true,
      actionUrl: '/watering-schedule'
    },
    {
      id: '2',
      type: 'health',
      title: 'Problème de santé détecté',
      message: 'Les feuilles de votre Ficus Benjamin jaunissent. Vérifiez l\'arrosage et l\'exposition.',
      plantId: 'p2',
      plantName: 'Ficus Benjamin',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: false,
      priority: 'high',
      actionRequired: true,
      actionUrl: '/plants/p2'
    },
    {
      id: '3',
      type: 'watering',
      title: 'Arrosage programmé',
      message: 'Il est temps d\'arroser votre Pothos.',
      plantId: 'p3',
      plantName: 'Pothos',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      read: false,
      priority: 'medium',
      actionRequired: true,
      actionUrl: '/watering-schedule'
    },
    {
      id: '4',
      type: 'fertilizing',
      title: 'Fertilisation recommandée',
      message: 'Votre Sansevieria n\'a pas été fertilisée depuis 3 mois.',
      plantId: 'p4',
      plantName: 'Sansevieria',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      read: true,
      priority: 'low'
    },
    {
      id: '5',
      type: 'general',
      title: 'Mise à jour de l\'application',
      message: 'Une nouvelle version de Plant Manager est disponible avec de nouvelles fonctionnalités.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      priority: 'low'
    },
    {
      id: '6',
      type: 'repotting',
      title: 'Rempotage suggéré',
      message: 'Votre Philodendron seems to be outgrowing its current pot.',
      plantId: 'p5',
      plantName: 'Philodendron',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      read: false,
      priority: 'medium'
    }
  ]);

  // Computed properties
  unreadCount = computed(() =>
    this.notifications().filter(n => !n.read).length
  );

  unreadNotifications = computed(() =>
    this.notifications().filter(n => !n.read)
  );

  urgentNotifications = computed(() =>
    this.notifications().filter(n => n.priority === 'urgent')
  );

  wateringNotifications = computed(() =>
    this.notifications().filter(n => n.type === 'watering')
  );

  healthNotifications = computed(() =>
    this.notifications().filter(n => n.type === 'health')
  );

  filteredNotifications = computed(() => {
    const filter = this.activeFilter();
    const allNotifs = this.notifications();

    switch (filter) {
      case 'unread':
        return allNotifs.filter(n => !n.read);
      case 'urgent':
        return allNotifs.filter(n => n.priority === 'urgent');
      case 'watering':
        return allNotifs.filter(n => n.type === 'watering');
      case 'health':
        return allNotifs.filter(n => n.type === 'health');
      default:
        return allNotifs;
    }
  });

  Math: any;

  ngOnInit() { }

  // Actions
  setFilter(filter: string) {
    this.activeFilter.set(filter);
  }

  toggleRead(notificationId: string) {
    this.notifications.update(notifications =>
      notifications.map(n =>
        n.id === notificationId ? { ...n, read: !n.read } : n
      )
    );
  }

  markAllAsRead() {
    this.notifications.update(notifications =>
      notifications.map(n => ({ ...n, read: true }))
    );
  }

  clearAllRead() {
    this.notifications.update(notifications =>
      notifications.filter(n => !n.read)
    );
  }

  deleteNotification(notificationId: string) {
    this.notifications.update(notifications =>
      notifications.filter(n => n.id !== notificationId)
    );
  }

  handleAction(notification: Notification) {
    console.log('Action pour notification:', notification);
    // TODO: Navigation vers l'URL d'action
    if (notification.actionUrl) {
      // this.router.navigate([notification.actionUrl]);
    }
    // Marquer comme lue après action
    this.toggleRead(notification.id);
  }

  // Utilitaires
  getPriorityLabel(priority: Notification['priority']): string {
    const labels = {
      'low': 'Faible',
      'medium': 'Moyenne',
      'high': 'Haute',
      'urgent': 'Urgente'
    };
    return labels[priority];
  }

  getPriorityBadgeClass(priority: Notification['priority']): string {
    const classes = {
      'low': 'bg-green-100 text-green-700',
      'medium': 'bg-yellow-100 text-yellow-700',
      'high': 'bg-orange-100 text-orange-700',
      'urgent': 'bg-red-100 text-red-700'
    };
    return classes[priority];
  }

  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `il y a ${Math.floor(diffInSeconds / 86400)}j`;

    return date.toLocaleDateString('fr-FR');
  }

  formatDateTime(date: Date): string {
    return date.toLocaleString('fr-FR');
  }
}
