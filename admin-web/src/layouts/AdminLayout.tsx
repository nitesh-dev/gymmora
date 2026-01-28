import { AppShell, Box, Burger, Button, Group, NavLink, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBarbell, IconClipboardList, IconDashboard, IconLogout, IconUsers } from '@tabler/icons-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthViewModel } from '../view-models/use-auth-view-model';

export function AdminLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout, isLoggingOut } = useAuthViewModel();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: IconDashboard, path: '/' },
    { label: 'Users', icon: IconUsers, path: '/users' },
    { label: 'Exercises', icon: IconBarbell, path: '/exercises' },
    { label: 'Workout Plans', icon: IconClipboardList, path: '/plans' },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3} c="blue">Gymmora Admin</Title>
          </Group>
          
          <Group>
            <Text size="sm" fw={500}>{user?.name || user?.email}</Text>
            <Button 
              variant="subtle" 
              color="gray" 
              size="xs" 
              leftSection={<IconLogout size={16} />}
              onClick={logout}
              loading={isLoggingOut}
            >
              Logout
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Box>
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
              mb={4}
              variant="filled"
            />
          ))}
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
