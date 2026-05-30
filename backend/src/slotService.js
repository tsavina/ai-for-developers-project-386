const WORK_START = 9 * 60;  // 09:00 в минутах
const WORK_END = 17 * 60;   // 17:00
const STEP = 30;            // шаг сетки (минут)

function toMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function toTimeStr(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function isOverlapping(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export function getFreeSlots(eventType, date, allBookings) {
  const duration = eventType.duration;
  const dayBookings = allBookings.filter((b) => b.date === date);
  const slots = [];

  for (let start = WORK_START; start + duration <= WORK_END; start += STEP) {
    const end = start + duration;
    const slotStart = toTimeStr(start);
    const slotEnd = toTimeStr(end);

    const taken = dayBookings.some((b) =>
      isOverlapping(toMinutes(b.startTime), toMinutes(b.endTime), start, end),
    );

    if (!taken) {
      slots.push({ startTime: slotStart, endTime: slotEnd });
    }
  }

  return slots;
}

export function findNextFreeSlot(eventType, requestedDate, requestedStartTime, allBookings) {
  const startMs = toMinutes(requestedStartTime);

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const date = d.toISOString().slice(0, 10);

    // Пропускаем даты раньше requestedDate (но не меньше today)
    if (date < requestedDate) continue;

    const slots = getFreeSlots(eventType, date, allBookings);

    if (date === requestedDate) {
      const next = slots.find((s) => toMinutes(s.startTime) >= startMs);
      if (next) return { date, ...next };
    } else if (slots.length > 0) {
      return { date, ...slots[0] };
    }
  }

  return null;
}
