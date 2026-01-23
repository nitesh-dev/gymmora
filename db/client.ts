import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import * as schema from './schema';

const DB_NAME = 'gymmoradb';

export const expoDb = Platform.OS === 'web' 
  ? null 
  : SQLite.openDatabaseSync(DB_NAME);

export const db = expoDb ? drizzle(expoDb, { schema }) : null;

// Helper to get DB asynchronously (works on both web and native)
export async function getDb() {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  return drizzle(db, { schema });
}
