import { Component, input, output } from '@angular/core';
import { Todo } from '../../models/todo';
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
  readonly remove = output<Todo>();
}
