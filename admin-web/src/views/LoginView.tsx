import {
    Button,
    Container,
    Paper,
    PasswordInput,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import { useLoginViewModel } from '../view-models/use-login-view-model';

export function LoginView() {
  const { email, setEmail, password, setPassword, isLoading, handleLogin } = useLoginViewModel();

  return (
    <Container size={420} my={80}>
      <Title ta="center" order={1} fw={900}>
        Gymmora Admin
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Please sign in with your admin credentials
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleLogin}>
          <TextInput
            label="Email"
            placeholder="admin@gymmora.com"
            required
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
          <Button fullWidth mt="xl" type="submit" loading={isLoading}>
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
