import type { EventType, Slot, CreateBookingRequest, Booking, CreateEventTypeRequest, ApiError } from '../types';

const BASE = '/api';

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public body: ApiError | string,
  ) {
    super(typeof body === 'string' ? body : body.message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => res.statusText);
    throw new ApiClientError(res.status, body as ApiError | string);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function getEventTypes(): Promise<EventType[]> {
  return request('/event-types');
}

export function getEventType(id: string): Promise<EventType> {
  return request(`/event-types/${id}`);
}

export function getSlots(eventTypeId: string, date: string): Promise<Slot[]> {
  return request(`/event-types/${eventTypeId}/slots?date=${encodeURIComponent(date)}`);
}

export function createBooking(data: CreateBookingRequest): Promise<Booking> {
  return request('/bookings', { method: 'POST', body: JSON.stringify(data) });
}

export function getBooking(id: string): Promise<Booking> {
  return request(`/bookings/${id}`);
}

export function getAdminBookings(): Promise<Booking[]> {
  return request('/admin/bookings');
}

export function createEventType(data: CreateEventTypeRequest): Promise<EventType> {
  return request('/admin/event-types', { method: 'POST', body: JSON.stringify(data) });
}

export function deleteEventType(id: string): Promise<void> {
  return request(`/admin/event-types/${id}`, { method: 'DELETE' });
}
