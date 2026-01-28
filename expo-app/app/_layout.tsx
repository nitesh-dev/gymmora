import * as schema from '@/db/schema';
import { SeedService } from '@/services/seed-service';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { getDb } from '../db/client';
import migrations from '../drizzle/migrations';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [db, setDb] = useState<ExpoSQLiteDatabase<typeof schema> | null>(null);

  useEffect(() => {
    if (!db) {
      console.log('Initializing database for web...');
      getDb()
        .then((initializedDb) => {
          console.log('Database initialized successfully');
          setDb(initializedDb);
        })
        .catch((err) => {
          console.error('Failed to initialize database:', err);
        });
    }
  }, []);

  return (
    <ActionSheetProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {db ? (
          <AppContent db={db} />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <StatusBar style="auto" />
      </ThemeProvider>
    </ActionSheetProvider>
  );
}

function AppContent({ db }: { db: ExpoSQLiteDatabase<typeof schema> }) {
  console.log('Running migrations...');
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    async function initializeData() {
      if (success) {
        console.log('Migrations completed successfully');
        await SeedService.seedIfNeeded(db);
        SplashScreen.hideAsync();
      }
    }
    initializeData();

    if (error) {
      console.error('Migration failed:', error);
      SplashScreen.hideAsync();
    }
  }, [success, error, db]);

  if (!success && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
