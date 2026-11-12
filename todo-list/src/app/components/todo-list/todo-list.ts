import { Component, computed, input, output, signal } from '@angular/core';
import { PRIORITIES, PRIORITY_LABELS, Todo, TodoFilter, TodoPriority } from '../../models/todo';
import { TodoItem } from '../todo-item/todo-item';

interface Column {
  priority: TodoPriority;
  label: string;
  hint: string;
  todos: Todo[];
}

const HINTS: Record<TodoPriority, string> = {
  high: 'À faire en premier',
  medium: 'Quand c’est possible',
  low: 'Plus tard',
};

/**
 * Tableau Kanban : une colonne par priorité.
 * Les cartes se déplacent d'une colonne à l'autre par glisser-déposer (API HTML5 native),
 * ce qui change la priorité de la tâche.
 */
@Component({
  selector: 'app-todo-list',
  imports: [TodoItem],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.css',
})
export class TodoList {
  readonly todos = input<Todo[]>([]);
  readonly filter = input<TodoFilter>('all');
  readonly loading = input(false);

  readonly toggle = output<Todo>();
  readonly rename = output<{ todo: Todo; title: string }>();
  readonly changePriority = output<{ todo: Todo; priority: TodoPriority }>();
  readonly remove = output<Todo>();

  protected readonly columns = computed<Column[]>(() =>
    PRIORITIES.map((priority) => ({
      priority,
      label: PRIORITY_LABELS[priority],
      hint: HINTS[priority],
      todos: this.todos().filter((todo) => (todo.priority ?? 'medium') === priority),
    })),
  );

  protected readonly emptyText = computed(() =>
    this.filter() === 'done' ? 'Aucune tâche terminée' : 'Glissez une tâche ici',
  );

  protected readonly skeletons = [0, 1];

  // ----- Glisser-déposer -----
  private dragged: Todo | null = null;
  protected readonly draggedId = signal<number | null>(null);
  protected readonly dropTarget = signal<TodoPriority | null>(null);

  protected onDragStart(event: DragEvent, todo: Todo): void {
    // Pas de glisser pendant l'édition d'un titre (pour pouvoir sélectionner le texte)
    if ((event.target as HTMLElement).closest('li')?.querySelector('.inline-edit-input')) {
      event.preventDefault();
      return;
    }
    this.dragged = todo;
    this.draggedId.set(todo.id);
    event.dataTransfer?.setData('text/plain', String(todo.id));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  protected onDragOver(event: DragEvent, priority: TodoPriority): void {
    if (!this.dragged) return;
    event.preventDefault(); // autorise le dépôt
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dropTarget.set(priority);
  }

  protected onDragLeave(event: DragEvent, priority: TodoPriority): void {
    const column = event.currentTarget as HTMLElement;
    if (!column.contains(event.relatedTarget as Node) && this.dropTarget() === priority) {
      this.dropTarget.set(null);
    }
  }

  protected onDrop(event: DragEvent, priority: TodoPriority): void {
    event.preventDefault();
    const todo = this.dragged;
    this.resetDrag();
    if (todo && (todo.priority ?? 'medium') !== priority) {
      this.changePriority.emit({ todo, priority });
    }
  }

  protected resetDrag(): void {
    this.dragged = null;
    this.draggedId.set(null);
    this.dropTarget.set(null);
  }
}
