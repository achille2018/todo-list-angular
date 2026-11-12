import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Todo, TodoFilter } from './todo.model.js';
import type { CreateTodoDto, UpdateTodoDto } from './todo.schemas.js';

/**
 * Contrat d'accès aux données. Le service ne dépend que de cette interface :
 * on peut remplacer le stockage (fichier JSON, SQLite, MongoDB…) sans toucher au reste.
 */
export interface TodoRepository {
  findAll(filter?: TodoFilter): Promise<Todo[]>;
  findById(id: number): Promise<Todo | undefined>;
  create(data: CreateTodoDto): Promise<Todo>;
  update(id: number, changes: UpdateTodoDto): Promise<Todo | undefined>;
  delete(id: number): Promise<boolean>;
}

/**
 * Stockage dans un fichier JSON.
 *  - Les données sont gardées en mémoire après la première lecture.
 *  - Chaque écriture passe par un fichier temporaire puis un renommage (pas de fichier corrompu).
 *  - Les écritures sont mises en file d'attente pour ne jamais se chevaucher.
 *  - Si le fichier n'existe pas, les données de départ sont lues dans le fichier seed (s'il est fourni).
 */
export class JsonFileTodoRepository implements TodoRepository {
  private todos?: Promise<Todo[]>;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(
    private readonly filePath: string,
    private readonly seedFilePath?: string,
  ) {}

  async findAll(filter: TodoFilter = {}): Promise<Todo[]> {
    const todos = await this.load();
    return todos
      .filter((todo) => filter.completed === undefined || todo.completed === filter.completed)
      .map((todo) => ({ ...todo }));
  }

  async findById(id: number): Promise<Todo | undefined> {
    const todo = (await this.load()).find((t) => t.id === id);
    return todo && { ...todo };
  }

  async create(data: CreateTodoDto): Promise<Todo> {
    const todos = await this.load();
    const now = new Date().toISOString();
    const todo: Todo = {
      id: todos.reduce((max, t) => Math.max(max, t.id), 0) + 1,
      title: data.title,
      completed: data.completed,
      createdAt: now,
      updatedAt: now,
    };
    todos.push(todo);
    await this.persist(todos);
    return { ...todo };
  }

  async update(id: number, changes: UpdateTodoDto): Promise<Todo | undefined> {
    const todos = await this.load();
    const todo = todos.find((t) => t.id === id);
    if (!todo) return undefined;

    if (changes.title !== undefined) todo.title = changes.title;
    if (changes.completed !== undefined) todo.completed = changes.completed;
    todo.updatedAt = new Date().toISOString();

    await this.persist(todos);
    return { ...todo };
  }

  async delete(id: number): Promise<boolean> {
    const todos = await this.load();
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return false;

    todos.splice(index, 1);
    await this.persist(todos);
    return true;
  }

  private load(): Promise<Todo[]> {
    this.todos ??= this.readInitialData();
    return this.todos;
  }

  private async readInitialData(): Promise<Todo[]> {
    for (const file of [this.filePath, this.seedFilePath]) {
      if (!file) continue;
      try {
        return JSON.parse(await readFile(file, 'utf-8')) as Todo[];
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
    }
    return [];
  }

  private persist(todos: Todo[]): Promise<void> {
    const content = JSON.stringify(todos, null, 2);
    const write = async () => {
      await mkdir(path.dirname(this.filePath), { recursive: true });
      const tmpFile = `${this.filePath}.tmp`;
      await writeFile(tmpFile, content, 'utf-8');
      await rename(tmpFile, this.filePath);
    };
    this.writeQueue = this.writeQueue.then(write, write);
    return this.writeQueue;
  }
}
