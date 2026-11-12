# TODO LIST — Frontend Angular

Application de gestion de tâches réalisée avec **Angular 21**.
Elle communique avec le backend Express du dossier `../backend`.

**Groupe :** Achille SAGANG TANWOUO, Jules FILLOUX

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
| Ajouter une tâche | Saisir le texte puis appuyer sur **Entrée** | `POST /api/todos` |
| Filtrer | Boutons **All**, **In Progress**, **Done** | `GET /api/todos?completed=...` |
| Terminer / reprendre une tâche | Cocher la case | `PATCH /api/todos/:id` |
| Modifier une tâche | **Double-clic** sur le texte, **Entrée** pour valider | `PATCH /api/todos/:id` |
| Annuler la modification | **Échap** ou clic à l'extérieur | aucune |
| Supprimer une tâche | Bouton **×** | `DELETE /api/todos/:id` |

## Architecture

```
src/
├── environments/               URL de l'API (apiUrl)
└── app/
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
