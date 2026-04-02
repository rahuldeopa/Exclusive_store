import { Router } from 'express';
import { getBook, getBookVideos, getBookAudio } from '../controllers/book.controller';

const router = Router();

// Assuming frontend sends the verification passcode to fetch the exact book
router.get('/:passcode', getBook);
router.get('/videos/:passcode', getBookVideos);
router.get('/audio/:passcode', getBookAudio);

export default router;
