export const TODO_PRIORITIES = ['low', 'medium', 'high'] as const;

export type TodoPriority = (typeof TODO_PRIORITIES)[number];

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  createdAt: string;
  updatedAt: string;
}

export interface TodoFilter {
  completed?: boolean;
  priority?: TodoPriority;
}
