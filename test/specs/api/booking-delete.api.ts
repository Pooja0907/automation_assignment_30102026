import { expect } from 'chai';
import { deleteBooking, getBooking } from '../../api/booking.client';
import { createAuthToken } from '../../api/auth.client';
import { createBookingFixture, deleteBookingFixture } from '../../fixtures/booking.fixture';
import type { BookingFixture } from '../../fixtures/booking.fixture';

describe('DeleteBooking API', function () {
  let fixture: BookingFixture | undefined;

  beforeEach(async function () {
    fixture = await createBookingFixture();
  });

  afterEach(async function () {
    if (fixture) {
      await deleteBookingFixture(fixture.bookingId);
      fixture = undefined;
    }
  });

  it('deletes an existing booking and makes it unavailable', async function () {
    const token = await createAuthToken();
    const bookingId = fixture!.bookingId;
    const response = await deleteBooking(bookingId, token);

    expect(response.status).to.equal(201);
    fixture = undefined;

    const deletedBooking = await getBooking(bookingId);
    expect(deletedBooking.status).to.equal(404);
  });
});