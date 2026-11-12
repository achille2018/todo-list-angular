import { createApp } from './app.js';
import { env } from './config/env.js';
import { JsonFileTodoRepository } from './modules/todos/index.js';

const app = createApp({
  todoRepository: new JsonFileTodoRepository(env.dataFile, env.seedFile),
  corsOrigin: env.corsOrigins,
  corsAllowLocalhost: env.corsAllowLocalhost,
});

const server = app.listen(env.port, () => {
  console.log(`API TODO LIST démarrée sur http://localhost:${env.port}/api (${env.nodeEnv})`);
});

// Arrêt propre : on termine les requêtes en cours avant de quitter
function shutdown(signal: string): void {
  console.log(`${signal} reçu, arrêt du serveur…`);
  server.close(() => process.exit(0));
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
