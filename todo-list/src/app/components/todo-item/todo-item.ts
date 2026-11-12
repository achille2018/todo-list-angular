import { Component, input, output } from '@angular/core';
import { InlineEdit } from '../../directives/inline-edit';
import { Todo } from '../../models/todo';

@Component({
  selector: 'app-todo-item',
  imports: [InlineEdit],
  templateUrl: './todo-item.html',
  styleUrl: './todo-item.css',
})
export class TodoItem {
  readonly todo = input.required<Todo>();

  readonly toggle = output<void>();
  readonly rename = output<string>();
  readonly remove = output<void>();
}
