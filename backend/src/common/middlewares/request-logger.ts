import type { RequestHandler } from 'express';

/** Affiche chaque requête : méthode, URL, statut et durée. */
export const requestLogger: RequestHandler = (req, res, next) => {
  const start = performance.now();
  res.on('finish', () => {
    const duration = (performance.now() - start).toFixed(1);
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration} ms`);
  });
  next();
};
