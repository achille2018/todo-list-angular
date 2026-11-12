# TODO LIST — Angular

Application de gestion de tâches réalisée avec **Angular 21**.
Les tâches sont enregistrées via une API REST simulée par **json-server** (fichier `db.json`).

**Étudiant :** Achille SAGANG TANWOUO

---

## 1. Prérequis

- [Node.js](https://nodejs.org/) (version LTS 22 ou 24 recommandée)
- npm (installé avec Node.js)
- Angular CLI (facultatif) : `npm install -g @angular/cli`

## 2. Installation

Dans le dossier `todo-list` :

```bash
npm install
```

## 3. Lancement

L'application a besoin de **deux terminaux** ouverts en même temps.

| Terminal | Commande | Rôle | Adresse |
|---|---|---|---|
| 1 | `npm run api` | Démarre l'API REST (json-server) | http://localhost:3000/todos |
| 2 | `npm start` | Démarre l'application Angular | http://localhost:4200 |

Ouvrir ensuite **http://localhost:4200** dans le navigateur.

> Les commandes se lancent depuis le dossier `todo-list` **ou** depuis le dossier parent `ANGULAR EXAMNE`
> (un `package.json` y redirige `npm start` et `npm run api` vers le projet).

> Si l'API n'est pas démarrée, l'application affiche le message « Impossible de joindre l'API ».

## 4. Fonctionnalités

| Fonctionnalité | Utilisation | Requête HTTP |
|---|---|---|
| Ajouter une tâche | Saisir le texte puis appuyer sur **Entrée** | `POST /todos` |
| Filtrer | Boutons **All**, **In Progress**, **Done** | `GET /todos?completed=...` |
| Terminer / reprendre une tâche | Cocher la case | `PATCH /todos/:id` |
| Modifier une tâche | **Double-clic** sur le texte, **Entrée** pour valider | `PATCH /todos/:id` |
| Annuler la modification | **Échap** ou clic à l'extérieur | aucune |
| Supprimer une tâche | Bouton **×** | `DELETE /todos/:id` |

## 5. Fonctionnement

### Architecture

```
src/app/
├── app.ts / app.html          Composant racine : état de la liste, appels au service
├── app.config.ts              Providers : routeur + HttpClient
├── models/todo.ts             Interface Todo et type TodoFilter
├── services/todo.ts           TodoService : toutes les requêtes HTTP
├── directives/inline-edit.ts  Directive appInlineEdit (édition au double-clic)
└── components/
    ├── header/                Titre + noms des étudiants
    ├── todo-form/             Champ de saisie (Entrée = ajout)
    ├── todo-filter/           Boutons de filtre
    ├── todo-list/             Liste des tâches
    ├── todo-item/             Une tâche : case, texte éditable, bouton ×
    └── footer/                Nombre de tâches affichées
```

### Flux des données

Le composant racine `App` contient l'état (la liste des tâches et le filtre actif).
Les composants enfants reçoivent les données par `input()` et remontent les actions par `output()` :

```
TodoItem ──(toggle / rename / remove)──▶ TodoList ──▶ App ──▶ TodoService ──HTTP──▶ json-server
```

Après chaque modification (ajout, mise à jour, suppression), `App` recharge la liste depuis l'API
avec le filtre actif.

### Le modèle

```ts
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}
```

### Le filtrage par paramètres

1. Chaque bouton est un lien qui ajoute un paramètre à l'URL : `?filter=all`, `?filter=active` ou `?filter=done`.
2. `App` écoute ce paramètre (`ActivatedRoute.queryParamMap`).
3. `TodoService.getAll(filter)` le convertit en paramètre HTTP (`HttpParams`) :
   - `active` → `GET /todos?completed=false`
   - `done` → `GET /todos?completed=true`
   - `all` → `GET /todos`

Le filtre est donc conservé dans l'URL : on peut recharger la page ou partager le lien.

### La directive `appInlineEdit`

Utilisation dans `todo-item.html` :

```html
<span [appInlineEdit]="todo().title" (edited)="rename.emit($event)">{{ todo().title }}</span>
```

- **Double-clic** : la directive crée un `<input>` (via `Renderer2`) avec la valeur actuelle, le place à côté du texte et masque le texte.
- **Entrée** : la nouvelle valeur est émise par `(edited)` puis envoyée à l'API.
- **Échap** ou **clic à l'extérieur** : l'`<input>` est retiré et le texte réapparaît. Le texte d'origine n'ayant jamais été modifié, l'état précédent est rétabli.
- **Gestion des écouteurs** : tous les écouteurs sont créés avec `Renderer2.listen()`, qui renvoie une fonction de suppression.
  - L'écouteur `dblclick` vit pendant toute la vie de la directive.
  - Les écouteurs `keydown` et `click` sur le document n'existent que pendant l'édition et sont retirés à la fin de celle-ci.
  - Dans `ngOnDestroy()`, tous les écouteurs restants sont supprimés, ce qui évite les fuites mémoire.

## 6. L'API (json-server)

Les données se trouvent dans `db.json` et sont modifiées à chaque requête.

| Méthode | URL | Description |
|---|---|---|
| GET | `/todos` | Toutes les tâches |
| GET | `/todos?completed=true` | Tâches filtrées |
| POST | `/todos` | Créer une tâche `{ title, completed }` |
| PATCH | `/todos/:id` | Modifier une tâche |
| DELETE | `/todos/:id` | Supprimer une tâche |

> Ouvrir http://localhost:3000/ renvoie une erreur 404, c'est normal : seule la route `/todos` existe.

## 7. Autres commandes

| Commande | Rôle |
|---|---|
| `npm run build` | Compile l'application dans `dist/todo-list` |
| `npm test` | Lance les tests unitaires (Vitest) |

## 8. Problèmes fréquents

| Message | Cause | Solution |
|---|---|---|
| `Missing script: "api"` ou `"start"` | Commande lancée dans le mauvais dossier | Se placer dans `todo-list` ou `ANGULAR EXAMNE` |
| « Impossible de joindre l'API » dans l'application | json-server n'est pas lancé | Lancer `npm run api` dans un autre terminal |
| `Port 4200 is already in use` | L'application tourne déjà | Fermer l'autre terminal ou accepter un autre port |
| `GET / 404` dans le terminal de l'API | La racine de l'API a été ouverte | Ouvrir http://localhost:4200 pour l'application |
