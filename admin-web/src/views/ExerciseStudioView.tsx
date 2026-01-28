import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Divider,
    Grid,
    Group,
    Image,
    NumberInput,
    Paper,
    rem,
    Stack,
    Tabs,
    TagsInput,
    Text,
    Textarea,
    TextInput,
    Title,
} from '@mantine/core';
import {
    IconAlertTriangle,
    IconArrowLeft,
    IconBarbell,
    IconCheck,
    IconDeviceFloppy,
    IconInfoCircle,
    IconList,
    IconMessageCircle,
    IconPlus,
    IconTrash
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExerciseStudioViewModel } from '../view-models/use-exercise-studio-view-model';

export function ExerciseStudioView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        exercise,
        isLoading,
        isSaving,
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
    } = useExerciseStudioViewModel(id);

    if (isLoading) return <Text>Loading Studio...</Text>;

    return (
        <Stack gap="xl">
            {/* Header */}
            <Group justify="space-between">
                <Group>
                    <ActionIcon variant="subtle" onClick={() => navigate('/exercises')}>
                        <IconArrowLeft size={20} />
                    </ActionIcon>
                    <Box>
                        <Title order={2} fw={800} style={{ letterSpacing: '-0.5px' }}>
                            {id === 'new' ? 'Create Exercise' : 'Edit Exercise'}
                        </Title>
                        <Text c="dimmed" size="sm">Configure exercise details, visuals and relational content.</Text>
                    </Box>
                </Group>
                <Button
                    leftSection={<IconDeviceFloppy size={18} />}
                    color="indigo"
                    loading={isSaving}
                    onClick={async () => {
                        await save();
                        navigate('/exercises');
                    }}
                >
                    Save Changes
                </Button>
            </Group>

            <Grid gutter="xl">
                {/* Left Side: Visuals and Basic Info */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack gap="lg">
                        <Paper withBorder p="xl" radius="md">
                            <Title order={4} mb="md">Visual Identity</Title>
                            <Stack gap="md">
                                <Box>
                                    <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={5}>Exercise GIF</Text>
                                    <Paper withBorder radius="md" h={200} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--mantine-color-gray-0)' }}>
                                        {exercise.gifUrl ? (
                                            <Image src={exercise.gifUrl} h="100%" fit="contain" />
                                        ) : (
                                            <IconBarbell size={40} color="var(--mantine-color-gray-3)" />
                                        )}
                                    </Paper>
                                    <TextInput 
                                        mt="xs"
                                        placeholder="GIF URL"
                                        value={exercise.gifUrl || ''}
                                        onChange={(e) => updateField('gifUrl', e.target.value)}
                                    />
                                </Box>

                                <Box>
                                    <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={5}>Muscles Mapping Image</Text>
                                    <Paper withBorder radius="md" h={200} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--mantine-color-gray-0)' }}>
                                        {exercise.musclesWorkedImg ? (
                                            <Image src={exercise.musclesWorkedImg} h="100%" fit="contain" />
                                        ) : (
                                            <IconInfoCircle size={40} color="var(--mantine-color-gray-3)" />
                                        )}
                                    </Paper>
                                    <TextInput 
                                        mt="xs"
                                        placeholder="Muscle Image URL"
                                        value={exercise.musclesWorkedImg || ''}
                                        onChange={(e) => updateField('musclesWorkedImg', e.target.value)}
                                    />
                                </Box>
                            </Stack>
                        </Paper>

                        <Paper withBorder p="xl" radius="md">
                            <Title order={4} mb="md">Categorization</Title>
                            <Stack gap="md">
                                <Box>
                                    <Text size="sm" fw={500} mb={5}>Muscle Groups</Text>
                                    <TagsInput
                                        placeholder="Type and press enter"
                                        value={exercise.muscleGroups?.map((g: any) => g.name)}
                                        onChange={(val: string[]) => {
                                            const currentNames = exercise.muscleGroups.map((g: any) => g.name);
                                            const added = val.filter(v => !currentNames.includes(v));
                                            const removed = currentNames.filter(v => !val.includes(v));
                                            
                                            added.forEach((name: string) => addTag('muscleGroups', name));
                                            removed.forEach((name: string) => {
                                                const tag = exercise.muscleGroups.find((g: any) => g.name === name);
                                                if (tag) removeTag('muscleGroups', tag.id);
                                            });
                                        }}
                                    />
                                </Box>
                                <Box>
                                    <Text size="sm" fw={500} mb={5}>Required Equipment</Text>
                                    <TagsInput
                                        placeholder="Type and press enter"
                                        value={exercise.equipment?.map((e: any) => e.name)}
                                        onChange={(val: string[]) => {
                                            const currentNames = exercise.equipment.map((e: any) => e.name);
                                            const added = val.filter(v => !currentNames.includes(v));
                                            const removed = currentNames.filter(v => !val.includes(v));
                                            
                                            added.forEach((name: string) => addTag('equipment', name));
                                            removed.forEach((name: string) => {
                                                const tag = exercise.equipment.find((e: any) => e.name === name);
                                                if (tag) removeTag('equipment', tag.id);
                                            });
                                        }}
                                    />
                                </Box>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid.Col>

                {/* Right Side: Main Content */}
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="lg">
                        <Paper withBorder p="xl" radius="md">
                            <Title order={4} mb="md">General Information</Title>
                            <Stack gap="md">
                                <TextInput
                                    label="Exercise Title"
                                    placeholder="e.g. Incline Dumbbell Press"
                                    value={exercise.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    required
                                    size="md"
                                />
                                <Textarea
                                    label="Overview"
                                    placeholder="Brief description of the exercise..."
                                    minRows={3}
                                    value={exercise.overview || ''}
                                    onChange={(e) => updateField('overview', e.target.value)}
                                />
                                <TextInput
                                    label="External Reference (URL)"
                                    placeholder="e.g. Youtube or Website"
                                    value={exercise.url || ''}
                                    onChange={(e) => updateField('url', e.target.value)}
                                />
                            </Stack>
                        </Paper>

                        <Paper withBorder p="xl" radius="md">
                           <Tabs defaultValue="steps" color="indigo">
                                <Tabs.List mb="md">
                                    <Tabs.Tab value="steps" leftSection={<IconList style={{ width: rem(16), height: rem(16) }} />}>Execution Steps</Tabs.Tab>
                                    <Tabs.Tab value="muscles" leftSection={<IconBarbell style={{ width: rem(16), height: rem(16) }} />}>Target Muscles</Tabs.Tab>
                                    <Tabs.Tab value="wisdom" leftSection={<IconMessageCircle style={{ width: rem(16), height: rem(16) }} />}>Benefits & Tips</Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="steps">
                                    <Stack gap="md">
                                        {exercise.content?.filter((c: any) => c.contentType === 'step').sort((a: any, b: any) => a.orderIndex - b.orderIndex).map((step: any, idx: number) => (
                                            <Group key={step.id} align="flex-start" wrap="nowrap">
                                                <Badge variant="filled" color="indigo" size="lg" radius="xl" w={32} h={32} p={0}>{idx + 1}</Badge>
                                                <Textarea 
                                                    style={{ flex: 1 }} 
                                                    autosize 
                                                    minRows={1} 
                                                    value={step.contentText} 
                                                    onChange={(e) => updateContent(step.id, e.target.value)}
                                                />
                                                <ActionIcon color="red" variant="subtle" onClick={() => removeContent(step.id)}>
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Group>
                                        ))}
                                        <Button variant="light" leftSection={<IconPlus size={16} />} onClick={() => addContent('step')}>Add Execution Step</Button>
                                    </Stack>
                                </Tabs.Panel>

                                <Tabs.Panel value="muscles">
                                    <Stack gap="md">
                                        <Grid>
                                            <Grid.Col span={6}><Text size="xs" fw={700} tt="uppercase" c="dimmed">Muscle Name</Text></Grid.Col>
                                            <Grid.Col span={4}><Text size="xs" fw={700} tt="uppercase" c="dimmed">Percentage</Text></Grid.Col>
                                            <Grid.Col span={2}></Grid.Col>
                                        </Grid>
                                        {exercise.musclesWorked?.map((m: any) => (
                                            <Grid key={m.id} align="center">
                                                <Grid.Col span={6}>
                                                    <TextInput 
                                                        value={m.name} 
                                                        onChange={(e) => updateMuscle(m.id, { name: e.target.value })}
                                                        placeholder="e.g. Chest (Lower)"
                                                    />
                                                </Grid.Col>
                                                <Grid.Col span={4}>
                                                    <NumberInput 
                                                        value={m.percentage} 
                                                        onChange={(val) => updateMuscle(m.id, { percentage: val })}
                                                        min={0} max={100}
                                                    />
                                                </Grid.Col>
                                                <Grid.Col span={2}>
                                                    <ActionIcon color="red" variant="subtle" onClick={() => removeMuscle(m.id)}>
                                                        <IconTrash size={16} />
                                                    </ActionIcon>
                                                </Grid.Col>
                                            </Grid>
                                        ))}
                                        <Button variant="light" leftSection={<IconPlus size={16} />} onClick={addMuscle}>Add Target Muscle</Button>
                                    </Stack>
                                </Tabs.Panel>

                                <Tabs.Panel value="wisdom">
                                    <Grid gutter="xl">
                                        <Grid.Col span={6}>
                                            <Title order={5} mb="sm" c="green.7">Benefits</Title>
                                            <Stack gap="xs">
                                                {exercise.content?.filter((c: any) => c.contentType === 'benefit').map((b: any) => (
                                                    <Group key={b.id} wrap="nowrap">
                                                        <Box bg="green.0" p={5} style={{ borderRadius: '50%' }}><IconCheck size={12} color="var(--mantine-color-green-7)" /></Box>
                                                        <TextInput style={{ flex: 1 }} value={b.contentText} onChange={(e) => updateContent(b.id, e.target.value)} />
                                                        <ActionIcon variant="subtle" color="red" onClick={() => removeContent(b.id)}><IconTrash size={14} /></ActionIcon>
                                                    </Group>
                                                ))}
                                                <Button size="xs" variant="subtle" color="green" leftSection={<IconPlus size={14} />} onClick={() => addContent('benefit')}>Add Benefit</Button>
                                            </Stack>
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Title order={5} mb="sm" c="red.7">Common Mistakes</Title>
                                            <Stack gap="xs">
                                                {exercise.content?.filter((c: any) => c.contentType === 'mistake').map((m: any) => (
                                                    <Group key={m.id} wrap="nowrap">
                                                        <Box bg="red.0" p={5} style={{ borderRadius: '50%' }}><IconAlertTriangle size={12} color="var(--mantine-color-red-7)" /></Box>
                                                        <TextInput style={{ flex: 1 }} value={m.contentText} onChange={(e) => updateContent(m.id, e.target.value)} />
                                                        <ActionIcon variant="subtle" color="red" onClick={() => removeContent(m.id)}><IconTrash size={14} /></ActionIcon>
                                                    </Group>
                                                ))}
                                                <Button size="xs" variant="subtle" color="red" leftSection={<IconPlus size={14} />} onClick={() => addContent('mistake')}>Add Mistake</Button>
                                            </Stack>
                                        </Grid.Col>
                                    </Grid>
                                    <Divider my="xl" />
                                    <Title order={5} mb="sm" c="blue.7">Pro Tips</Title>
                                    <Stack gap="xs">
                                        {exercise.content?.filter((c: any) => c.contentType === 'tip').map((t: any) => (
                                            <Group key={t.id} wrap="nowrap">
                                                <Box bg="blue.0" p={5} style={{ borderRadius: '50%' }}><IconInfoCircle size={12} color="var(--mantine-color-blue-7)" /></Box>
                                                <TextInput style={{ flex: 1 }} value={t.contentText} onChange={(e) => updateContent(t.id, e.target.value)} />
                                                <ActionIcon variant="subtle" color="red" onClick={() => removeContent(t.id)}><IconTrash size={14} /></ActionIcon>
                                            </Group>
                                        ))}
                                        <Button size="xs" variant="subtle" color="blue" leftSection={<IconPlus size={14} />} onClick={() => addContent('tip')}>Add Pro Tip</Button>
                                    </Stack>
                                </Tabs.Panel>
                           </Tabs>
                        </Paper>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
