export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface BookingPayload {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds: string;
}

export interface CreatedBookingResponse {
  bookingid: number;
  booking: BookingPayload;
}

export interface ApiResponse {
  status: number;
  body: unknown;
}

export function isBookingPayload(value: unknown): value is BookingPayload {
  if (!isRecord(value) || !isRecord(value.bookingdates)) {
    return false;
  }

  return (
    typeof value.firstname === 'string' &&
    typeof value.lastname === 'string' &&
    typeof value.totalprice === 'number' &&
    typeof value.depositpaid === 'boolean' &&
    typeof value.bookingdates.checkin === 'string' &&
    typeof value.bookingdates.checkout === 'string' &&
    typeof value.additionalneeds === 'string'
  );
}

export function isCreatedBookingResponse(value: unknown): value is CreatedBookingResponse {
  return (
    isRecord(value) &&
    typeof value.bookingid === 'number' &&
    Number.isInteger(value.bookingid) &&
    value.bookingid > 0 &&
    isBookingPayload(value.booking)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}