import { v4 as uuidv4 } from 'uuid';

const eventTypes = [];
const bookings = [];

// EventTypes

export function getAllEventTypes() {
  return eventTypes;
}

export function getEventTypeById(id) {
  return eventTypes.find((et) => et.id === id) || null;
}

export function createEventType({ name, description, duration }) {
  const eventType = { id: uuidv4(), name, description, duration };
  eventTypes.push(eventType);
  return eventType;
}

export function deleteEventType(id) {
  const idx = eventTypes.findIndex((et) => et.id === id);
  if (idx === -1) return false;
  eventTypes.splice(idx, 1);
  return true;
}

// Bookings

export function getAllBookings() {
  return bookings;
}

export function getBookingById(id) {
  return bookings.find((b) => b.id === id) || null;
}

export function createBooking({ eventTypeId, guestName, date, startTime, endTime }) {
  const booking = { id: uuidv4(), eventTypeId, guestName, date, startTime, endTime };
  bookings.push(booking);
  return booking;
}

export function getBookingsByDate(date) {
  return bookings.filter((b) => b.date === date);
}

export function getAllBookingsSorted() {
  return [...bookings].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });
}

export function reset() {
  eventTypes.length = 0;
  bookings.length = 0;
}
