# TODO LIST — Backend

API REST de l'application TODO LIST, réalisée avec **Node.js**, **Express 5** et **TypeScript**.

## Stack technique

| Outil | Rôle |
|---|---|
| Express 5 | Serveur HTTP et routage |
| TypeScript | Typage statique |
| Zod | Validation des données entrantes et de la configuration |
| cors | Autorise les requêtes venant de l'application Angular |
| tsx | Exécution TypeScript en développement (rechargement automatique) |
| Vitest + Supertest | Tests d'intégration de l'API |

## Installation et lancement

```bash
cd backend
npm install
npm run dev
```

L'API est disponible sur **http://localhost:3000/api**.

| Commande | Rôle |
|---|---|
| `npm run dev` | Démarre en développement, redémarre à chaque modification |
| `npm run build` | Compile TypeScript vers `dist/` |
| `npm start` | Démarre la version compilée (production) |
| `npm test` | Lance les tests |
| `npm run typecheck` | Vérifie les types sans compiler |
| `npm run db:reset` | Remet les données de départ (`data/seed.json` → `data/todos.json`) |

## Configuration

Les variables sont lues dans `.env` (modèle : `.env.example`) et validées au démarrage.

| Variable | Défaut | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development`, `production` ou `test` |
| `PORT` | `3000` | Port d'écoute |
| `CORS_ORIGIN` | `http://localhost:4200` | Origine autorisée (le frontend) |
| `DATA_FILE` | `data/todos.json` | Fichier de stockage des tâches |

## Architecture

```
backend/
├── src/
│   ├── server.ts                 Point d'entrée : crée l'app et démarre le serveur
│   ├── app.ts                    Configuration Express (middlewares, routes)
│   ├── config/
│   │   └── env.ts                Lecture et validation des variables d'environnement
│   ├── common/                   Code partagé entre les modules
│   │   ├── errors/http-error.ts          Erreur HTTP typée (400, 404…)
│   │   ├── middlewares/error-handler.ts  Format unique des réponses d'erreur
│   │   ├── middlewares/not-found.ts      Route inconnue → 404
│   │   ├── middlewares/request-logger.ts Journal des requêtes
│   │   └── utils/validate.ts             Validation Zod → erreur 400
│   └── modules/
│       └── todos/                Module « tâches »
│           ├── todo.model.ts         Interface Todo
│           ├── todo.schemas.ts       Schémas de validation (DTO)
│           ├── todo.repository.ts    Accès aux données (fichier JSON)
│           ├── todo.service.ts       Logique métier
│           ├── todo.controller.ts    Couche HTTP
│           ├── todo.routes.ts        Déclaration des routes
│           └── index.ts              Assemblage du module
├── data/
│   ├── seed.json                 Données de départ (versionnées)
│   └── todos.json                Données réelles (générées, non versionnées)
└── tests/
    └── todos.api.test.ts         Tests d'intégration
```

### Architecture en couches

Chaque couche a une seule responsabilité et ne connaît que la couche du dessous :

```
Requête HTTP
   │
   ▼
todo.routes.ts       associe une URL et une méthode HTTP à une action du contrôleur
   │
   ▼
todo.controller.ts   valide la requête (Zod), appelle le service, choisit le code HTTP
   │
   ▼
todo.service.ts      logique métier (ex. : tâche introuvable → erreur 404)
   │
   ▼
todo.repository.ts   lecture / écriture des données
```

- **Le service ne dépend que de l'interface `TodoRepository`.** Pour passer à une vraie base de
  données (SQLite, PostgreSQL, MongoDB…), il suffit d'écrire une nouvelle classe qui implémente
  cette interface et de la passer à `createApp()` dans `server.ts`.
- **`createApp()` ne démarre pas le serveur.** Les tests créent l'application avec un fichier
  temporaire, sans ouvrir de port.

### Stockage

Le repository `JsonFileTodoRepository` enregistre les tâches dans `data/todos.json` :

- les données sont chargées une fois puis gardées en mémoire ;
- chaque écriture passe par un fichier temporaire puis un renommage, pour ne jamais laisser un fichier à moitié écrit ;
- les écritures sont mises en file d'attente pour ne pas se chevaucher ;
- si `todos.json` n'existe pas, les données de `seed.json` sont utilisées.

## API

URL de base : `http://localhost:3000/api`

### Modèle `Todo`

```json
{
  "id": 1,
  "title": "Préparer l'examen Angular",
  "completed": false,
  "createdAt": "2026-11-12T08:00:00.000Z",
  "updatedAt": "2026-11-12T08:00:00.000Z"
}
```

### Routes

| Méthode | URL | Corps | Succès | Erreurs |
|---|---|---|---|---|
| GET | `/todos` | — | `200` liste | `400` filtre invalide |
| GET | `/todos?completed=true` | — | `200` tâches terminées | |
| GET | `/todos?completed=false` | — | `200` tâches en cours | |
| GET | `/todos/:id` | — | `200` tâche | `400`, `404` |
| POST | `/todos` | `{ "title": "...", "completed"?: false }` | `201` tâche créée + en-tête `Location` | `400` |
| PATCH | `/todos/:id` | `{ "title"?: "...", "completed"?: true }` | `200` tâche modifiée | `400`, `404` |
| DELETE | `/todos/:id` | — | `204` sans contenu | `400`, `404` |
| GET | `/health` | — | `200` `{ "status": "ok" }` | |

### Règles de validation

- `title` : texte obligatoire, espaces retirés au début et à la fin, 1 à 200 caractères.
- `completed` : booléen.
- `PATCH` : au moins un des deux champs doit être fourni.
- Les champs inconnus sont refusés.
- `:id` doit être un entier positif.

### Format des erreurs

Toutes les erreurs ont le même format :

```json
{
  "error": {
    "status": 400,
    "message": "Données invalides",
    "details": [{ "field": "title", "message": "Le titre est obligatoire" }]
  }
}
```

### Exemples (curl)

```bash
curl http://localhost:3000/api/todos?completed=false

curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Réviser les directives"}'

curl -X PATCH http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

curl -X DELETE http://localhost:3000/api/todos/1
```

## Tests

`npm test` lance 20 tests d'intégration (`tests/todos.api.test.ts`) qui envoient de vraies requêtes
HTTP à l'application (Supertest) avec un fichier de données temporaire : listing, filtres, création,
modification, suppression, validation, erreurs 404, JSON mal formé et CORS.
