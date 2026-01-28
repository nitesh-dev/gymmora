import {
    ActionIcon,
    Avatar,
    Badge,
    Box,
    Button,
    Divider,
    Grid,
    Group,
    Paper,
    Select,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
    IconActivity,
    IconArrowLeft,
    IconCalendar,
    IconClock,
    IconMail,
    IconShield,
    IconTrash,
    IconUser
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate } from '../utils/date';
import { useUserDetailViewModel } from '../view-models/use-user-detail-view-model';

export function UserDetailView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        user,
        isLoading,
        updateRole,
        isUpdating,
        deleteUser,
        isDeleting
    } = useUserDetailViewModel(id);

    if (isLoading) return <Text>Loading profile...</Text>;
    if (!user) return <Text>User not found</Text>;

    const confirmDelete = () => {
        modals.openConfirmModal({
            title: 'Delete User Account',
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to delete <b>{user.name || user.email}</b>? This action is permanent and cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete User', cancel: 'No, keep it' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                await deleteUser();
                navigate('/users');
            },
        });
    };

    return (
        <Stack gap="xl">
            {/* Header */}
            <Group justify="space-between">
                <Group>
                    <ActionIcon variant="subtle" onClick={() => navigate('/users')}>
                        <IconArrowLeft size={20} />
                    </ActionIcon>
                    <Box>
                        <Title order={2} fw={800} style={{ letterSpacing: '-0.5px' }}>
                            User Profile
                        </Title>
                        <Text c="dimmed" size="sm">Review user information and activity history.</Text>
                    </Box>
                </Group>
                <Button
                    variant="light"
                    color="red"
                    leftSection={<IconTrash size={18} />}
                    onClick={confirmDelete}
                    loading={isDeleting}
                >
                    Delete User
                </Button>
            </Group>

            <Grid gutter="xl">
                {/* Profile Card */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack gap="lg">
                        <Paper withBorder p="xl" radius="md">
                            <Stack align="center" gap="md">
                                <Avatar size={100} radius={100} color="indigo">
                                    {user.name?.split(' ').map((n: string) => n[0]).join('') || <IconUser size={50} />}
                                </Avatar>
                                <Box style={{ textAlign: 'center' }}>
                                    <Title order={3}>{user.name || 'Anonymous User'}</Title>
                                    <Text c="dimmed">{user.email}</Text>
                                </Box>
                                <Badge size="lg" variant="light" color={user.role === 'ADMIN' ? 'red' : 'blue'}>
                                    {user.role}
                                </Badge>
                            </Stack>

                            <Divider my="xl" />

                            <Stack gap="md">
                                <Group wrap="nowrap">
                                    <IconMail size={18} color="var(--mantine-color-dimmed)" />
                                    <Text size="sm">{user.email}</Text>
                                </Group>
                                <Group wrap="nowrap">
                                    <IconCalendar size={18} color="var(--mantine-color-dimmed)" />
                                    <Text size="sm">Joined on {formatDate(user.createdAt)}</Text>
                                </Group>
                                <Group wrap="nowrap">
                                    <IconClock size={18} color="var(--mantine-color-dimmed)" />
                                    <Text size="sm">Last active: Recently</Text>
                                </Group>
                            </Stack>
                        </Paper>

                        <Paper withBorder p="xl" radius="md">
                            <Title order={4} mb="md">Access Management</Title>
                            <Stack gap="sm">
                                <Text size="sm" fw={500}>System Role</Text>
                                <Select
                                    value={user.role}
                                    data={['USER', 'ADMIN']}
                                    onChange={(val) => updateRole(val!)}
                                    disabled={isUpdating}
                                    leftSection={<IconShield size={16} />}
                                />
                                <Text size="xs" c="dimmed">
                                    Administrators can manage exercises, plans, and other users.
                                </Text>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid.Col>

                {/* Activity & Stats */}
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="lg">
                        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                            <StatCard
                                title="Workouts"
                                value="24"
                                icon={IconActivity}
                                color="indigo"
                            />
                            <StatCard
                                title="Completion"
                                value="92%"
                                icon={IconShield}
                                color="teal"
                            />
                            <StatCard
                                title="Active Streak"
                                value="12d"
                                icon={IconClock}
                                color="orange"
                            />
                        </SimpleGrid>

                        <Paper withBorder p="xl" radius="md">
                            <Title order={4} mb="xl">Recent User Activity</Title>
                            <Stack gap="md">
                                <ActivityItem
                                    title="Completed Workout"
                                    desc="Upper Body Power Pro"
                                    time="2 hours ago"
                                />
                                <ActivityItem
                                    title="Started New Plan"
                                    desc="Advanced Hypertrophy Phase 1"
                                    time="Yesterday"
                                />
                                <ActivityItem
                                    title="Joined Gymmora"
                                    desc="Account created successfully"
                                    time="Oct 24, 2025"
                                />
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}

function StatCard({ title, value, icon: Icon, color }: any) {
    return (
        <Paper withBorder p="lg" radius="md">
            <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">{title}</Text>
                <ThemeIcon color={color} variant="light" radius="md">
                    <Icon size={18} />
                </ThemeIcon>
            </Group>
            <Text fw={800} size="xl">{value}</Text>
        </Paper>
    );
}

function ActivityItem({ title, desc, time }: any) {
    return (
        <Group justify="space-between" p="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-1)' }}>
            <Box>
                <Text fw={600} size="sm">{title}</Text>
                <Text size="xs" c="dimmed">{desc}</Text>
            </Box>
            <Text size="xs" c="dimmed">{time}</Text>
        </Group>
    );
}
