import {
    ActionIcon,
    Badge,
    Box,
    Group,
    LoadingOverlay,
    Paper,
    Table,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import { IconSearch, IconTrash } from '@tabler/icons-react';
import type { SortingState } from '@tanstack/react-table';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import type { User } from '../models/user';
import { useUsersViewModel } from '../view-models/use-users-view-model';

const columnHelper = createColumnHelper<User>();

export function UsersView() {
  const { users, isLoading, deleteUser } = useUsersViewModel();
  const [sorting, setSorting] = useState<SortingState>([]);
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
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <Group gap="xs" justify="flex-end">
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={() => deleteUser(info.row.original.id, info.row.original.name)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    }),
  ];

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
      
      <Group justify="space-between" mb="lg">
        <Title order={2}>User Management</Title>
        <TextInput
          placeholder="Search users..."
          leftSection={<IconSearch size={16} />}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </Group>

      <Paper withBorder radius="md">
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows.map((row) => (
              <Table.Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
            {users.length === 0 && !isLoading && (
              <Table.Tr>
                <Table.Td colSpan={columns.length} ta="center" py="xl">
                  <Text c="dimmed">No users found</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Box>
  );
}
