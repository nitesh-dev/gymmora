import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { getDb, db as staticDb } from '../db/client';
import migrations from '../drizzle/migrations';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [db, setDb] = useState(staticDb);

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
  );
}

function AppContent({ db }: { db: any }) {
  console.log('Running migrations...');
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (success) {
      console.log('Migrations completed successfully');
      SplashScreen.hideAsync();
    }
    if (error) {
      console.error('Migration failed:', error);
      SplashScreen.hideAsync();
    }
  }, [success, error]);

  if (!success && !error) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}
