import { z } from 'zod';

export const verifyPasscodeSchema = z.object({
  passcode: z.string().min(1, 'Passcode is required'),
});

export type VerifyPasscodeInput = z.infer<typeof verifyPasscodeSchema>;
