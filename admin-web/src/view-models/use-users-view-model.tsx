import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { Text } from '@mantine/core';

export function useUsersViewModel() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      notifications.show({
        title: 'User deleted',
        message: 'The user has been successfully removed.',
        color: 'green',
      });
    },
    onError: (err: any) => {
      notifications.show({
        title: 'Delete failed',
        message: err.message || 'Could not delete user',
        color: 'red',
      });
    },
  });

  const confirmDelete = (userId: string, userName: string | null) => {
    modals.openConfirmModal({
      title: 'Delete User',
      children: (
        <Text size="sm">
          Are you sure you want to delete <b>{userName || 'this user'}</b>? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(userId),
    });
  };

  return {
    users,
    isLoading,
    error,
    deleteUser: confirmDelete,
    isDeleting: deleteMutation.isPending,
  };
}
