import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

const PORT = env.PORT || 4000;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
