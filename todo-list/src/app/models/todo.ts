export type TodoPriority = 'low' | 'medium' | 'high';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  createdAt?: string;
  updatedAt?: string;
}

/** Valeur du filtre, passée en paramètre d'URL (?filter=...) */
export type TodoFilter = 'all' | 'active' | 'done';

/** Ordre d'affichage de la liste */
export type TodoSort = 'priority' | 'recent';

/** Compteurs affichés dans les statistiques et les filtres */
export interface TodoCounts {
  all: number;
  active: number;
  done: number;
  urgent: number;
}

export const PRIORITIES: readonly TodoPriority[] = ['high', 'medium', 'low'];

export const PRIORITY_LABELS: Record<TodoPriority, string> = {
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse',
};

const PRIORITY_RANK: Record<TodoPriority, number> = { high: 0, medium: 1, low: 2 };

/** Priorité suivante, utilisée quand on clique sur le badge : basse → moyenne → haute → basse */
export function nextPriority(priority: TodoPriority): TodoPriority {
  return priority === 'low' ? 'medium' : priority === 'medium' ? 'high' : 'low';
}

/**
 * Trie les tâches sans modifier le tableau d'origine.
 *  - 'priority' : tâches en cours d'abord, puis par priorité (haute → basse), puis les plus récentes.
 *  - 'recent'   : les plus récentes d'abord.
 */
export function sortTodos(todos: Todo[], sort: TodoSort): Todo[] {
  const byRecent = (a: Todo, b: Todo) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '') || b.id - a.id;

  return [...todos].sort((a, b) => {
    if (sort === 'recent') return byRecent(a, b);
    return (
      Number(a.completed) - Number(b.completed) ||
      PRIORITY_RANK[a.priority ?? 'medium'] - PRIORITY_RANK[b.priority ?? 'medium'] ||
      byRecent(a, b)
    );
  });
}

export function countTodos(todos: Todo[]): TodoCounts {
  const done = todos.filter((t) => t.completed).length;
  return {
    all: todos.length,
    active: todos.length - done,
    done,
    urgent: todos.filter((t) => !t.completed && t.priority === 'high').length,
  };
}
