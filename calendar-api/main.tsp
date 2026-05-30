import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

// ─── Service ────────────────────────────────────────────

@service({
  title: "Calendar Booking API",
})
namespace CalendarBooking;

// ─── Модели ─────────────────────────────────────────────

/** Тип события, создаётся владельцем */
model EventType {
  id: string;

  @minLength(1)
  @maxLength(100)
  name: string;

  @minLength(0)
  @maxLength(1000)
  description: string;

  @minValue(15)
  @maxValue(480)
  duration: int32;
}

/** Свободный временной слот для записи */
model Slot {
  startTime: string;
  endTime: string;
}

/** Тело запроса на создание бронирования */
model CreateBookingRequest {
  eventTypeId: string;

  @minLength(1)
  @maxLength(200)
  guestName: string;

  date: string;
  startTime: string;
}

/** Тело запроса на создание типа события (без id — сервер генерирует сам) */
model CreateEventTypeRequest {
  @minLength(1)
  @maxLength(100)
  name: string;

  @minLength(0)
  @maxLength(1000)
  description: string;

  @minValue(15)
  @maxValue(480)
  duration: int32;
}

/** Бронирование */
model Booking {
  id: string;
  eventTypeId: string;
  guestName: string;
  date: string;
  startTime: string;
  endTime: string;
}

/** Ошибка */
model Error {
  code: string;
  message: string;
}

// ─── Public (гостевые) маршруты ────────────────────────

@route("/api/event-types")
interface EventTypes {
  /** Получить список всех типов событий */
  @get list(): EventType[];

  /** Получить тип события по id */
  @get getEventType(@path id: string): EventType | Error;
}

@route("/api/event-types/{id}/slots")
interface Slots {
  /** Получить свободные слоты для типа события на дату */
  @get getSlots(
    @path id: string,
    @query date: string,
  ): Slot[] | Error;
}

@route("/api/bookings")
interface Bookings {
  /** Создать новое бронирование */
  @post create(@body body: CreateBookingRequest): Booking | Error;

  /** Получить бронирование по id */
  @get getBooking(@path id: string): Booking | Error;
}

// ─── Admin (маршруты владельца) ─────────────────────────

@route("/api/admin/event-types")
interface AdminEventTypes {
  /** Получить все типы событий (админка) */
  @get list(): EventType[];

  /** Создать новый тип события */
  @post create(@body body: CreateEventTypeRequest): EventType | Error;

  /** Удалить тип события */
  @delete delete(@path id: string): void;
}

@route("/api/admin/bookings")
interface AdminBookings {
  /** Получить все бронирования (админка) */
  @get list(): Booking[];
}
