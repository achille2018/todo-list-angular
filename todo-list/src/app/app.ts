import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { TodoFilterBar } from './components/todo-filter/todo-filter';
import { TodoForm } from './components/todo-form/todo-form';
import { TodoList } from './components/todo-list/todo-list';
import { TodoStats } from './components/todo-stats/todo-stats';
import {
  countTodos,
  sortTodos,
  Todo,
  TodoFilter,
  TodoPriority,
  TodoSort,
} from './models/todo';
import { TodoService } from './services/todo';

@Component({
  selector: 'app-root',
  imports: [Header, TodoStats, TodoForm, TodoFilterBar, TodoList, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly todoService = inject(TodoService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  /** Tâches renvoyées par l'API pour le filtre actif */
  private readonly todos = signal<Todo[]>([]);
  /** Toutes les tâches, pour les statistiques et les compteurs */
  private readonly allTodos = signal<Todo[]>([]);

  protected readonly filter = signal<TodoFilter>('all');
  protected readonly sort = signal<TodoSort>('priority');
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly visibleTodos = computed(() => sortTodos(this.todos(), this.sort()));
  protected readonly counts = computed(() => countTodos(this.allTodos()));

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
    forkJoin({
      list: this.todoService.getAll(this.filter()),
      all: this.todoService.getAll('all'),
    }).subscribe({
      next: ({ list, all }) => {
        this.todos.set(list);
        this.allTodos.set(all);
        this.error.set(null);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Impossible de joindre l'API. Lancez le backend avec « npm run api ».");
        this.loading.set(false);
      },
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
