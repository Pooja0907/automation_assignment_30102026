import { expect } from 'chai';
import { createBooking, deleteBooking } from '../../api/booking.client';
import { createAuthToken } from '../../api/auth.client';
import { makeBooking } from '../../fixtures/booking.fixture';
import { isCreatedBookingResponse } from '../../api/booking.types';

describe('CreateBooking API', function () {
  let bookingId: number | undefined;

  afterEach(async function () {
    if (bookingId !== undefined) {
      const token = await createAuthToken();
      const response = await deleteBooking(bookingId, token);
      expect(response.status, 'created booking cleanup').to.equal(201);
      bookingId = undefined;
    }
  });

  it('creates a booking and returns its id and all booking fields', async function () {
    const booking = makeBooking();
    const response = await createBooking(booking);

    expect(response.status).to.equal(200);
    if (!isCreatedBookingResponse(response.body)) {
      throw new Error('CreateBooking response did not contain a numeric booking id and booking object.');
    }

    bookingId = response.body.bookingid;
    expect(response.body.booking).to.deep.equal(booking);
  });

  it('rejects a malformed booking request', async function () {
    const response = await createBooking({});

    expect(response.status).to.be.at.least(400);
    expect(response.body).not.to.have.property('bookingid');
  });
});