import {
    Badge,
    Box,
    Divider,
    Grid,
    Group,
    Image,
    List,
    Loader,
    Modal,
    Paper,
    ScrollArea,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { useExercisesViewModel } from '../view-models/use-exercises-view-model';

interface ExerciseDetailModalProps {
  opened: boolean;
  onClose: () => void;
  exerciseId: string | null;
}

export function ExerciseDetailModal({ opened, onClose, exerciseId }: ExerciseDetailModalProps) {
  const { useExerciseDetail } = useExercisesViewModel();
  const { data: exercise, isLoading } = useExerciseDetail(exerciseId);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={exercise?.title || 'Exercise Details'}
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      {isLoading ? (
        <Group justify="center" p="xl">
          <Loader size="lg" />
        </Group>
      ) : exercise ? (
        <Stack gap="lg">
          <Grid align="flex-start">
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Paper withBorder radius="md" p="xs">
                {exercise.gifUrl ? (
                  <Image src={exercise.gifUrl} alt={exercise.title} radius="md" />
                ) : (
                  <Box bg="gray.1" h={200} display="flex" style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Text c="dimmed">No Preview Available</Text>
                  </Box>
                )}
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 7 }}>
              <Stack gap="xs">
                <Title order={3}>{exercise.title}</Title>
                <Text size="sm" c="dimmed">
                  {exercise.overview || 'No overview provided.'}
                </Text>

                <Group gap="xs" mt="sm">
                  {exercise.muscleGroups?.map((g) => (
                    <Badge key={g.id} variant="light" color="blue">
                      {g.name}
                    </Badge>
                  ))}
                  {exercise.equipment?.map((e) => (
                    <Badge key={e.id} variant="outline" color="gray">
                      {e.name}
                    </Badge>
                  ))}
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>

          <Divider label="Muscles Worked" labelPosition="left" />
          <Grid>
             <Grid.Col span={{ base: 12, md: 6 }}>
                {exercise.musclesWorkedImg && (
                    <Image src={exercise.musclesWorkedImg} radius="md" />
                )}
             </Grid.Col>
             <Grid.Col span={{ base: 12, md: 6 }}>
                <List spacing="xs" size="sm" center>
                    {exercise.musclesWorked?.map((m) => (
                        <List.Item key={m.id}>
                            <Group justify="space-between" w="100%">
                                <Text fw={500}>{m.name}</Text>
                                <Badge color="teal" size="sm">{m.percentage}%</Badge>
                            </Group>
                        </List.Item>
                    ))}
                </List>
             </Grid.Col>
          </Grid>

          <Divider label="Information" labelPosition="left" />
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={5} mb="xs">Steps</Title>
              <List type="ordered" size="sm" spacing="xs">
                {exercise.content
                  ?.filter((c) => c.contentType === 'step')
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((c) => (
                    <List.Item key={c.id}>{c.contentText}</List.Item>
                  ))}
              </List>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <Box>
                  <Title order={5} mb="xs" c="green">Benefits</Title>
                  <List size="sm" spacing="xs">
                    {exercise.content
                      ?.filter((c) => c.contentType === 'benefit')
                      .map((c) => (
                        <List.Item key={c.id}>{c.contentText}</List.Item>
                      ))}
                  </List>
                </Box>
                <Box>
                  <Title order={5} mb="xs" c="blue">Tips</Title>
                  <List size="sm" spacing="xs">
                    {exercise.content
                      ?.filter((c) => c.contentType === 'tip')
                      .map((c) => (
                        <List.Item key={c.id}>{c.contentText}</List.Item>
                      ))}
                  </List>
                </Box>
                <Box>
                  <Title order={5} mb="xs" c="red">Common Mistakes</Title>
                  <List size="sm" spacing="xs">
                    {exercise.content
                      ?.filter((c) => c.contentType === 'mistake')
                      .map((c) => (
                        <List.Item key={c.id}>{c.contentText}</List.Item>
                      ))}
                  </List>
                </Box>
              </Stack>
            </Grid.Col>
          </Grid>

          {exercise.variations && exercise.variations.length > 0 && (
            <>
              <Divider label="Variations" labelPosition="left" />
              <Group gap="xs">
                {exercise.variations.map((v) => (
                  <Badge 
                    key={v.id} 
                    variant="light" 
                    color="grape" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                        // In a real app, we might want to navigate to this exercise
                        // For now, let's just show the title or maybe switch the modal content if we had that logic
                    }}
                  >
                    {v.title}
                  </Badge>
                ))}
              </Group>
            </>
          )}
        </Stack>
      ) : (
        <Text ta="center">Failed to load exercise details.</Text>
      )}
    </Modal>
  );
}
