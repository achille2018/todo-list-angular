import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { TodoFilterBar } from './components/todo-filter/todo-filter';
import { TodoForm } from './components/todo-form/todo-form';
import { TodoList } from './components/todo-list/todo-list';
import { Todo, TodoFilter, TodoPriority } from './models/todo';
import { TodoService } from './services/todo';

/** Ordre d'affichage : haute, puis moyenne, puis basse */
const PRIORITY_ORDER: Record<TodoPriority, number> = { high: 0, medium: 1, low: 2 };

@Component({
  selector: 'app-root',
  imports: [Header, TodoForm, TodoFilterBar, TodoList, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly todoService = inject(TodoService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly todos = signal<Todo[]>([]);
  protected readonly filter = signal<TodoFilter>('all');
  protected readonly error = signal<string | null>(null);

  /** Tâches triées par priorité */
  protected readonly sortedTodos = computed(() =>
    [...this.todos()].sort(
      (a, b) => PRIORITY_ORDER[a.priority ?? 'medium'] - PRIORITY_ORDER[b.priority ?? 'medium'],
    ),
  );

  protected readonly remaining = computed(() => this.todos().filter((t) => !t.completed).length);

  ngOnInit(): void {
    // Le filtre est lu depuis le paramètre d'URL ?filter=all|active|done
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const value = params.get('filter');
        this.filter.set(value === 'active' || value === 'done' ? value : 'all');
        this.loadTodos();
      });
  }

  protected loadTodos(): void {
    this.todoService.getAll(this.filter()).subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.error.set(null);
      },
      error: () => this.error.set("Impossible de joindre l'API (lancez le backend : npm run api)."),
    });
  }

  protected addTodo(event: { title: string; priority: TodoPriority }): void {
    this.todoService.add(event.title, event.priority).subscribe(() => this.loadTodos());
  }

  protected toggleTodo(todo: Todo): void {
    this.todoService.update(todo.id, { completed: !todo.completed }).subscribe(() => this.loadTodos());
  }

  protected renameTodo(event: { todo: Todo; title: string }): void {
    this.todoService.update(event.todo.id, { title: event.title }).subscribe(() => this.loadTodos());
  }

  protected changePriority(event: { todo: Todo; priority: TodoPriority }): void {
    this.todoService.update(event.todo.id, { priority: event.priority }).subscribe(() => this.loadTodos());
  }

  protected deleteTodo(todo: Todo): void {
    this.todoService.delete(todo.id).subscribe(() => this.loadTodos());
  }
}
