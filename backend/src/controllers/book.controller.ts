import { Request, Response } from 'express';
import { handleResponse, handleError } from '../utils/response.util';
import { getBookContentService, getBookVideosService, getBookAudioService } from '../services/book.service';

export const getBook = async (req: Request, res: Response) => {
  try {
    const { passcode } = req.params;
    const content = await getBookContentService(passcode);
    handleResponse(res, 200, 'Book retrieved successfully', content);
  } catch (error) {
    handleError(res, error);
  }
};

export const getBookVideos = async (req: Request, res: Response) => {
  try {
    const { passcode } = req.params;
    const videos = await getBookVideosService(passcode);
    handleResponse(res, 200, 'Videos retrieved successfully', videos);
  } catch (error) {
    handleError(res, error);
  }
};

export const getBookAudio = async (req: Request, res: Response) => {
  try {
    const { passcode } = req.params;
    const audio = await getBookAudioService(passcode);
    handleResponse(res, 200, 'Audio retrieved successfully', audio);
  } catch (error) {
    handleError(res, error);
  }
};
