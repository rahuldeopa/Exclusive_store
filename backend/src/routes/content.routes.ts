import { Router } from 'express';
import { createContentController } from '../controllers/content.controller';

const router = Router();

router.post('/create', createContentController);

export default router;
