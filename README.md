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

## Installation

Depuis la racine du dépôt :

```bash
npm run setup
```

Cette commande installe les dépendances du backend **et** du frontend.

## Lancement

Ouvrir **deux terminaux** à la racine du dépôt :

| Terminal | Commande | Rôle | Adresse |
|---|---|---|---|
| 1 | `npm run api` | Démarre le backend (rechargement automatique) | http://localhost:3000/api |
| 2 | `npm start` | Démarre l'application Angular | http://localhost:4200 |

Ouvrir ensuite **http://localhost:4200** dans le navigateur.

> Le backend doit être démarré **avant** d'utiliser l'application, sinon elle affiche
> « Impossible de joindre l'API ».

## Fonctionnalités

| Fonctionnalité | Utilisation | Requête HTTP |
|---|---|---|
| Ajouter une tâche | Saisir le texte puis appuyer sur **Entrée** | `POST /api/todos` |
| Filtrer | Boutons **All**, **In Progress**, **Done** | `GET /api/todos?completed=...` |
| Terminer / reprendre une tâche | Cocher la case | `PATCH /api/todos/:id` |
| Modifier une tâche | **Double-clic** sur le texte, **Entrée** pour valider | `PATCH /api/todos/:id` |
| Annuler la modification | **Échap** ou clic à l'extérieur | aucune |
| Supprimer une tâche | Bouton **×** | `DELETE /api/todos/:id` |

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
