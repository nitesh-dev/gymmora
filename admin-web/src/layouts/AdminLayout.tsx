import { AppShell, Avatar, Box, Burger, Divider, Group, NavLink, Paper, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBarbell, IconBolt, IconClipboardList, IconLayoutDashboard, IconLogout, IconSettings, IconUsers } from '@tabler/icons-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthViewModel } from '../view-models/use-auth-view-model';

export function AdminLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout } = useAuthViewModel();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Overview', icon: IconLayoutDashboard, path: '/' },
    { label: 'User Registry', icon: IconUsers, path: '/users' },
    { label: 'Exercise Library', icon: IconBarbell, path: '/exercises' },
    { label: 'Plan Studio', icon: IconClipboardList, path: '/plans' },
  ];

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="xl"
      styles={{
        main: { background: 'var(--mantine-color-gray-0)' }
      }}
    >
      <AppShell.Header 
        bg="white" 
        p="md" 
        style={{ 
          borderBottom: '1px solid var(--mantine-color-gray-2)', 
          display: 'flex', 
          alignItems: 'center' 
        }}
      >
        <Group w="100%" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap="xs">
              <Box bg="indigo.6" p={5} style={{ borderRadius: '8px', display: 'flex' }}>
                <IconBarbell size={20} color="white" />
              </Box>
              <Title order={4} fw={800} style={{ letterSpacing: '-0.5px' }}>GYMMORA</Title>
            </Group>
          </Group>
          
          <Group>
            <Divider orientation="vertical" />
            <Group gap="sm" style={{ cursor: 'pointer' }}>
               <Stack gap={0} align="flex-end" visibleFrom="sm">
                  <Text size="sm" fw={600}>{user?.name || user?.email || 'Admin User'}</Text>
                  <Text size="xs" c="dimmed">System Administrator</Text>
               </Stack>
               <Avatar src={null} alt="Admin" color="indigo" radius="md" />
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar 
        p="md" 
        bg="gray.9" 
        style={{ border: 'none' }}
      >
        <AppShell.Section grow component={ScrollArea} mx="-md" px="md">
          <Text size="xs" fw={700} c="gray.5" tt="uppercase" mb="lg" px="sm" mt="md">Main Menu</Text>
          <Stack gap={4}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                label={item.label}
                leftSection={<item.icon size={20} stroke={1.5} />}
                active={location.pathname === item.path}
                onClick={() => {
                    navigate(item.path);
                    if (opened) toggle();
                }}
                variant="filled"
                color="indigo"
                styles={{
                  root: {
                    borderRadius: '8px',
                    fontWeight: 500,
                    color: location.pathname === item.path ? 'white' : 'var(--mantine-color-gray-5)',
                  },
                  label: {
                    color: 'inherit'
                  }
                }}
              />
            ))}
          </Stack>

          <Divider my="xl" label="System" labelPosition="center" color="gray.8" styles={{ label: { color: 'var(--mantine-color-gray-6)' }}} />
          
          <Stack gap={4}>
            <NavLink
              label="Settings"
              leftSection={<IconSettings size={20} stroke={1.5} />}
              styles={{ root: { borderRadius: '8px', color: 'var(--mantine-color-gray-5)' }}}
              onClick={() => {}}
            />
            <NavLink
              label="Logout"
              leftSection={<IconLogout size={20} stroke={1.5} />}
              onClick={logout}
              color="red"
              variant="subtle"
              styles={{ root: { borderRadius: '8px', color: 'var(--mantine-color-red-4)' }}}
            />
          </Stack>
        </AppShell.Section>
        
        <AppShell.Section mt="md">
          <Paper withBorder p="md" radius="md" bg="gray.8" style={{ borderColor: 'var(--mantine-color-gray-7)' }}>
            <Group gap="sm">
               <IconBolt size={18} color="var(--mantine-color-indigo-4)" />
               <Box>
                  <Text size="xs" fw={700} color="white">v1.0.4-stable</Text>
                  <Text size="xs" c="gray.5">All systems operational</Text>
               </Box>
            </Group>
          </Paper>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
