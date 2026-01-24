import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import * as schema from './schema';

const DB_NAME = 'gymmoradb2';

// Cache database connections
let sqliteDb: SQLite.SQLiteDatabase | null = null;
let drizzleInstance: any = null;

// Helper to get DB asynchronously (works on both web and native)
export async function getDb() {
  if (Platform.OS === 'web') return null; // Web not supported with this setup yet
  
  if (!sqliteDb) {
    sqliteDb = await SQLite.openDatabaseAsync(DB_NAME);
  }
  
  if (!drizzleInstance) {
    drizzleInstance = drizzle(sqliteDb, { schema });
  }
  
  return drizzleInstance;
}

// For immediate use if already initialized, but preferred to use getDb()
export const db = drizzleInstance;
export const expoDb = sqliteDb;
