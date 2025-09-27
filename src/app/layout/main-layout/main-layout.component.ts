import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHouse, faSeedling, faDroplet, faBook, faBell, faUser, faSignOutAlt, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
    label: string;
    icon: any;
    route: string;
    badge?: number;
}

interface UserInfo {
    name: string;
    email: string;
    avatar?: string;
}

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, FontAwesomeModule],
    template: `
    <div class="min-h-screen flex bg-gray-50">
      <!-- Sidebar -->
      <aside
        [ngClass]="{
          'w-72': isSidebarOpen && !isMobile,
          'w-72 fixed top-0 left-0 h-full z-50': isSidebarOpen && isMobile,
          'w-0': !isSidebarOpen && isMobile,
          'w-20': isCollapsed && !isMobile
        }"
        class="bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden shadow-sm"
      >
        <div class="flex flex-col h-full">
          <!-- Logo & Toggle -->
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center space-x-3" [ngClass]="{'justify-center': isCollapsed}">
              <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                <fa-icon [icon]="faSeedling" class="text-white text-lg"></fa-icon>
              </div>
              <div *ngIf="!isCollapsed" class="flex flex-col">
                <h1 class="text-xl font-bold text-gray-900">PlantCare</h1>
                <p class="text-xs text-gray-500">Gestionnaire de plantes</p>
              </div>
            </div>
            <button
              *ngIf="!isMobile"
              (click)="toggleCollapse()"
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              <fa-icon [icon]="isCollapsed ? faChevronRight : faChevronLeft" class="text-sm"></fa-icon>
            </button>
          </div>

          <!-- Menu -->
          <nav class="flex-1 px-4 py-6">
            <ul class="space-y-2">
              <li *ngFor="let item of menuItems">
                <a
                  [routerLink]="item.route"
                  (click)="navigate(item.route)"
                  routerLinkActive="bg-emerald-50 text-emerald-700 border-emerald-200"
                  [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
                  class="group flex items-center px-3 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-100 relative"
                  [ngClass]="{'justify-center': isCollapsed, 'px-4': !isCollapsed}"
                >
                  <div class="flex items-center justify-center w-10 h-10 rounded-lg group-hover:scale-105 transition-transform">
                    <fa-icon [icon]="item.icon" class="text-gray-600 group-hover:text-emerald-600"></fa-icon>
                  </div>
                  <div *ngIf="!isCollapsed" class="ml-3 flex-1 flex items-center justify-between">
                    <span class="font-medium text-gray-700 group-hover:text-gray-900">{{ item.label }}</span>
                    <span
                      *ngIf="item.badge"
                      class="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm"
                    >
                      {{ item.badge }}
                    </span>
                  </div>
                  <!-- Tooltip pour mode collapsed -->
                  <div *ngIf="isCollapsed" class="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {{ item.label }}
                    <span *ngIf="item.badge" class="ml-2 bg-red-500 px-1.5 py-0.5 rounded-full text-xs">{{ item.badge }}</span>
                  </div>
                </a>
              </li>
            </ul>
          </nav>

          <!-- User Section -->
          <div class="border-t border-gray-100 p-4">
            <div class="flex items-center space-x-3" [ngClass]="{'justify-center': isCollapsed}">
              <div class="relative">
                <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center font-semibold shadow-sm">
                  {{ getUserInitials() }}
                </div>
                <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div *ngIf="!isCollapsed" class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ userInfo.name }}</p>
                <p class="text-xs text-gray-500 truncate">{{ userInfo.email }}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
          <!-- Toggle Sidebar Button -->
          <button
            *ngIf="isMobile"
            (click)="toggleSidebar()"
            class="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none transition-colors"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          <!-- Page Title -->
          <div *ngIf="!isMobile" class="flex-1">
            <h2 class="text-2xl font-bold text-gray-900">{{ getPageTitle() }}</h2>
            <p class="text-sm text-gray-500 mt-1">{{ getPageDescription() }}</p>
          </div>

          <!-- User Actions -->
          <div class="flex items-center space-x-3">
            <!-- Notifications -->
            <button class="relative p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
              <fa-icon [icon]="faBell" class="text-lg"></fa-icon>
              <span *ngIf="notificationsBadge" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                {{ notificationsBadge }}
              </span>
            </button>

            <!-- User Dropdown -->
            <div class="relative user-dropdown-container">
              <button
                (click)="toggleUserDropdown()"
                class="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none"
              >
                <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-lg flex items-center justify-center font-medium shadow-sm">
                  {{ getUserInitials() }}
                </div>
                <div class="hidden md:block text-left">
                  <p class="text-sm font-semibold text-gray-900">{{ userInfo.name }}</p>
                  <p class="text-xs text-gray-500">En ligne</p>
                </div>
              </button>
              
              <!-- Dropdown Menu -->
              <div
                *ngIf="isUserDropdownOpen"
                class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20 transform transition-all duration-200"
              >
                <div class="px-4 py-3 border-b border-gray-100">
                  <p class="text-sm font-semibold text-gray-900">{{ userInfo.name }}</p>
                  <p class="text-xs text-gray-500">{{ userInfo.email }}</p>
                </div>
                
                <a
                  (click)="navigateToProfile()"
                  class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <fa-icon [icon]="faUser" class="mr-3 text-gray-400"></fa-icon>
                  Mon Profil
                </a>
                
                <a
                  (click)="navigateToNotifications()"
                  class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <fa-icon [icon]="faBell" class="mr-3 text-gray-400"></fa-icon>
                  Notifications
                  <span
                    *ngIf="notificationsBadge"
                    class="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full"
                  >
                    {{ notificationsBadge }}
                  </span>
                </a>
                
                <hr class="my-2 border-gray-100">
                
                <a
                  (click)="logout()"
                  class="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <fa-icon [icon]="faSignOutAlt" class="mr-3"></fa-icon>
                  Se déconnecter
                </a>
              </div>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="flex-1 p-6 bg-gray-50">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Mobile Overlay -->
      <div
        *ngIf="isMobile && isSidebarOpen"
        (click)="closeSidebar()"
        class="fixed inset-0 bg-black bg-opacity-25 z-40 backdrop-blur-sm"
      ></div>
    </div>
  `,
    styles: [
        `
      @media (max-width: 767px) {
        aside {
          transform: translateX(-100%);
        }
        aside.w-72 {
          transform: translateX(0);
        }
      }
      
      /* Scrollbar styling */
      ::-webkit-scrollbar {
        width: 4px;
      }
      
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #e5e7eb;
        border-radius: 2px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #d1d5db;
      }
    `,
    ],
})
export class MainLayoutComponent implements OnInit {
    faHouse = faHouse;
    faSeedling = faSeedling;
    faDroplet = faDroplet;
    faBook = faBook;
    faBell = faBell;
    faUser = faUser;
    faSignOutAlt = faSignOutAlt;
    faChevronLeft = faChevronLeft;
    faChevronRight = faChevronRight;

