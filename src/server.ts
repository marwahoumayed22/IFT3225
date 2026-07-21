import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db';

import devicesRoutes from './routes/devices.routes';
import measurementsRoutes from './routes/measurements.routes';
import observationsRoutes from './routes/observations.routes';
import ambianceRoutes from './routes/ambiance.routes';
import authRoutes from './routes/auth.routes';
import locationsRoutes from './routes/locations.routes';
import usersRoutes from './routes/users.routes';

import errorHandler from './middlewares/errorHandler';
import notFound from './middlewares/notFound';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ name: 'Ambiance API', status: 'ok' }));

app.use('/devices', devicesRoutes);
app.use('/measurements', measurementsRoutes);
app.use('/observations', observationsRoutes);
app.use('/ambiance', ambianceRoutes);
app.use('/auth', authRoutes);
app.use('/locations', locationsRoutes);
app.use('/users', usersRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
  })
  .catch((err) => {
    console.error('Échec de connexion à MongoDB :', err.message);
    process.exit(1);
  });
