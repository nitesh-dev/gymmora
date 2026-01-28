import { Center, Loader } from '@mantine/core';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { useAuthViewModel } from './view-models/use-auth-view-model';
import { LoginView } from './views/LoginView';
import { UsersView } from './views/UsersView';

// Protection Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuthViewModel();

  if (isInitializing) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<div>Dashboard Placeholder</div>} />
          <Route path="users" element={<UsersView />} />
          <Route path="exercises" element={<div>Exercises Management Placeholder</div>} />
          <Route path="plans" element={<div>Workout Plans Placeholder</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