    isSidebarOpen = false;
    isCollapsed = false;
    activeRoute = '';
    isMobile = false;
    isUserDropdownOpen = false;
    private isBrowser: boolean;

    userInfo: UserInfo = {
        name: 'John Doe',
        email: 'john@plantcare.com',
    };

    notificationsBadge = 3;

    menuItems: MenuItem[] = [
        {
            label: 'Dashboard',
            icon: this.faHouse,
            route: '/dashboard',
        },
        {
            label: 'Mes Plantes',
            icon: this.faSeedling,
            route: '/plants',
        },
        {
            label: 'Planning Arrosage',
            icon: this.faDroplet,
            route: '/watering-schedule',
            badge: 3,
        },
        {
            label: 'Journal des Soins',
            icon: this.faBook,
            route: '/care-logs',
        },
    ];

    constructor(
        private router: Router,
        private authService: AuthService,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit(): void {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                this.activeRoute = event.url;
                this.isUserDropdownOpen = false;
            });

        this.activeRoute = this.router.url;

        if (this.isBrowser) {
            this.checkScreenSize();
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any): void {
        if (this.isBrowser) {
            this.checkScreenSize();
        }
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-dropdown-container')) {
            this.isUserDropdownOpen = false;
        }
    }

    private checkScreenSize(): void {
        if (this.isBrowser) {
            this.isMobile = window.innerWidth < 768;
            if (!this.isMobile) {
                this.isSidebarOpen = true;
            } else {
                this.isCollapsed = false;
            }
        }
    }

    toggleSidebar(): void {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    toggleCollapse(): void {
        this.isCollapsed = !this.isCollapsed;
    }

    closeSidebar(): void {
        if (this.isMobile) {
            this.isSidebarOpen = false;
        }
    }

    toggleUserDropdown(): void {
        this.isUserDropdownOpen = !this.isUserDropdownOpen;
    }

    isActiveRoute(route: string): boolean {
        return this.activeRoute.startsWith(route);
    }

    navigate(route: string): void {
        this.router.navigate([route]);
        if (this.isMobile) {
            this.closeSidebar();
        }
    }

    navigateToNotifications(): void {
        this.navigate('/notifications');
        this.isUserDropdownOpen = false;
    }

    navigateToProfile(): void {
        this.navigate('/profile');
        this.isUserDropdownOpen = false;
    }

    logout(): void {
        this.authService.clearToken();
        this.router.navigate(['/login']);
        this.isUserDropdownOpen = false;
    }

    getUserInitials(): string {
        return this.userInfo.name
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase();
    }

    getPageTitle(): string {
        const titles: { [key: string]: string } = {
            '/dashboard': 'Dashboard',
            '/plants': 'Mes Plantes',
            '/watering-schedule': 'Planning d\'Arrosage',
            '/care-logs': 'Journal des Soins',
            '/notifications': 'Notifications',
            '/profile': 'Mon Profil'
        };
        return titles[this.activeRoute] || 'PlantCare';
    }

    getPageDescription(): string {
        const descriptions: { [key: string]: string } = {
            '/dashboard': 'Vue d\'ensemble de vos plantes et tâches',
            '/plants': 'Gérez votre collection de plantes',
            '/watering-schedule': 'Planifiez l\'arrosage de vos plantes',
            '/care-logs': 'Suivez l\'historique des soins apportés',
            '/notifications': 'Centre de notifications',
            '/profile': 'Paramètres de votre compte'
        };
        return descriptions[this.activeRoute] || 'Gestionnaire de plantes intelligent';
    }
}