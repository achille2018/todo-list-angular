import { TodoController } from './todo.controller.js';
import type { TodoRepository } from './todo.repository.js';
import { createTodoRouter } from './todo.routes.js';
import { TodoService } from './todo.service.js';

/** Assemble le module : repository → service → contrôleur → routes */
export function createTodoModule(repository: TodoRepository) {
  const service = new TodoService(repository);
  const controller = new TodoController(service);
  return { router: createTodoRouter(controller) };
}

export { JsonFileTodoRepository } from './todo.repository.js';
export type { TodoRepository } from './todo.repository.js';
