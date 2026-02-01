import { Router } from 'express';
import { getAllContent, deleteContent, updateContent } from '../controllers/admin.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes
router.use(authenticateAdmin);

router.get('/content', getAllContent);
router.delete('/content/:id', deleteContent);
router.put('/content/:id', updateContent);

export default router;
