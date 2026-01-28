import { Center, Loader } from '@mantine/core';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { useAuthViewModel } from './view-models/use-auth-view-model';
import { DashboardView } from './views/DashboardView';
import { ExerciseStudioView } from './views/ExerciseStudioView';
import { ExercisesView } from './views/ExercisesView';
import { LoginView } from './views/LoginView';
import { PlanStudioView } from './views/PlanStudioView';
import { PlansView } from './views/PlansView';
import { UserDetailView } from './views/UserDetailView';
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
          <Route index element={<DashboardView />} />
          
          <Route path="exercises" element={<ExercisesView />} />
          <Route path="exercises/new" element={<ExerciseStudioView />} />
          <Route path="exercises/:id" element={<ExerciseStudioView />} />
          
          <Route path="plans" element={<PlansView />} />
          <Route path="plans/new" element={<PlanStudioView />} />
          <Route path="plans/:id" element={<PlanStudioView />} />
          
          <Route path="users" element={<UsersView />} />
          <Route path="users/:id" element={<UserDetailView />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
