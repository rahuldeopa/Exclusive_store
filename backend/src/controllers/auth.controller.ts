import { Request, Response } from 'express';
import { loginAdminService, verifyPasscodeService } from '../services/auth.service';
import { handleResponse, handleError } from '../utils/response.util';

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const result = await loginAdminService(password, username);
    handleResponse(res, 200, 'Login successful', result);
  } catch (error) {
    handleError(res, error);
  }
};

export const verifyPasscode = async (req: Request, res: Response) => {
  try {
    const { passcode } = req.body;
    const result = await verifyPasscodeService(passcode);
    handleResponse(res, 200, 'Passcode verified', result);
  } catch (error) {
    handleError(res, error);
  }
};
