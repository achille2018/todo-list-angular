import { HttpError } from '../../common/errors/http-error.js';
import type { Todo, TodoFilter } from './todo.model.js';
import type { TodoRepository } from './todo.repository.js';
import type { CreateTodoDto, UpdateTodoDto } from './todo.schemas.js';

/** Logique métier des tâches. Indépendant d'Express et du mode de stockage. */
export class TodoService {
  constructor(private readonly repository: TodoRepository) {}

  findAll(filter?: TodoFilter): Promise<Todo[]> {
    return this.repository.findAll(filter);
  }

  async findById(id: number): Promise<Todo> {
    const todo = await this.repository.findById(id);
    if (!todo) throw HttpError.notFound(`Tâche ${id} introuvable`);
    return todo;
  }

  create(data: CreateTodoDto): Promise<Todo> {
    return this.repository.create(data);
  }

  async update(id: number, changes: UpdateTodoDto): Promise<Todo> {
    const todo = await this.repository.update(id, changes);
    if (!todo) throw HttpError.notFound(`Tâche ${id} introuvable`);
    return todo;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw HttpError.notFound(`Tâche ${id} introuvable`);
  }
}
