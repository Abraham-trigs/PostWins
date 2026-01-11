import { Router } from 'express';
import { handleIntake } from './intake.controller';

const router = Router();



// Endpoint for POST /api/intake
router.post('/', handleIntake);

export default router;
