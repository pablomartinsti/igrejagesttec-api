import 'dotenv/config';
import express, { json } from 'express';
import cors from 'cors';
import { setupPostgres } from './database/postgres.connection';
import { routes } from './routes';
import { errorHandler } from './middleware/error-handler.middleware';

setupPostgres().then(() => {
  const app = express();
  const allowedOrigins = (process.env.FRONT_URL || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins.length > 0 ? allowedOrigins : undefined,
    }),
  );
  app.use(json());
  app.use(routes);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3333;
  app.listen(PORT, () => console.log(`🚀 App is running at port ${PORT}`));
});
