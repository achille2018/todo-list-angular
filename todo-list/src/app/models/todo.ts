export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

/** Valeur du filtre, passée en paramètre d'URL (?filter=...) */
export type TodoFilter = 'all' | 'active' | 'done';
