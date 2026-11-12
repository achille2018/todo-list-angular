# TODO LIST — Frontend Angular

Application de gestion de tâches réalisée avec **Angular 21**.
Elle communique avec le backend Express du dossier `../backend`.

**Étudiant :** Achille SAGANG TANWOUO

## Démarrage rapide (backend + frontend)

Depuis le dossier **racine** `ANGULAR EXAMNE` (pas depuis `todo-list`) :

```bash
# 1. Une seule fois : installer les dépendances
npm run setup

# 2. Terminal 1 : démarrer le backend
#    attendre « API TODO LIST démarrée sur http://localhost:3000/api »
npm run api

# 3. Terminal 2 (nouveau terminal) : démarrer Angular
#    attendre « Local: http://localhost:4200/ »
npm start
```

4. Ouvrir **http://localhost:4200** dans le navigateur.

Les deux terminaux doivent rester ouverts. Pour arrêter : **Ctrl + C** dans chacun.
Détails et problèmes fréquents : voir le [README principal](../README.md).

## Lancement du frontend seul

```bash
cd todo-list
npm install
npm start
```

Ouvrir **http://localhost:4200**. Le backend doit tourner sur http://localhost:3000.

| Commande | Rôle |
|---|---|
| `npm start` | Démarre le serveur de développement |
| `npm run build` | Compile l'application dans `dist/todo-list` |
| `npm test` | Lance les tests unitaires (Vitest) |

## Fonctionnalités

| Fonctionnalité | Utilisation | Requête HTTP |
|---|---|---|
| Ajouter une tâche | Saisir le texte, choisir la priorité puis **Entrée** (ou **Ajouter**) | `POST /api/todos` |
| Filtrer | Onglets **All**, **In Progress**, **Done** | `GET /api/todos?completed=...` |
| Terminer / reprendre une tâche | Cocher la case | `PATCH /api/todos/:id` |
| Modifier une tâche | **Double-clic** sur le texte, **Entrée** pour valider | `PATCH /api/todos/:id` |
| Annuler la modification | **Échap** ou clic à l'extérieur | aucune |
| Supprimer une tâche | Bouton **×** | `DELETE /api/todos/:id` |

## Architecture

```
src/
├── environments/               URL de l'API (apiUrl)
├── styles.css                  Styles globaux
└── app/
    ├── app.ts / app.html          Composant racine : liste, filtre, tri par priorité, appels au service
    ├── app.config.ts              Providers : routeur + HttpClient
    ├── models/todo.ts             Interface Todo, priorités et filtres
    ├── services/todo.ts           TodoService : toutes les requêtes HTTP
    ├── directives/inline-edit.ts  Directive appInlineEdit (édition au double-clic)
    └── components/
        ├── header/                Titre + nom de l'étudiant
        ├── todo-form/             Champ de saisie + liste déroulante de priorité + bouton
        ├── todo-filter/           Onglets All / In Progress / Done
        ├── todo-list/             Liste des tâches
        ├── todo-item/             Une tâche : case, texte éditable, priorité, bouton ×
        └── footer/                Nombre de tâches
```

### Design

Design simple : une carte blanche centrée avec une bordure de couleur en haut, une seule couleur
d'accent (`#0f766e`), des onglets soulignés pour les filtres et une étiquette colorée pour la priorité.
Chaque composant a son propre fichier CSS, sans librairie externe.

### Flux des données

Le composant racine `App` contient l'état (la liste des tâches et le filtre actif).
Les composants enfants reçoivent les données par `input()` et remontent les actions par `output()` :

```
TodoItem ──(toggle / rename / remove)──▶ TodoList ──▶ App ──▶ TodoService ──HTTP──▶ backend
```

Après chaque modification (ajout, mise à jour, suppression), `App` recharge la liste depuis l'API
avec le filtre actif.

### Configuration de l'API

L'adresse du backend est définie dans `src/environments/` :

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

`environment.development.ts` est utilisé par `ng serve`, `environment.ts` par `ng build`.

Pour utiliser l'API publique **JSONPlaceholder** à la place du backend, remplacer l'adresse par
`'https://jsonplaceholder.typicode.com'` (sans `/api`). Attention : cette API ne conserve aucune
modification. Voir la section
[Utiliser JSONPlaceholder](../README.md#utiliser-jsonplaceholder-à-la-place-du-backend) du README principal.

### Le filtrage par paramètres

1. Chaque bouton est un lien qui ajoute un paramètre à l'URL : `?filter=all`, `?filter=active` ou `?filter=done`.
2. `App` écoute ce paramètre (`ActivatedRoute.queryParamMap`).
3. `TodoService.getAll(filter)` le convertit en paramètre HTTP (`HttpParams`) :
   - `active` → `GET /api/todos?completed=false`
   - `done` → `GET /api/todos?completed=true`
   - `all` → `GET /api/todos`

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
