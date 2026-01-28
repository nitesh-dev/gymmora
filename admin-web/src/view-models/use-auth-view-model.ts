import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

export function useAuthViewModel() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading: isInitializing } = useQuery({
    queryKey: ['auth-user'],
    queryFn: () => authService.getSession(),
    staleTime: Infinity,
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(['auth-user'], null);
      navigate('/login');
      notifications.show({
        title: 'Logged out',
        message: 'You have been successfully logged out.',
        color: 'blue',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Logout failed',
        message: error.message || 'An error occurred during logout.',
        color: 'red',
      });
    },
  });

  return {
    user,
    isInitializing,
    isAuthenticated: !!user,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
}
