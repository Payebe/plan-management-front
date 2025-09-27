Voici le **README.md** pour votre application frontend Angular, basé sur la structure fournie :

````markdown
# 🌱 Plant Manager Frontend

Application frontend développée avec **Angular** pour interagir avec le **Plant Manager Backend**. Elle offre une interface utilisateur moderne et réactive pour gérer vos plantes, suivre les actions de soin, visualiser les notifications et consulter le tableau de bord.

---

## 🚀 Technologies

* [Angular](https://angular.dev/) - Framework pour construire l'application
* [TypeScript](https://www.typescriptlang.org/) - Langage de programmation principal
* [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitaire pour le style
* [Ng Icons](https://ng-icons.github.io/ng-icons/) - Bibliothèque d'icônes légère (Lucide, etc.)
* **Routing** - Gestion de la navigation côté client

---

## 📂 Structure du projet (Angular)

Ce projet suit une architecture modulaire classique pour les applications Angular :

```bash
📦src
 ┣ 📂app
 ┃ ┣ 📂core              # Services de base (AuthService, Interceptors, Guards)
 ┃ ┣ 📂features          # Modules fonctionnels/Lazy-loaded (Login, Dashboard, Plants, etc.)
 ┃ ┣ 📂layout            # Composants de mise en page (MainLayout)
 ┃ ┣ 📂shared            # Éléments réutilisables (Composants, Models, Services)
 ┃ ┣ 📜app.config.ts     # Configuration de l'application (Standalone)
 ┃ ┗ 📜app.routes.ts     # Configuration principale du routage
 ┣ 📂environments        # Configuration des environnements (dev, prod)
 ┗ 📜styles.css          # Fichier de styles global (incluant Tailwind)
````

-----

## 🛠️ Fonctionnalités clés

L'application est décomposée en plusieurs modules fonctionnels :

### 🔑 Gestion des utilisateurs (`/features/auth`)

  * **Connexion (`/login`)** : Authentification auprès du backend.
  * **Inscription (`/register`)** : Création d'un nouveau compte utilisateur.
  * **Profil (`/profile`)** : Consultation et modification des informations utilisateur.

### 🌱 Gestion des Plantes et Soins

  * **Plantes (`/plants`)** : Liste des plantes et gestion individuelle.
  * **Journal des Soins (`/care-logs`)** : Historique et ajout des actions de soin effectuées.
  * **Programme d'Arrosage (`/watering-schedule`)** : Planification et suivi de l'arrosage.

### 📊 Tableau de Bord et Suivi

  * **Tableau de Bord (`/dashboard`)** : Vue d'ensemble des statistiques et rappels importants.
  * **Notifications (`/notifications`)** : Consultation des alertes et rappels de soins.

### 🧩 Composants partagés (`/shared`)

  * **`AddPlantModal`** : Composant modale réutilisable pour ajouter une nouvelle plante.
  * **`PlantModel`** : Interface de typage TypeScript pour les données de plante.
  * **`PlantsService`** : Service pour les appels API liés aux plantes.

-----

## ⚙️ Installation et Lancement

### 1️⃣ Prérequis

Assurez-vous que [Node.js](https://nodejs.org/) et [npm](https://www.npmjs.com/) sont installés.

### 2️⃣ Cloner le projet

```bash
git clone [https://github.com/ton-compte/plant-manager-frontend.git](https://github.com/ton-compte/plant-manager-frontend.git)
cd plant-manager-frontend
```

### 3️⃣ Installer les dépendances

```bash
npm install
```

### 4️⃣ Configuration API

Modifiez le fichier `src/environments/environment.ts` pour pointer vers l'URL de votre backend NestJS (par défaut `http://localhost:3000`).

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000', // Assurez-vous que l'URL est correcte
};
```

### 5️⃣ Lancer le serveur de développement

```bash
npm run start
```

L'application sera accessible sur [http://localhost:4200](https://www.google.com/search?q=http://localhost:4200).

-----

## 🛡️ Sécurité et Performance

  * **Authentification Guard (`auth.guard.ts`)** : Protège les routes nécessitant une connexion.
  * **Intercepteur d'Authentification (`auth.interceptor.ts`)** : Ajoute automatiquement le token JWT aux requêtes API sortantes.
  * **Lazy Loading** : Les modules fonctionnels sont probablement chargés paresseusement (`/features`), ce qui améliore le temps de chargement initial.

-----

## 📜 Scripts Utiles

  * `npm run start` : Lance le serveur de développement.
  * `npm run build` : Construit l'application pour la production.
  * `npm run test` : Exécute les tests unitaires.
  * `npm run lint` : Exécute le linter pour vérifier le code.

-----

## 🤝 Contribution

Veuillez consulter le fichier `CONTRIBUTING.md` pour les directives de contribution.

-----

## 📖 License

Ce projet est distribué sous la licence **MIT**.

```
```