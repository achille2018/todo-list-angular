import path from 'node:path';
import { z } from 'zod';

// Charge le fichier .env s'il existe (fonctionnalité native de Node.js >= 20.12)
try {
  process.loadEnvFile();
} catch {
  // Pas de fichier .env : on garde les variables d'environnement du système
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  CORS_ORIGIN: z.string().default('http://localhost:4200'),
  DATA_FILE: z.string().default('data/todos.json'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Configuration invalide :', z.flattenError(parsed.error).fieldErrors);
  process.exit(1);
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  corsOrigin: parsed.data.CORS_ORIGIN,
  dataFile: path.resolve(parsed.data.DATA_FILE),
  seedFile: path.resolve('data/seed.json'),
} as const;
