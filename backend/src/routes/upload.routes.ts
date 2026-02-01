import { Router } from 'express';
import { upload, uploadFileData, deleteUploadedFile } from '../controllers/upload.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';

const router = Router();

// Protect upload also
router.post('/', authenticateAdmin, upload.single('file'), uploadFileData);
router.delete('/', authenticateAdmin, deleteUploadedFile);

export default router;
