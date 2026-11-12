import { Component, input, output } from '@angular/core';
import { Todo, TodoPriority } from '../../models/todo';
import { TodoItem } from '../todo-item/todo-item';

@Component({
  selector: 'app-todo-list',
  imports: [TodoItem],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.css',
})
export class TodoList {
  readonly todos = input<Todo[]>([]);

  readonly toggle = output<Todo>();
  readonly rename = output<{ todo: Todo; title: string }>();
  readonly changePriority = output<{ todo: Todo; priority: TodoPriority }>();
  readonly remove = output<Todo>();
}
