import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Exercise } from '../models/exercise';
import { exerciseService } from '../services/exercise.service';

export function useExercisesViewModel() {
  const queryClient = useQueryClient();

  const { data: exercises = [], isLoading, error } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => exerciseService.getAllExercises(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => exerciseService.deleteExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      notifications.show({
        title: 'Exercise removed',
        message: 'The exercise has been soft-deleted.',
        color: 'green',
      });
    },
    onError: (err: any) => {
      notifications.show({
        title: 'Delete failed',
        message: err.message || 'Could not remove exercise',
        color: 'red',
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Exercise>) => exerciseService.createExercise(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      notifications.show({
        title: 'Success',
        message: 'Exercise created successfully',
        color: 'green',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Exercise> }) =>
      exerciseService.updateExercise(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      notifications.show({
        title: 'Success',
        message: 'Exercise updated successfully',
        color: 'green',
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: (data: any[]) => exerciseService.importExercises(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      notifications.show({
        title: 'Import Successful',
        message: `Successfully imported ${res.count} exercises`,
        color: 'green',
      });
    },
    onError: (err: any) => {
      notifications.show({
        title: 'Import Failed',
        message: err.message || 'Could not import exercises',
        color: 'red',
      });
    },
  });

  const confirmDelete = (id: string, title: string) => {
    modals.openConfirmModal({
      title: 'Remove Exercise',
      children: (
        <Text size="sm">
          Are you sure you want to remove <b>{title}</b>? This will archive the exercise (soft-delete).
        </Text>
      ),
      labels: { confirm: 'Remove', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  return {
    exercises,
    isLoading,
    error,
    deleteExercise: confirmDelete,
    createExercise: createMutation.mutateAsync,
    updateExercise: updateMutation.mutateAsync,
    importExercises: importMutation.mutateAsync,
    isProcessing: deleteMutation.isPending || createMutation.isPending || updateMutation.isPending || importMutation.isPending,
  };
}
