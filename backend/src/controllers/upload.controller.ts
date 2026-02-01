import { Request, Response } from 'express';
import multer from 'multer';
import { handleResponse, handleError } from '../utils/response.util';
import { uploadFileToSupabase, deleteFileFromSupabase } from '../utils/storage.util';

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit
  }
});

export const uploadFileData = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw { status: 400, message: 'No file uploaded' };
    }

    const file = req.file;
    const path = await uploadFileToSupabase(file.buffer, file.mimetype, file.originalname);

    handleResponse(res, 200, 'File uploaded successfully', {
      key: path,
      size: file.size,
      mimetype: file.mimetype
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteUploadedFile = async (req: Request, res: Response) => {
  try {
    const { key } = req.body;
    console.log('Delete API requested for key:', key);
    if (!key) {
      throw { status: 400, message: 'File key is required' };
    }

    await deleteFileFromSupabase(key);
    handleResponse(res, 200, 'File deleted successfully');
  } catch (error) {
    handleError(res, error);
  }
};
