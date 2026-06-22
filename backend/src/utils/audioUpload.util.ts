import multer from 'multer';

export const audioUpload = multer({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('audio/')) {
      cb(new Error('Only audio files allowed'));
    }
    cb(null, true);
  },
});
