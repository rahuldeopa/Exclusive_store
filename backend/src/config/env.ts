import dotenv from 'dotenv';
dotenv.config();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  PORT: process.env.PORT ? Number(process.env.PORT) : 4000,
  MASTER_PASSCODE: process.env.MASTER_PASSCODE || '',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};
