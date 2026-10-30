import { createBooking, deleteBooking } from '../api/booking.client';
import { createAuthToken } from '../api/auth.client';
import { isCreatedBookingResponse } from '../api/booking.types';
import type { BookingPayload } from '../api/booking.types';

export interface BookingFixture {
  bookingId: number;
  booking: BookingPayload;
}

export function makeBooking(overrides: Partial<BookingPayload> = {}): BookingPayload {
  return {
    firstname: 'RELX',
    lastname: 'Automation',
    totalprice: 247,
    depositpaid: true,
    bookingdates: { checkin: '2027-01-10', checkout: '2027-01-15' },
    additionalneeds: 'Breakfast',
    ...overrides
  };
}

export async function createBookingFixture(booking = makeBooking()): Promise<BookingFixture> {
  const response = await createBooking(booking);

  if (response.status !== 200 || !isCreatedBookingResponse(response.body)) {
    throw new Error(`Could not create booking fixture (HTTP ${response.status}).`);
  }

  return { bookingId: response.body.bookingid, booking };
}

export async function deleteBookingFixture(bookingId: number): Promise<void> {
  const token = await createAuthToken();
  const response = await deleteBooking(bookingId, token);

  if (response.status !== 201) {
    throw new Error(`Could not clean up booking ${bookingId} (HTTP ${response.status}).`);
  }
}