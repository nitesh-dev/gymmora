import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { exerciseService } from '../services/exercise.service';

export function useExerciseStudioViewModel(id?: string) {
    const queryClient = useQueryClient();
    const isNew = id === 'new' || !id;

    const { data: exercise, isLoading } = useQuery({
        queryKey: ['exercise-detail', id],
        queryFn: () => (id && !isNew ? exerciseService.getExerciseById(id) : null),
        enabled: !!id && !isNew,
    });

    const [localExercise, setLocalExercise] = useState<any>({
        title: '',
        url: '',
        overview: '',
        gifUrl: '',
        musclesWorkedImg: '',
        content: [],
        musclesWorked: [],
        muscleGroups: [],
        equipment: [],
    });

    useEffect(() => {
        if (exercise) {
            setLocalExercise(exercise);
        }
    }, [exercise]);

    const saveMutation = useMutation({
        mutationFn: (data: any) => 
            isNew ? exerciseService.createExercise(data) : exerciseService.updateExercise(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
            queryClient.invalidateQueries({ queryKey: ['exercise-detail', id] });
            notifications.show({
                title: 'Success',
                message: `Exercise ${isNew ? 'created' : 'updated'} successfully`,
                color: 'green',
            });
        },
        onError: (err: any) => {
            notifications.show({
                title: 'Error',
                message: err.message || 'Failed to save exercise',
                color: 'red',
            });
        }
    });

    const updateField = (field: string, value: any) => {
        setLocalExercise((prev: any) => ({ ...prev, [field]: value }));
    };

    const addContent = (type: string) => {
        setLocalExercise((prev: any) => ({
            ...prev,
            content: [
                ...prev.content,
                { id: crypto.randomUUID(), contentType: type, contentText: '', orderIndex: prev.content.length }
            ]
        }));
    };

    const removeContent = (contentId: string) => {
        setLocalExercise((prev: any) => ({
            ...prev,
            content: prev.content.filter((c: any) => c.id !== contentId)
        }));
    };

    const updateContent = (contentId: string, text: string) => {
        setLocalExercise((prev: any) => ({
            ...prev,
            content: prev.content.map((c: any) => c.id === contentId ? { ...c, contentText: text } : c)
        }));
    };

    const addMuscle = () => {
        setLocalExercise((prev: any) => ({
            ...prev,
            musclesWorked: [...prev.musclesWorked, { id: crypto.randomUUID(), name: '', percentage: 100 }]
        }));
    };

    const updateMuscle = (muscleId: string, data: any) => {
        setLocalExercise((prev: any) => ({
            ...prev,
            musclesWorked: prev.musclesWorked.map((m: any) => m.id === muscleId ? { ...m, ...data } : m)
        }));
    };

    const removeMuscle = (muscleId: string) => {
        setLocalExercise((prev: any) => ({
            ...prev,
            musclesWorked: prev.musclesWorked.filter((m: any) => m.id !== muscleId)
        }));
    };

    const addTag = (field: 'muscleGroups' | 'equipment', name: string) => {
        if (!name) return;
        setLocalExercise((prev: any) => ({
            ...prev,
            [field]: [...prev[field], { id: crypto.randomUUID(), name }]
        }));
    };

    const removeTag = (field: 'muscleGroups' | 'equipment', tagId: string) => {
        setLocalExercise((prev: any) => ({
            ...prev,
            [field]: prev[field].filter((t: any) => t.id !== tagId)
        }));
    };

    const save = async () => {
        const payload = {
            exercise: {
                title: localExercise.title,
                url: localExercise.url,
                overview: localExercise.overview,
                gifUrl: localExercise.gifUrl,
                musclesWorkedImg: localExercise.musclesWorkedImg,
            },
            content: localExercise.content.map((c: any, index: number) => ({
                contentType: c.contentType,
                contentText: c.contentText,
                orderIndex: index
            })),
            musclesWorked: localExercise.musclesWorked.map((m: any) => ({
                name: m.name,
                percentage: m.percentage
            })),
            muscleGroups: localExercise.muscleGroups.map((g: any) => ({ name: g.name })),
            equipment: localExercise.equipment.map((e: any) => ({ name: e.name })),
        };
        return await saveMutation.mutateAsync(payload);
    };

    return {
        exercise: localExercise,
        isLoading,
        isSaving: saveMutation.isPending,
        updateField,
        addContent,
        removeContent,
        updateContent,
        addMuscle,
        updateMuscle,
        removeMuscle,
        addTag,
        removeTag,
        save
    };
}
