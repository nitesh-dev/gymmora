import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { userService } from '../services/user.service';

export function useUserDetailViewModel(id?: string) {
    const queryClient = useQueryClient();

    const { data: user, isLoading } = useQuery({
        queryKey: ['user-detail', id],
        queryFn: () => id ? userService.getUserById(id) : null,
        enabled: !!id,
    });

    // In a real app we would have more details like activity, logs etc.
    // For now we just show basic info and allow role management.

    const updateRoleMutation = useMutation({
        mutationFn: (role: string) => api.put(`/users/${id}/role`, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-detail', id] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            notifications.show({
                title: 'Success',
                message: 'User role updated successfully',
                color: 'green',
            });
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: () => userService.deleteUser(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            notifications.show({
                title: 'Success',
                message: 'User deleted successfully',
                color: 'green',
            });
        }
    });

    return {
        user,
        isLoading,
        updateRole: updateRoleMutation.mutateAsync,
        isUpdating: updateRoleMutation.isPending,
        deleteUser: deleteUserMutation.mutateAsync,
        isDeleting: deleteUserMutation.isPending
    };
}
