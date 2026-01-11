import express from 'express';
import intakeRoutes from './modules/intake/intake.routes';

const app = express();

app.use(express.json());

// Routes
app.use('/api/intake', intakeRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Posta Online', mode: process.env.NODE_ENV });
});

export default app;
