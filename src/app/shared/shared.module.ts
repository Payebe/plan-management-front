// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faUser,
    faLock,
    faEnvelope,
    faPlus,
    faDroplet,
    faTriangleExclamation,
    faLeaf,
    faSeedling,
    faBell,
    faRocket,
    faMobileScreenButton,
    faChartBar,
    faHouse,
    faBook,
    faSignOutAlt, // Pour la déconnexion
} from '@fortawesome/free-solid-svg-icons';

// Ajoutez les icônes à la bibliothèque
library.add(
    faUser,
    faLock,
    faEnvelope,
    faPlus,
    faDroplet,
    faTriangleExclamation,
    faLeaf,
    faSeedling,
    faBell,
    faRocket,
    faMobileScreenButton,
    faChartBar,
    faHouse,
    faBook,
    faSignOutAlt
);

@NgModule({
    imports: [FontAwesomeModule],
    exports: [FontAwesomeModule],
})
export class SharedModule { }