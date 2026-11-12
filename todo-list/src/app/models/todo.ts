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

export const PRIORITY_LABELS: Record<TodoPriority, string> = {
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse',
};
