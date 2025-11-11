import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables for tests
config({ path: resolve(process.cwd(), '.env.local') });

