import { Card, Text, Group, Badge, Button } from '@mantine/core';
import { Link } from 'react-router-dom';
import type { EventType } from '../types';

interface Props {
  eventType: EventType;
}

export default function EventTypeCard({ eventType }: Props) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text fw={500} size="lg">{eventType.name}</Text>
        <Badge color="blue" variant="light">
          {eventType.duration} мин
        </Badge>
      </Group>
      <Text size="sm" c="dimmed" mb="md" lineClamp={3}>
        {eventType.description}
      </Text>
      <Button
        component={Link}
        to={`/event-types/${eventType.id}`}
        fullWidth
        variant="light"
      >
        Записаться
      </Button>
    </Card>
  );
}
