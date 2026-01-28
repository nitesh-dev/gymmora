import {
    ActionIcon,
    Box,
    Button,
    Group,
    Image,
    LoadingOverlay,
    Modal,
    Paper,
    Stack,
    Table,
    Text,
    Textarea,
    TextInput,
    Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDatabaseImport, IconEdit, IconExternalLink, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
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
import type { Exercise } from '../models/exercise';
import { useExercisesViewModel } from '../view-models/use-exercises-view-model';

const columnHelper = createColumnHelper<Exercise>();

export function ExercisesView() {
  const { exercises, isLoading, deleteExercise, createExercise, updateExercise, importExercises, isProcessing } = useExercisesViewModel();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  const [opened, { open, close }] = useDisclosure(false);
  const [importOpened, { open: openImport, close: closeImport }] = useDisclosure(false);
  const [editingExercise, setEditingExercise] = useState<Partial<Exercise> | null>(null);
  const [jsonInput, setJsonInput] = useState('');

  const [formData, setFormData] = useState<Partial<Exercise>>({
    title: '',
    url: '',
    overview: '',
    gifUrl: '',
    musclesWorkedImg: '',
  });

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData(exercise);
    open();
  };

  const handleAdd = () => {
    setEditingExercise(null);
    setFormData({ title: '', url: '', overview: '', gifUrl: '', musclesWorkedImg: '' });
    open();
  };

  const handleSubmit = async () => {
    if (editingExercise?.id) {
      await updateExercise({ id: editingExercise.id, data: formData });
    } else {
      await createExercise(formData);
    }
    close();
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(jsonInput);
      await importExercises(Array.isArray(data) ? data : [data]);
      setJsonInput('');
      closeImport();
    } catch (e) {
      alert('Invalid JSON format');
    }
  };

  const columns = [
    columnHelper.accessor('gifUrl', {
      header: 'Preview',
      cell: (info) => (
        <Paper withBorder radius="md" w={50} h={50} style={{ overflow: 'hidden' }}>
          {info.getValue() ? (
            <Image src={info.getValue()!} alt="Exercise" fit="cover" />
          ) : (
            <Box bg="gray.1" h="100%" />
          )}
        </Paper>
      ),
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (info) => <Text fw={500}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('url', {
      header: 'URL',
      cell: (info) => info.getValue() ? (
        <ActionIcon component="a" href={info.getValue()!} target="_blank" variant="subtle" size="sm">
          <IconExternalLink size={16} />
        </ActionIcon>
      ) : null,
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Last Updated',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <Group gap="xs" justify="flex-end">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => handleEdit(info.row.original)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => deleteExercise(info.row.original.id, info.row.original.title)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    }),
  ];

  const table = useReactTable({
    data: exercises,
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
      <LoadingOverlay visible={isLoading || isProcessing} overlayProps={{ blur: 2 }} />
      
      <Group justify="space-between" mb="lg">
        <Title order={2}>Exercise Library</Title>
        <Group>
          <TextInput
            placeholder="Search exercises..."
            leftSection={<IconSearch size={16} />}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <Button 
            variant="light" 
            color="gray" 
            leftSection={<IconDatabaseImport size={16} />} 
            onClick={openImport}
          >
            Import JSON
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
            Add Exercise
          </Button>
        </Group>
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
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal 
        opened={opened} 
        onClose={close} 
        title={editingExercise ? 'Edit Exercise' : 'Add Exercise'}
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextInput
            label="Video URL (YouTube/Vimeo)"
            value={formData.url || ''}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
          <TextInput
            label="GIF URL"
            value={formData.gifUrl || ''}
            onChange={(e) => setFormData({ ...formData, gifUrl: e.target.value })}
          />
          <TextInput
            label="Muscles Image"
            placeholder="URL to muscles worked image"
            value={formData.musclesWorkedImg || ''}
            onChange={(e) => setFormData({ ...formData, musclesWorkedImg: e.target.value })}
          />
          <Button onClick={handleSubmit}>
            {editingExercise ? 'Save Changes' : 'Create Exercise'}
          </Button>
        </Stack>
      </Modal>

      <Modal
        opened={importOpened}
        onClose={closeImport}
        title="Import Exercises from JSON"
        size="xl"
      >
        <Stack>
          <Text size="sm" c="dimmed">
            Paste a JSON array of exercises. The format should match the sample provided.
          </Text>
          <Textarea
            placeholder='[ { "title": "...", ... } ]'
            minRows={15}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            styles={{ input: { fontFamily: 'monospace', fontSize: '12px' } }}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={closeImport}>Cancel</Button>
            <Button onClick={handleImport} disabled={!jsonInput.trim()}>Import Now</Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
