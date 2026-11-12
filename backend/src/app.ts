import cors from 'cors';
import express, { type Express } from 'express';
import { errorHandler } from './common/middlewares/error-handler.js';
import { notFound } from './common/middlewares/not-found.js';
import { requestLogger } from './common/middlewares/request-logger.js';
import { createTodoModule, type TodoRepository } from './modules/todos/index.js';

export interface AppOptions {
  todoRepository: TodoRepository;
  corsOrigin: string;
  logRequests?: boolean;
}

/** Crée l'application Express (sans la démarrer, ce qui permet de la tester). */
export function createApp({ todoRepository, corsOrigin, logRequests = true }: AppOptions): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: '10kb' }));
  if (logRequests) app.use(requestLogger);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });
  app.use('/api/todos', createTodoModule(todoRepository).router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
