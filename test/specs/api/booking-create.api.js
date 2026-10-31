const { expect } = require('chai');
const { createBooking, deleteBooking } = require('../../api/booking.client');
const { createAuthToken } = require('../../api/auth.client');
const { isCreatedBookingResponse } = require('../../api/booking.validation');
const { getCases } = require('../../data/test-data');

describe('CreateBooking API', function () {
  for (const testCase of getCases('api.createValid')) {
    describe(testCase.name, function () {
      let bookingId;

      afterEach(async function () {
        if (bookingId !== undefined) {
          const token = await createAuthToken();
          const response = await deleteBooking(bookingId, token);
          expect(response.status, 'created booking cleanup').to.equal(201);
          bookingId = undefined;
        }
      });

      it('creates a booking and returns its id and all fields', async function () {
        const response = await createBooking(testCase.booking);

        expect(response.status).to.equal(200);
        if (!isCreatedBookingResponse(response.body)) {
          throw new Error('CreateBooking response did not contain a numeric booking id and booking object.');
        }

        bookingId = response.body.bookingid;
        expect(response.body.booking).to.deep.equal(testCase.booking);
      });
    });
  }

  for (const testCase of getCases('api.createInvalid')) {
    it(`rejects a malformed booking request: ${testCase.name}`, async function () {
      const response = await createBooking(testCase.payload);

      expect(response.status).to.be.at.least(400);
      expect(response.body).not.to.have.property('bookingid');
    });
  }

  for (const testCase of getCases('api.createBoundary')) {
    describe(testCase.name, function () {
      let bookingId;

      afterEach(async function () {
        if (bookingId !== undefined) {
          const token = await createAuthToken();
          const response = await deleteBooking(bookingId, token);
          expect(response.status, 'created boundary booking cleanup').to.equal(201);
          bookingId = undefined;
        }
      });

      it('preserves valid boundary values', async function () {
        const response = await createBooking(testCase.booking);

        expect(response.status).to.equal(200);
        if (!isCreatedBookingResponse(response.body)) {
          throw new Error('Boundary-value booking response did not contain a numeric booking id and booking object.');
        }

        bookingId = response.body.bookingid;
        expect(response.body.booking).to.deep.equal(testCase.booking);
      });
    });
  }
});