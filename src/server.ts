import 'dotenv/config';
import express, { json } from 'express';
import cors from 'cors';
import { setupPostgres } from './database/postgres.connection';
import { routes } from './routes';
import { errorHandler } from './middleware/error-handler.middleware';

setupPostgres().then(() => {
  const app = express();
  app.use(cors({ origin: process.env.FRONT_URL }));
  app.use(json());
  app.use(routes);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3333;
  app.listen(PORT, () => console.log(`🚀 App is running at port ${PORT}`));
});
