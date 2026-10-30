import { expect } from 'chai';
import { updateBooking } from '../../api/booking.client';
import { createAuthToken } from '../../api/auth.client';
import { createBookingFixture, deleteBookingFixture, makeBooking } from '../../fixtures/booking.fixture';
import type { BookingFixture } from '../../fixtures/booking.fixture';

describe('UpdateBooking API', function () {
  let fixture: BookingFixture | undefined;
  let token = '';

  beforeEach(async function () {
    fixture = await createBookingFixture();
    token = await createAuthToken();
  });

  afterEach(async function () {
    if (fixture) {
      await deleteBookingFixture(fixture.bookingId);
      fixture = undefined;
    }
  });

  it('updates a booking and returns the updated response fields', async function () {
    const updatedBooking = makeBooking({
      firstname: 'Updated',
      lastname: 'RELX',
      totalprice: 350,
      depositpaid: false,
      additionalneeds: 'Window seat'
    });
    const response = await updateBooking(fixture!.bookingId, updatedBooking, token);

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal(updatedBooking);
  });
});