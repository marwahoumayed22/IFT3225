require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const devicesRoutes = require('./routes/devices.routes');
const measurementsRoutes = require('./routes/measurements.routes');
const observationsRoutes = require('./routes/observations.routes');
const ambianceRoutes = require('./routes/ambiance.routes');

const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.json({ name: 'Ambiance API', status: 'ok' }));

app.use('/devices', devicesRoutes);
app.use('/measurements', measurementsRoutes);
app.use('/observations', observationsRoutes);
app.use('/ambiance', ambianceRoutes);

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
