import { ActionIcon, Badge, Box, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconEye, IconSearch, IconTrash } from '@tabler/icons-react';
import { createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import type { User } from '../models/user';
import { formatDate } from '../utils/date';
import { useUsersViewModel } from '../view-models/use-users-view-model';

const columnHelper = createColumnHelper<User>();

export function UsersView() {
  const navigate = useNavigate();
  const { users, isLoading, deleteUser } = useUsersViewModel();
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => <Text fw={500}>{info.getValue() || 'N/A'}</Text>,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: (info) => (
        <Badge color={info.getValue() === 'ADMIN' ? 'red' : 'blue'} variant="light">
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Joined',
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <Group gap="xs" justify="flex-end">
          <ActionIcon
            color="indigo"
            variant="subtle"
            onClick={(e) => {
                e.stopPropagation();
                navigate(`/users/${info.row.original.id}`);
            }}
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={(e) => {
                e.stopPropagation();
                deleteUser(info.row.original.id, info.row.original.name);
            }}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    }),
  ];

  const filteredData = users.filter(user => 
    user.name?.toLowerCase().includes(globalFilter.toLowerCase()) || 
    user.email.toLowerCase().includes(globalFilter.toLowerCase())
  );

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Box>
            <Title order={2} fw={800} style={{ letterSpacing: '-0.5px' }}>User Registry</Title>
            <Text c="dimmed" size="sm">Manage and monitor user access and activity.</Text>
        </Box>
        <TextInput
          placeholder="Search users..."
          leftSection={<IconSearch size={16} />}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </Group>

      <Paper withBorder radius="md">
        <DataTable 
          columns={columns} 
          data={filteredData} 
          loading={isLoading} 
          onRowClick={(row) => navigate(`/users/${row.id}`)}
        />
      </Paper>
    </Stack>
  );
}
