import { AreaChart } from '@mantine/charts';
import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Grid,
    Group,
    Paper,
    ScrollArea,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Timeline,
    Title,
} from '@mantine/core';
import {
    IconActivity,
    IconArrowUpRight,
    IconBarbell,
    IconBell,
    IconBolt,
    IconCalendarEvent,
    IconDatabaseImport,
    IconPlus,
    IconSearch,
    IconSettings,
    IconUsers,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const chartData = [
  { date: 'Jan 23', activeUsers: 400 },
  { date: 'Jan 24', activeUsers: 600 },
  { date: 'Jan 25', activeUsers: 800 },
  { date: 'Jan 26', activeUsers: 700 },
  { date: 'Jan 27', activeUsers: 900 },
  { date: 'Jan 28', activeUsers: 1200 },
  { date: 'Jan 29', activeUsers: 1500 },
];

export function DashboardView() {
  const navigate = useNavigate();

  return (
    <Stack gap="xl">
      {/* Header Bar */}
      <Group justify="space-between">
        <Stack gap={0}>
          <Title order={2} fw={700}>Good morning, Admin</Title>
          <Text c="dimmed" size="sm">Here's what's happening with Gymmora today.</Text>
        </Stack>
        <Group>
          <Paper withBorder radius="md" px="md" py={5} bg="var(--mantine-color-body)">
            <Group gap="xs">
              <IconSearch size={16} color="var(--mantine-color-dimmed)" />
              <Text size="sm" c="dimmed">Search anything... (Cmd + K)</Text>
            </Group>
          </Paper>
          <ActionIcon variant="light" size="lg" radius="md">
            <IconBell size={20} />
          </ActionIcon>
        </Group>
      </Group>

      {/* Metrics Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
        <MetricCard
          title="Total Active Users"
          value="12,543"
          diff={12}
          icon={IconUsers}
          color="indigo"
        />
        <MetricCard
          title="Exercises Library"
          value="1,240"
          diff={3}
          icon={IconBarbell}
          color="blue"
        />
        <MetricCard
          title="Plan Utilization"
          value="84%"
          diff={-2}
          icon={IconCalendarEvent}
          color="teal"
        />
        <MetricCard
          title="API Latency"
          value="124ms"
          diff={0}
          icon={IconBolt}
          color="orange"
        />
      </SimpleGrid>

      {/* Bento Grid Layer */}
      <Grid gutter="lg">
        {/* Analytics Section */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Paper withBorder radius="md" p="xl" h="100%">
            <Group justify="space-between" mb="xl">
              <Stack gap={0}>
                <Title order={4}>User Engagement</Title>
                <Text size="sm" c="dimmed">Daily active users over the last 7 days</Text>
              </Stack>
              <Badge variant="light" size="lg">Live</Badge>
            </Group>
            <Box h={300}>
              <AreaChart
                h={300}
                data={chartData}
                dataKey="date"
                series={[{ name: 'activeUsers', color: 'indigo.6', label: 'Active Users' }]}
                curveType="monotone"
                withDots={false}
                valueFormatter={(value) => `${value}`}
              />
            </Box>
          </Paper>
        </Grid.Col>

        {/* Quick Actions Column */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg" h="100%">
            <Paper withBorder radius="md" p="xl" bg="indigo.6">
              <Stack gap="md">
                <Title order={4} c="white">Command Center</Title>
                <Text size="sm" c="indigo.0">Effortlessly manage your gym library with quick bulk actions.</Text>
                <SimpleGrid cols={2} spacing="xs">
                  <QuickActionButton icon={IconPlus} label="New Plan" onClick={() => navigate('/plans/new')} />
                  <QuickActionButton icon={IconDatabaseImport} label="Import JSON" onClick={() => navigate('/exercises')} />
                  <QuickActionButton icon={IconUsers} label="View Users" onClick={() => navigate('/users')} />
                  <QuickActionButton icon={IconSettings} label="Library" onClick={() => navigate('/exercises')} />
                </SimpleGrid>
              </Stack>
            </Paper>

            <Paper withBorder radius="md" p="xl" flex={1}>
              <Title order={5} mb="xl">System Performance</Title>
              <Stack gap="sm">
                <PerformanceItem label="Database" value="Healthy" color="green" />
                <PerformanceItem label="Auth Service" value="Healthy" color="green" />
                <PerformanceItem label="Storage (CDN)" value="Degraded" color="orange" />
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>

        {/* Recent Activity */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder radius="md" p="xl" h={400}>
            <Title order={4} mb="xl">Live Activity Feed</Title>
            <ScrollArea h={300} offsetScrollbars>
              <Timeline active={1} bulletSize={24} lineWidth={2}>
                <Timeline.Item bullet={<IconPlus size={12} />} title="New Exercise Added">
                  <Text c="dimmed" size="sm">Nitesh added <Text span fw={500} c="indigo">Cable Rows</Text> to the library.</Text>
                  <Text size="xs" mt={4}>2 hours ago</Text>
                </Timeline.Item>

                <Timeline.Item bullet={<IconActivity size={12} />} title="Plan Updated">
                  <Text c="dimmed" size="sm">System Plan <Text span fw={500} c="indigo">Advanced Hypertrophy</Text> was modified.</Text>
                  <Text size="xs" mt={4}>5 hours ago</Text>
                </Timeline.Item>

                <Timeline.Item bullet={<IconUsers size={12} />} title="Bulk Import Success">
                  <Text c="dimmed" size="sm">Successfully imported 150 exercises from source JSON.</Text>
                  <Text size="xs" mt={4}>Yesterday</Text>
                </Timeline.Item>
              </Timeline>
            </ScrollArea>
          </Paper>
        </Grid.Col>

        {/* Popular Exercises */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder radius="md" p="xl" h={400}>
            <Title order={4} mb="xl">Trending Exercises</Title>
            <Stack gap="md">
              <TrendingItem title="Dumbbell Incline Bench" users="2.4k users" trend={+14} />
              <TrendingItem title="Bulgarian Split Squat" users="1.9k users" trend={+8} />
              <TrendingItem title="Lat Pulldown" users="1.8k users" trend={-2} />
              <TrendingItem title="Barbell Squat" users="1.5k users" trend={+24} />
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

function MetricCard({ title, value, diff, icon: Icon, color }: any) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between">
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">
          {title}
        </Text>
        <ThemeIcon color={color} variant="light" size="sm" radius="md">
          <Icon size={16} />
        </ThemeIcon>
      </Group>

      <Group align="flex-end" gap="xs" mt={25}>
        <Text fw={700} size="xl">
          {value}
        </Text>
        <Text c={diff > 0 ? 'teal' : diff < 0 ? 'red' : 'gray'} size="sm" fw={500} mb={2}>
          <span>{diff > 0 ? '+' : ''}{diff}%</span>
          {diff !== 0 && <IconArrowUpRight size={14} style={{ transform: diff < 0 ? 'rotate(90deg)' : 'none' }} />}
        </Text>
      </Group>

      <Text size="xs" c="dimmed" mt={7}>
        Compared to previous month
      </Text>
    </Paper>
  );
}

function QuickActionButton({ icon: Icon, label, onClick }: any) {
  return (
    <Button
      variant="white"
      color="indigo"
      h={60}
      radius="md"
      fullWidth
      onClick={onClick}
      styles={{
        inner: { flexDirection: 'column', gap: '4px' },
        label: { fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }
      }}
    >
      <Icon size={18} />
      {label}
    </Button>
  );
}

function PerformanceItem({ label, value, color }: any) {
  return (
    <Group justify="space-between">
      <Text size="sm">{label}</Text>
      <Badge color={color} variant="dot">{value}</Badge>
    </Group>
  );
}

function TrendingItem({ title, users, trend }: any) {
  return (
    <Group justify="space-between" p="xs" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
      <Stack gap={0}>
        <Text fw={500} size="sm">{title}</Text>
        <Text size="xs" c="dimmed">{users}</Text>
      </Stack>
      <Badge color={trend > 0 ? 'teal' : 'red'} variant="light">
        {trend > 0 ? '+' : ''}{trend}%
      </Badge>
    </Group>
  );
}
