# TODO LIST

Application de gestion de tâches composée de :

- un **frontend Angular 21** (`todo-list/`) ;
- un **backend Node.js / Express / TypeScript** (`backend/`) qui expose une API REST.

**Étudiant :** Achille SAGANG TANWOUO

---

## Structure du dépôt

```
ANGULAR EXAMNE/
├── backend/          API REST (Express 5 + TypeScript)  → voir backend/README.md
├── todo-list/        Application Angular                → voir todo-list/README.md
├── package.json      Commandes pour lancer les deux projets depuis la racine
└── README.md
```

## Prérequis

- [Node.js](https://nodejs.org/) **22 ou 24 (LTS)** recommandé (minimum 20.12)
- npm (installé avec Node.js)

## Démarrage pas à pas

> Toutes les commandes se lancent depuis le dossier **racine** du projet (`ANGULAR EXAMNE`),
> pas depuis `todo-list` ni `backend`.

### 1. Installer les dépendances (une seule fois)

```bash
cd "C:\Users\achil\OneDrive\Bureau\ANGULAR EXAMNE"
npm run setup
```

Cette commande installe les dépendances du backend **et** du frontend.
La relancer plus tard ne pose aucun problème.

### 2. Terminal 1 : démarrer le backend

```bash
npm run api
```

Attendre le message :

```
API TODO LIST démarrée sur http://localhost:3000/api (development)
```

### 3. Terminal 2 : démarrer Angular

Ouvrir un **nouveau terminal** (dans VS Code : bouton **+** du panneau Terminal), puis :

```bash
cd "C:\Users\achil\OneDrive\Bureau\ANGULAR EXAMNE"
npm start
```

Attendre le message `Local: http://localhost:4200/`.

### 4. Ouvrir l'application

Aller sur **http://localhost:4200** dans le navigateur.

### Récapitulatif

| Terminal | Commande | Rôle | Adresse |
|---|---|---|---|
| 1 | `npm run api` | Backend (redémarre seul à chaque modification) | http://localhost:3000/api |
| 2 | `npm start` | Application Angular | http://localhost:4200 |

- Les **deux terminaux** doivent rester ouverts pendant l'utilisation.
- Pour arrêter : **Ctrl + C** dans chaque terminal.
- Le backend doit être démarré **avant** d'utiliser l'application, sinon elle affiche
  « Impossible de joindre l'API ».

### Vérifier que tout fonctionne

Chaque action dans l'application affiche une ligne dans le terminal du backend :

```
GET /api/todos 200 - 2.1 ms
POST /api/todos 201 - 3.4 ms
PATCH /api/todos/1 200 - 2.8 ms
DELETE /api/todos/1 204 - 2.5 ms
```

Les tâches sont enregistrées dans `backend/data/todos.json`.
Pour revenir aux tâches de départ :

```bash
npm --prefix backend run db:reset
```

## Fonctionnalités

| Fonctionnalité | Utilisation | Requête HTTP |
|---|---|---|
| Ajouter une tâche | Saisir le texte, choisir la priorité puis **Entrée** (ou **Ajouter**) | `POST /api/todos` |
| Filtrer | Onglets **All**, **In Progress**, **Done** | `GET /api/todos?completed=...` |
| Terminer / reprendre une tâche | Cocher la case | `PATCH /api/todos/:id` |
| Changer la priorité | Liste déroulante sur la tâche | `PATCH /api/todos/:id` |
| Modifier une tâche | **Double-clic** sur le texte, **Entrée** pour valider | `PATCH /api/todos/:id` |
| Annuler la modification | **Échap** ou clic à l'extérieur | aucune |
| Supprimer une tâche | Bouton **×**, puis confirmer | `DELETE /api/todos/:id` |

### Interface

Design volontairement simple et sobre : une carte blanche centrée, une couleur d'accent (vert canard),
des onglets pour les filtres et une étiquette de couleur pour la priorité
(rouge = haute, orange = moyenne, vert = basse). Les tâches sont affichées de la plus urgente à la moins urgente.
Sur mobile, la carte prend toute la largeur.
- **Accessibilité** : navigation au clavier, libellés ARIA, animations réduites si le système le demande
  (`prefers-reduced-motion`), mise en page adaptée au mobile.

## Fonctionnement général

```
┌──────────────────────┐   HTTP (JSON)    ┌────────────────────────────┐
│  Angular (port 4200) │ ───────────────▶ │  Express (port 3000)       │
│                      │                  │  routes → contrôleur →     │
│  composants → service│ ◀─────────────── │  service → repository      │
└──────────────────────┘                  └──────────────┬─────────────┘
                                                         │
                                                  data/todos.json
```

1. L'utilisateur agit dans l'interface (saisie, clic, double-clic…).
2. Le service Angular `TodoService` envoie la requête HTTP au backend.
3. Le backend valide les données, applique la logique métier et enregistre les tâches dans `backend/data/todos.json`.
4. Angular recharge la liste avec le filtre actif.

## Utiliser JSONPlaceholder à la place du backend

[JSONPlaceholder](https://jsonplaceholder.typicode.com) est une fausse API REST publique.
Ses tâches ont les mêmes champs que notre modèle (`id`, `title`, `completed`, plus un `userId` ignoré),
donc l'application fonctionne avec elle **sans modifier le code**. Elle ne gère pas les priorités :
toutes ses tâches s'affichent en priorité « Moyenne ».

### Mise en place

1. Ouvrir `todo-list/src/environments/environment.development.ts` et changer `apiUrl` :

   ```ts
   export const environment = {
     production: false,
     apiUrl: 'https://jsonplaceholder.typicode.com',
   };
   ```

   > Pas de `/api` à la fin : le service ajoute lui-même `/todos`.
   > Faire de même dans `environment.ts` pour la version compilée (`npm run build`).

2. Lancer uniquement le frontend (le backend n'est pas nécessaire) :

   ```bash
   npm start
   ```

3. Ouvrir **http://localhost:4200**. Une connexion Internet est nécessaire.

### Ce qui fonctionne

| Action | Requête envoyée | Réponse de JSONPlaceholder |
|---|---|---|
| Afficher la liste | `GET /todos` | 200 tâches (titres en faux latin) |
| Filtrer | `GET /todos?completed=true` / `false` | liste filtrée |
| Ajouter | `POST /todos` | `201` avec `id: 201` |
| Modifier / cocher | `PATCH /todos/:id` | `200` |
| Supprimer | `DELETE /todos/:id` | `200` |

### Limite importante : rien n'est enregistré

JSONPlaceholder répond « succès » mais **ne modifie jamais ses données**. Comme l'application
recharge la liste depuis l'API après chaque action :

- une tâche ajoutée **disparaît** aussitôt ;
- une tâche supprimée **réapparaît** ;
- une modification ou une case cochée **revient à l'état précédent**.

Les requêtes HTTP sont pourtant bien envoyées : on peut les voir dans les outils de
développement du navigateur (**F12 → onglet Réseau**).

> Pour une démonstration complète où les modifications sont conservées, utiliser le backend
> du projet (`apiUrl: 'http://localhost:3000/api'`).

### Revenir au backend du projet

Remettre `apiUrl: 'http://localhost:3000/api'` dans `environment.development.ts`, puis lancer
`npm run api` et `npm start` comme indiqué dans [Démarrage pas à pas](#démarrage-pas-à-pas).

## Commandes utiles (depuis la racine)

| Commande | Rôle |
|---|---|
| `npm run setup` | Installe les dépendances des deux projets |
| `npm run api` | Démarre le backend |
| `npm start` | Démarre le frontend |
| `npm test` | Lance les tests du backend puis du frontend |

## Problèmes fréquents

| Message | Cause | Solution |
|---|---|---|
| `Missing script: "api"` ou `"start"` | Commande lancée dans le mauvais dossier | Se placer à la racine `ANGULAR EXAMNE` |
| « Impossible de joindre l'API » | Le backend n'est pas lancé | `npm run api` dans un autre terminal |
| `EADDRINUSE: address already in use :::3000` | Un autre programme utilise le port 3000 | Fermer l'autre serveur, ou changer `PORT` dans `backend/.env` (et `apiUrl` dans `todo-list/src/environments/`) |
| `Port 4200 is already in use` | L'application Angular tourne déjà | Fermer l'autre terminal ou accepter un autre port |
