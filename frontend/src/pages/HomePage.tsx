import { useEffect, useState } from 'react';
import { SimpleGrid, Title, Text, Loader, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import EventTypeCard from '../components/EventTypeCard';
import { getEventTypes } from '../api/client';
import type { EventType } from '../types';

export default function HomePage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEventTypes()
      .then(setEventTypes)
      .catch((err) => {
        notifications.show({ color: 'red', title: 'Ошибка', message: err.message });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Center h={200}><Loader /></Center>;
  }

  return (
    <>
      <Title order={2} mb="md">Выберите тип встречи</Title>
      {eventTypes.length === 0 ? (
        <Text c="dimmed">Пока нет доступных типов событий</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {eventTypes.map((et) => (
            <EventTypeCard key={et.id} eventType={et} />
          ))}
        </SimpleGrid>
      )}
    </>
  );
}
