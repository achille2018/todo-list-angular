import type { Request, Response } from 'express';
import { validate } from '../../common/utils/validate.js';
import {
  createTodoSchema,
  listTodosQuerySchema,
  todoIdParamsSchema,
  updateTodoSchema,
} from './todo.schemas.js';
import type { TodoService } from './todo.service.js';

/**
 * Couche HTTP : lit et valide la requête, appelle le service, renvoie la réponse.
 * Express 5 transmet automatiquement les erreurs des fonctions async à errorHandler.
 */
export class TodoController {
  constructor(private readonly service: TodoService) {}

  /** GET /api/todos?completed=true|false */
  findAll = async (req: Request, res: Response): Promise<void> => {
    const query = validate(listTodosQuerySchema, req.query);
    res.json(await this.service.findAll(query));
  };

  /** GET /api/todos/:id */
  findById = async (req: Request, res: Response): Promise<void> => {
    const { id } = validate(todoIdParamsSchema, req.params);
    res.json(await this.service.findById(id));
  };

  /** POST /api/todos */
  create = async (req: Request, res: Response): Promise<void> => {
    const body = validate(createTodoSchema, req.body);
    const todo = await this.service.create(body);
    res.status(201).location(`${req.baseUrl}/${todo.id}`).json(todo);
  };

  /** PATCH /api/todos/:id */
  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = validate(todoIdParamsSchema, req.params);
    const body = validate(updateTodoSchema, req.body);
    res.json(await this.service.update(id, body));
  };

  /** DELETE /api/todos/:id */
  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = validate(todoIdParamsSchema, req.params);
    await this.service.delete(id);
    res.status(204).end();
  };
}
