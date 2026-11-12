import cors from 'cors';
import express, { type Express } from 'express';
import { errorHandler } from './common/middlewares/error-handler.js';
import { notFound } from './common/middlewares/not-found.js';
import { requestLogger } from './common/middlewares/request-logger.js';
import { createTodoModule, type TodoRepository } from './modules/todos/index.js';

export interface AppOptions {
  todoRepository: TodoRepository;
  /** Origine(s) autorisée(s) à appeler l'API depuis un navigateur */
  corsOrigin: string | string[];
  /** Autorise aussi http://localhost:<n'importe quel port> (utile en développement) */
  corsAllowLocalhost?: boolean;
  logRequests?: boolean;
}

const LOCALHOST_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

/** Crée l'application Express (sans la démarrer, ce qui permet de la tester). */
export function createApp({
  todoRepository,
  corsOrigin,
  corsAllowLocalhost = false,
  logRequests = true,
}: AppOptions): Express {
  const app = express();
  const allowedOrigins = new Set(Array.isArray(corsOrigin) ? corsOrigin : [corsOrigin]);

  app.disable('x-powered-by');
  app.use(
    cors({
      origin: (origin, callback) => {
        const allowed =
          !origin || allowedOrigins.has(origin) || (corsAllowLocalhost && LOCALHOST_ORIGIN.test(origin));
        callback(null, allowed);
      },
    }),
  );
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
