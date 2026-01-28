import { ActionIcon, Badge, Box, Button, Group, Menu, Paper, Stack, Text, Title } from '@mantine/core';
import { IconChevronRight, IconClipboardList, IconDotsVertical, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { createColumnHelper } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import type { Plan } from '../services/plan.service';
import { usePlansViewModel } from '../view-models/use-plans-view-model';

const columnHelper = createColumnHelper<Plan>();

export function PlansView() {
  const { plans, isLoading, deletePlan } = usePlansViewModel();
  const navigate = useNavigate();

  const columns = [
    columnHelper.accessor('name', {
      header: 'Plan Name',
      cell: (info) => (
        <Group gap="sm">
          <Box bg="var(--mantine-color-indigo-light)" p={8} style={{ borderRadius: '8px' }}>
             <IconClipboardList size={20} color="var(--mantine-color-indigo-light-color)" />
          </Box>
          <Box>
            <Text fw={600} size="sm">{info.getValue()}</Text>
            <Text size="xs" c="dimmed">Workout Template</Text>
          </Box>
        </Group>
      ),
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: (info) => (
        <Badge variant="light" color={info.getValue() === 'SYSTEM' ? 'indigo' : 'teal'}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('visibility', {
      header: 'Visibility',
      cell: (info) => (
        <Badge variant="dot" color={info.getValue() === 'PUBLIC' || info.getValue() === 'SYSTEM' ? 'blue' : 'gray'}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => (
          <Badge variant="filled" color={info.getValue() === 'active' ? 'green' : 'gray'}>
            {info.getValue()}
          </Badge>
        ),
      }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <Group gap={0} justify="flex-end">
          <Button 
            variant="subtle" 
            size="xs" 
            rightSection={<IconChevronRight size={14} />}
            onClick={() => navigate(`/plans/${info.row.original.id}`)}
          >
            Open Studio
          </Button>
          <Menu shadow="md" width={160} position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEdit size={14} />}>Edit Details</Menu.Item>
              <Menu.Item 
                color="red" 
                leftSection={<IconTrash size={14} />}
                onClick={() => {
                  if (confirm('Are you sure you want to delete this plan?')) {
                    deletePlan(info.row.original.id);
                  }
                }}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      ),
    }),
  ];

  return (
    <Stack gap="xl">
        <Group justify="space-between">
            <Box>
                <Title order={2} fw={800} style={{ letterSpacing: '-0.5px' }}>Workout Plan Studio</Title>
                <Text c="dimmed" size="sm">Create and manage workout templates for your users.</Text>
            </Box>
            <Button 
                leftSection={<IconPlus size={18} />} 
                radius="md" 
                color="indigo"
                onClick={() => navigate('/plans/new')}
            >
                Create New Plan
            </Button>
        </Group>

        <Paper withBorder radius="md">
            <DataTable 
                columns={columns} 
                data={plans} 
                loading={isLoading} 
                onRowClick={(row) => navigate(`/plans/${row.id}`)}
            />
        </Paper>
    </Stack>
  );
}
