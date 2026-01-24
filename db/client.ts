import { drizzle, ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import * as schema from './schema';

const DB_NAME = 'gymmoradb2';

// Cache database connections
let sqliteDb: SQLite.SQLiteDatabase | null = null;
// let drizzleInstance: ExpoSQLiteDatabase<typeof schema> & {
//   $client: SQLite.SQLiteDatabase;
// } | null = null;

// Helper to get DB asynchronously (works on both web and native)
export async function getDb() {
  if (Platform.OS === 'web') return null; // Web not supported with this setup yet

  if (!sqliteDb) {
    sqliteDb = await SQLite.openDatabaseAsync(DB_NAME);
  }

  return drizzle(sqliteDb, { schema });
}

// For immediate use if already initialized, but preferred to use getDb()
export const expoDb = sqliteDb;
