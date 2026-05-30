import { useEffect, useState } from 'react';
import {
  Title, Table, Button, Modal, TextInput, NumberInput, Textarea,
  Group, Loader, Center, Text, ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { getEventTypes, createEventType, deleteEventType } from '../../api/client';
import type { EventType } from '../../types';

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<string | number>(30);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getEventTypes()
      .then(setEventTypes)
      .catch((err) => {
        notifications.show({ color: 'red', title: 'Ошибка', message: err.message });
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createEventType({ name: name.trim(), description: description.trim(), duration: Number(duration) });
      notifications.show({ color: 'green', title: 'Создан', message: `Тип «${name}» добавлен` });
      close();
      setName('');
      setDescription('');
      setDuration(30);
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка';
      notifications.show({ color: 'red', title: 'Ошибка', message: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEventType(id);
      notifications.show({ color: 'green', title: 'Удалён', message: '' });
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка';
      notifications.show({ color: 'red', title: 'Ошибка', message: msg });
    }
  };

  if (loading) {
    return <Center h={200}><Loader /></Center>;
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Типы событий</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Создать тип
        </Button>
      </Group>

      {eventTypes.length === 0 ? (
        <Text c="dimmed">Нет типов событий</Text>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Название</Table.Th>
              <Table.Th>Длительность</Table.Th>
              <Table.Th>Описание</Table.Th>
              <Table.Th w={60}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {eventTypes.map((et) => (
              <Table.Tr key={et.id}>
                <Table.Td>{et.name}</Table.Td>
                <Table.Td>{et.duration} мин</Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={2}>{et.description}</Text>
                </Table.Td>
                <Table.Td>
                  <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(et.id)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={opened} onClose={close} title="Создать тип события" centered>
        <TextInput
          label="Название"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          maxLength={100}
          mb="sm"
        />
        <Textarea
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          maxLength={1000}
          mb="sm"
        />
        <NumberInput
          label="Длительность (мин)"
          value={duration}
          onChange={setDuration}
          min={15}
          max={480}
          required
          mb="lg"
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={close}>Отмена</Button>
          <Button onClick={handleCreate} loading={saving}>Создать</Button>
        </Group>
      </Modal>
    </>
  );
}
