import {
    Accordion,
    ActionIcon,
    Badge,
    Box,
    Button,
    Card,
    Grid,
    Group,
    Modal,
    NumberInput,
    Paper,
    ScrollArea,
    Select,
    Stack,
    Text,
    TextInput,
    Title
} from '@mantine/core';
import {
    IconCalendar,
    IconChevronLeft,
    IconClipboardList,
    IconDeviceFloppy,
    IconPlus,
    IconSearch,
    IconTrash
} from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExercisesViewModel } from '../view-models/use-exercises-view-model';
import { usePlanStudioViewModel } from '../view-models/use-plan-studio-view-model';

export function PlanStudioView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { 
        plan, 
        isLoading, 
        isSaving, 
        updateBasicInfo, 
        addWeek, 
        addDay, 
        addExercise, 
        updateExercise,
        removeExercise,
        save 
    } = usePlanStudioViewModel(id);
    
    const { exercises } = useExercisesViewModel();
    const [exerciseSearch, setExerciseSearch] = useState('');
    const [pickerOpen, setPickerOpen] = useState<{ weekId: string, dayId: string } | null>(null);

    const filteredExercises = exercises.filter(ex => 
        ex.title.toLowerCase().includes(exerciseSearch.toLowerCase())
    );

    if (isLoading) return <Text>Loading Studio...</Text>;

    return (
        <Stack gap="xl">
            {/* Header */}
            <Group justify="space-between">
                <Group>
                    <ActionIcon variant="subtle" onClick={() => navigate('/plans')}>
                        <IconChevronLeft size={20} />
                    </ActionIcon>
                    <Box>
                        <Title order={2} fw={800} style={{ letterSpacing: '-0.5px' }}>
                            {id === 'new' ? 'New Workout Plan' : 'Edit Plan Studio'}
                        </Title>
                        <Text c="dimmed" size="sm">Design the structure, sets and reps for this template.</Text>
                    </Box>
                </Group>
                <Button 
                    leftSection={<IconDeviceFloppy size={18} />} 
                    color="indigo" 
                    loading={isSaving}
                    onClick={async () => {
                        await save();
                        navigate('/plans');
                    }}
                >
                    Save Plan
                </Button>
            </Group>

            <Grid gutter="xl">
                {/* Basic Info Panel */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper withBorder p="xl" radius="md">
                        <Stack gap="md">
                            <Title order={4} mb="xs">Basic Information</Title>
                            <TextInput 
                                label="Plan Name" 
                                placeholder="PPL Advanced, Bro Split, etc."
                                value={plan.name}
                                onChange={(e) => updateBasicInfo('name', e.target.value)}
                                required
                            />
                            <Select 
                                label="Plan Type"
                                data={['SYSTEM', 'CUSTOM']}
                                value={plan.type}
                                onChange={(val) => updateBasicInfo('type', val)}
                            />
                            <Select 
                                label="Visibility"
                                data={['PUBLIC', 'PRIVATE', 'SYSTEM']}
                                value={plan.visibility}
                                onChange={(val) => updateBasicInfo('visibility', val)}
                            />
                            <Select 
                                label="Status"
                                data={['active', 'inactive']}
                                value={plan.status}
                                onChange={(val) => updateBasicInfo('status', val)}
                            />
                        </Stack>
                    </Paper>
                </Grid.Col>

                {/* Training Structure Panel */}
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="md">
                        <Group justify="space-between">
                            <Title order={4}>Training Structure</Title>
                            <Button 
                                variant="light" 
                                leftSection={<IconPlus size={16} />} 
                                size="xs"
                                onClick={addWeek}
                            >
                                Add Week
                            </Button>
                        </Group>

                        {plan.weeks?.length === 0 && (
                            <Paper withBorder p="xl" radius="md" style={{ borderStyle: 'dashed', textAlign: 'center' }}>
                                <Text c="dimmed">No weeks added yet. Start by adding a training week.</Text>
                            </Paper>
                        )}

                        <Accordion variant="separated" radius="md">
                            {plan.weeks?.map((week) => (
                                <Accordion.Item key={week.id} value={week.id}>
                                    <Accordion.Control>
                                        <Group justify="space-between" pr="md">
                                            <Text fw={700}>{week.label}</Text>
                                            <Badge variant="light">{week.days.length} Days</Badge>
                                        </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <Stack gap="xl">
                                            {week.days.map((day) => (
                                                <Card key={day.id} withBorder radius="md">
                                                    <Group justify="space-between" mb="md">
                                                        <Group gap="xs">
                                                            <IconCalendar size={18} color="var(--mantine-color-indigo-6)" />
                                                            <Text fw={600}>{day.dayLabel}</Text>
                                                        </Group>
                                                        <Button 
                                                            variant="subtle" 
                                                            size="compact-xs" 
                                                            leftSection={<IconPlus size={14} />}
                                                            onClick={() => setPickerOpen({ weekId: week.id, dayId: day.id })}
                                                        >
                                                            Add Exercise
                                                        </Button>
                                                    </Group>

                                                    <Stack gap="xs">
                                                        {day.exercises.map((ex) => {
                                                            const exerciseDetails = exercises.find(e => e.id === ex.exerciseId);
                                                            return (
                                                                <Group key={ex.id} wrap="nowrap" gap="xs" style={{ borderBottom: '1px solid var(--mantine-color-gray-1)', paddingBottom: '8px' }}>
                                                                    <Box style={{ flex: 1 }}>
                                                                        <Text size="sm" fw={600}>{exerciseDetails?.title || 'Unknown Exercise'}</Text>
                                                                    </Box>
                                                                    <Group gap="xs">
                                                                        <NumberInput 
                                                                            size="xs" 
                                                                            w={60} 
                                                                            label="Sets" 
                                                                            value={ex.sets}
                                                                            onChange={(val) => updateExercise(week.id, day.id, ex.id, { sets: val })}
                                                                        />
                                                                        <NumberInput 
                                                                            size="xs" 
                                                                            w={60} 
                                                                            label="Reps" 
                                                                            value={ex.reps}
                                                                            onChange={(val) => updateExercise(week.id, day.id, ex.id, { reps: val })} 
                                                                        />
                                                                        <ActionIcon 
                                                                            variant="subtle" 
                                                                            color="red" 
                                                                            mt="xl"
                                                                            onClick={() => removeExercise(week.id, day.id, ex.id)}
                                                                        >
                                                                            <IconTrash size={16} />
                                                                        </ActionIcon>
                                                                    </Group>
                                                                </Group>
                                                            );
                                                        })}

                                                        {day.exercises.length === 0 && (
                                                            <Text size="xs" c="dimmed" fs="italic">No exercises assigned to this day.</Text>
                                                        )}
                                                    </Stack>
                                                </Card>
                                            ))}
                                            <Button 
                                                variant="outline" 
                                                style={{ borderStyle: 'dashed' }}
                                                leftSection={<IconPlus size={16} />}
                                                onClick={() => addDay(week.id)}
                                            >
                                                Add Day to {week.label}
                                            </Button>
                                        </Stack>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    </Stack>
                </Grid.Col>
            </Grid>

            {/* Exercise Picker Modal */}
            <Modal 
                opened={!!pickerOpen} 
                onClose={() => setPickerOpen(null)} 
                title="Select Exercise"
                size="lg"
                radius="md"
            >
                <Stack gap="md">
                    <TextInput 
                        placeholder="Search exercises..." 
                        leftSection={<IconSearch size={16} />}
                        value={exerciseSearch}
                        onChange={(e) => setExerciseSearch(e.target.value)}
                    />
                    <ScrollArea h={400}>
                        <Stack gap={4}>
                            {filteredExercises.map(ex => (
                                <Group 
                                    key={ex.id} 
                                    justify="space-between" 
                                    p="xs" 
                                    style={{ 
                                        borderRadius: '8px', 
                                        cursor: 'pointer',
                                    }}
                                    className="hover-bg-gray"
                                    onClick={() => {
                                        if (pickerOpen) {
                                            addExercise(pickerOpen.weekId, pickerOpen.dayId, ex.id);
                                            setPickerOpen(null);
                                            setExerciseSearch('');
                                        }
                                    }}
                                >
                                    <Group gap="sm">
                                        <IconClipboardList size={18} color="var(--mantine-color-gray-5)" />
                                        <Text size="sm" fw={500}>{ex.title}</Text>
                                    </Group>
                                    <IconPlus size={16} color="var(--mantine-color-indigo-6)" />
                                </Group>
                            ))}
                        </Stack>
                    </ScrollArea>
                </Stack>
            </Modal>
        </Stack>
    );
}
