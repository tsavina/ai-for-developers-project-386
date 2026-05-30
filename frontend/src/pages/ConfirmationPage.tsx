import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Paper, Title, Text, ThemeIcon, Group, Button, Loader, Center } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { getBooking } from '../api/client';
import type { Booking } from '../types';

export default function ConfirmationPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getBooking(id)
      .then(setBooking)
      .catch((err) => {
        notifications.show({ color: 'red', title: 'Ошибка', message: err.message });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <Center h={200}><Loader /></Center>;
  }

  if (!booking) {
    return <Text c="dimmed">Бронирование не найдено</Text>;
  }

  return (
    <Paper shadow="sm" p="xl" radius="md" withBorder maw={500} mx="auto" mt="xl">
      <Group justify="center" mb="md">
        <ThemeIcon size={60} radius="xl" color="teal">
          <IconCheck size={30} />
        </ThemeIcon>
      </Group>
      <Title order={3} ta="center" mb="xs">Вы записаны!</Title>
      <Text ta="center" size="sm" c="dimmed" mb="lg">
        {booking.guestName}, ваша встреча подтверждена
      </Text>
      <Text size="sm"><strong>Дата:</strong> {booking.date}</Text>
      <Text size="sm"><strong>Время:</strong> {booking.startTime} — {booking.endTime}</Text>
      <Group justify="center" mt="lg">
        <Button component={Link} to="/" variant="light">
          На главную
        </Button>
      </Group>
    </Paper>
  );
}
