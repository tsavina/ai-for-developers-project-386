export interface EventType {
  id: string;
  name: string;
  description: string;
  duration: number;
}

export interface Slot {
  startTime: string;
  endTime: string;
}

export interface CreateBookingRequest {
  eventTypeId: string;
  guestName: string;
  date: string;
  startTime: string;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  guestName: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface CreateEventTypeRequest {
  name: string;
  description: string;
  duration: number;
}

export interface SuggestedSlot {
  date: string;
  startTime: string;
  endTime: string;
}

export interface ApiError {
  code: string;
  message: string;
  suggestedNext?: SuggestedSlot | null;
}
