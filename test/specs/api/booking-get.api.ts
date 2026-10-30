import { expect } from 'chai';
import { getBooking } from '../../api/booking.client';
import { createBookingFixture, deleteBookingFixture } from '../../fixtures/booking.fixture';
import type { BookingFixture } from '../../fixtures/booking.fixture';

describe('GetBooking API', function () {
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

  it('returns all fields for an existing booking', async function () {
    const response = await getBooking(fixture!.bookingId);

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal(fixture!.booking);
  });
});