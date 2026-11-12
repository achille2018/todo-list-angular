import { Router } from 'express';
import type { TodoController } from './todo.controller.js';

export function createTodoRouter(controller: TodoController): Router {
  const router = Router();

  router.get('/', controller.findAll);
  router.post('/', controller.create);
  router.get('/:id', controller.findById);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}
