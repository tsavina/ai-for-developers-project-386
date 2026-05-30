import { Outlet, Link, useLocation } from 'react-router-dom';
import { AppShell, Group, Title, Anchor, Container } from '@mantine/core';

export default function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Anchor component={Link} to="/" underline="never">
              <Title order={4}>Calendar Booking</Title>
            </Anchor>
          </Group>
          <Group>
            {isAdmin ? (
              <>
                <Anchor component={Link} to="/admin" size="sm">
                  Бронирования
                </Anchor>
                <Anchor component={Link} to="/admin/event-types" size="sm">
                  Типы событий
                </Anchor>
                <Anchor component={Link} to="/" size="sm">
                  На главную
                </Anchor>
              </>
            ) : (
              <Anchor component={Link} to="/admin" size="sm">
                Админка
              </Anchor>
            )}
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="md" py="lg">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
