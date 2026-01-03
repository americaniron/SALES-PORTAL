import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Function to initialize DB connection with the specific environment variable
export const getDb = (connectionString: string) => {
  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
};