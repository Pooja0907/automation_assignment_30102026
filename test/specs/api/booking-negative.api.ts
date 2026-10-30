import { expect } from 'chai';
import { deleteBooking, getBooking, updateBooking } from '../../api/booking.client';
import { createAuthToken } from '../../api/auth.client';
import { createBookingFixture, deleteBookingFixture, makeBooking } from '../../fixtures/booking.fixture';
import type { BookingFixture } from '../../fixtures/booking.fixture';

describe('Booking API negative cases', function () {
  it('returns not found for a booking id that does not exist', async function () {
    const response = await getBooking(0);

    expect(response.status).to.equal(404);
  });

  describe('authorization', function () {
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

    it('rejects updating a booking without an auth token', async function () {
      const response = await updateBooking(fixture!.bookingId, makeBooking({ firstname: 'Unauthorized' }), '');

      expect(response.status).to.equal(403);
      const unchangedBooking = await getBooking(fixture!.bookingId);
      expect(unchangedBooking.body).to.deep.equal(fixture!.booking);
    });

    it('rejects deleting a booking without an auth token', async function () {
      const response = await deleteBooking(fixture!.bookingId);

      expect(response.status).to.equal(403);
      const unchangedBooking = await getBooking(fixture!.bookingId);
      expect(unchangedBooking.body).to.deep.equal(fixture!.booking);
    });
  });
});