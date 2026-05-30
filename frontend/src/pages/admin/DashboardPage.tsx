import { useEffect, useState } from 'react';
import { Title, Table, Loader, Center, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { getAdminBookings } from '../../api/client';
import type { Booking } from '../../types';

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminBookings()
      .then(setBookings)
      .catch((err) => {
        notifications.show({ color: 'red', title: 'Ошибка', message: err.message });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Center h={200}><Loader /></Center>;
  }

  const sorted = [...bookings].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <>
      <Title order={2} mb="md">Предстоящие встречи</Title>
      {sorted.length === 0 ? (
        <Text c="dimmed">Нет бронирований</Text>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Дата</Table.Th>
              <Table.Th>Время</Table.Th>
              <Table.Th>Гость</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sorted.map((b) => (
              <Table.Tr key={b.id}>
                <Table.Td>{b.date}</Table.Td>
                <Table.Td>{b.startTime} — {b.endTime}</Table.Td>
                <Table.Td>{b.guestName}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </>
  );
}
