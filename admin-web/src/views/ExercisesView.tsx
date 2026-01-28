import {
    ActionIcon,
    Box,
    Button,
    Group,
    Image,
    Modal,
    Paper,
    Stack,
    Text,
    Textarea,
    TextInput,
    Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDatabaseImport, IconEdit, IconExternalLink, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import type { Exercise } from '../models/exercise';
import { formatDate } from '../utils/date';
import { useExercisesViewModel } from '../view-models/use-exercises-view-model';

const columnHelper = createColumnHelper<Exercise>();

export function ExercisesView() {
  const navigate = useNavigate();
  const { exercises, isLoading, deleteExercise, importExercises } = useExercisesViewModel();
  const [globalFilter, setGlobalFilter] = useState('');
  
  const [importOpened, { open: openImport, close: closeImport }] = useDisclosure(false);
  const [jsonInput, setJsonInput] = useState('');

  const handleEdit = (id: string) => {
    navigate(`/exercises/${id}`);
  };

  const handleAdd = () => {
    navigate('/exercises/new');
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
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <Group gap="xs" justify="flex-end">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => handleEdit(info.row.original.id)}
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

  const filteredData = exercises.filter(ex => 
    ex.title.toLowerCase().includes(globalFilter.toLowerCase())
  );

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Box>
            <Title order={2} fw={800} style={{ letterSpacing: '-0.5px' }}>Exercise Library</Title>
            <Text c="dimmed" size="sm">Manage and organize exercise data, media, and metadata.</Text>
        </Box>
        <Group>
            <TextInput
            placeholder="Search exercises..."
            leftSection={<IconSearch size={16} />}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            />
            <Button 
                variant="light" 
                leftSection={<IconDatabaseImport size={18} />}
                onClick={openImport}
            >
                Import JSON
            </Button>
            <Button 
                variant="filled" 
                leftSection={<IconPlus size={18} />}
                onClick={handleAdd}
            >
                New Exercise
            </Button>
        </Group>
      </Group>

      <Paper withBorder radius="md">
        <DataTable 
          columns={columns} 
          data={filteredData} 
          loading={isLoading} 
        />
      </Paper>

      {/* Import Modal */}
      <Modal 
        opened={importOpened} 
        onClose={closeImport} 
        title="Import Exercises"
        centered
        size="lg"
      >
        <Stack>
          <Textarea
            label="JSON Data"
            placeholder='[{"title": "Pushup", ...}]'
            minRows={10}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          <Button onClick={handleImport} fullWidth>
            Import
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
