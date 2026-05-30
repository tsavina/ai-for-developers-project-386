import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Title, Text, Card, Group, Button, Stack, TextInput, Loader,
  Center, SimpleGrid, Paper, Badge,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { getEventType, getSlots, createBooking, ApiClientError } from '../api/client';
import type { EventType, Slot, ApiError } from '../types';

type Step = 'date' | 'slot' | 'form';

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [guestName, setGuestName] = useState('');
  const [saving, setSaving] = useState(false);

  const dates = useMemo(() => {
    const result: string[] = [];
    for (let i = 0; i < 14; i++) {
      result.push(dayjs().add(i, 'day').format('YYYY-MM-DD'));
    }
    return result;
  }, []);

  useEffect(() => {
    if (!id) return;
    getEventType(id)
      .then(setEventType)
      .catch((err) => {
        notifications.show({ color: 'red', title: 'Ошибка', message: err.message });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep('slot');
    try {
      const result = await getSlots(id!, date);
      setSlots(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка';
      notifications.show({ color: 'red', title: 'Ошибка', message: msg });
      setSlots([]);
    }
  };

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot || !guestName.trim()) return;
    setSaving(true);
    try {
      const booking = await createBooking({
        eventTypeId: id!,
        guestName: guestName.trim(),
        date: selectedDate,
        startTime: selectedSlot.startTime,
      });
      notifications.show({ color: 'green', title: 'Готово', message: 'Бронирование создано' });
      navigate(`/bookings/${booking.id}`);
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.status === 409) {
        const apiBody = (typeof err.body === 'object' ? err.body : null) as ApiError | null;
        const msg = apiBody?.suggestedNext
          ? `Слот занят. Следующий свободный: ${apiBody.suggestedNext.date} в ${apiBody.suggestedNext.startTime}`
          : 'Нет свободных слотов в ближайшие 14 дней';
        const color = apiBody?.suggestedNext ? 'orange' : 'red';
        notifications.show({ color, title: 'Слот занят', message: msg });
        setStep('date');
        setSelectedDate(null);
        setSelectedSlot(null);
      } else {
        const msg = err instanceof Error ? err.message : 'Ошибка';
        notifications.show({ color: 'red', title: 'Ошибка', message: msg });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Center h={200}><Loader /></Center>;
  }

  if (!eventType) {
    return <Text c="dimmed">Тип события не найден</Text>;
  }

  return (
    <>
      <Title order={2} mb="xs">{eventType.name}</Title>
      <Text c="dimmed" mb="lg">{eventType.description}</Text>

      {step === 'date' && (
        <>
          <Text fw={500} mb="sm">Выберите дату:</Text>
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
            {dates.map((d) => {
              const day = dayjs(d);
              const isPast = day.isBefore(dayjs(), 'day');
              return (
                <Card
                  key={d}
                  shadow="sm"
                  padding="sm"
                  radius="md"
                  withBorder
                  component="button"
                  style={{ cursor: isPast ? 'not-allowed' : 'pointer', opacity: isPast ? 0.4 : 1 }}
                  disabled={isPast}
                  onClick={() => !isPast && handleDateSelect(d)}
                >
                  <Text ta="center" size="sm" c="dimmed">{day.format('dddd')}</Text>
                  <Text ta="center" fw={600} size="xl">{day.format('D')}</Text>
                  <Text ta="center" size="sm" c="dimmed">{day.format('MMM')}</Text>
                </Card>
              );
            })}
          </SimpleGrid>
        </>
      )}

      {step === 'slot' && (
        <>
          <Group mb="sm">
            <Button variant="subtle" onClick={() => setStep('date')}>
              ← Назад к датам
            </Button>
            <Text fw={500}>
              {selectedDate && dayjs(selectedDate).format('D MMMM YYYY, dddd')}
            </Text>
          </Group>
          {slots.length === 0 ? (
            <Paper withBorder p="xl" ta="center">
              <Text c="dimmed">Нет свободных слотов на эту дату</Text>
              <Button variant="light" mt="md" onClick={() => setStep('date')}>
                Выбрать другую дату
              </Button>
            </Paper>
          ) : (
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
              {slots.map((s) => (
                <Button
                  key={s.startTime}
                  variant="outline"
                  size="lg"
                  onClick={() => handleSlotSelect(s)}
                >
                  {s.startTime}
                </Button>
              ))}
            </SimpleGrid>
          )}
        </>
      )}

      {step === 'form' && (
        <Stack maw={400}>
          <Group mb="sm">
            <Button variant="subtle" onClick={() => setStep('slot')}>
              ← Назад к слотам
            </Button>
          </Group>
          <Paper withBorder p="md" radius="md">
            <Text size="sm" mb="xs">
              <strong>Дата:</strong> {selectedDate && dayjs(selectedDate).format('D MMMM YYYY')}
            </Text>
            <Text size="sm" mb="md">
              <strong>Время:</strong> {selectedSlot?.startTime} — {selectedSlot?.endTime}
            </Text>
            <TextInput
              label="Ваше имя"
              value={guestName}
              onChange={(e) => setGuestName(e.currentTarget.value)}
              required
              mb="md"
              placeholder="Введите имя"
            />
            <Button
              fullWidth
              onClick={handleSubmit}
              loading={saving}
              disabled={!guestName.trim()}
            >
              Забронировать
            </Button>
          </Paper>
        </Stack>
      )}
    </>
  );
}
