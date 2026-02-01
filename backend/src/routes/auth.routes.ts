import { Router } from 'express';
import { loginAdmin, verifyPasscode } from '../controllers/auth.controller';

const router = Router();

router.post('/login', loginAdmin);
router.post('/verify', verifyPasscode);

export default router;
