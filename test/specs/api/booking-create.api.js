// Covers successful, malformed, and boundary-value booking creation.
const { expect } = require('chai');
const { createBooking, deleteBooking } = require('../../api/booking.client');
const { createAuthToken } = require('../../api/auth.client');
const { isCreatedBookingResponse } = require('../../api/booking.validation');
const { getCases } = require('../../data/test-data');

// Groups data-driven creation scenarios and their cleanup behavior.
describe('CreateBooking API', function () {
  for (const testCase of getCases('api.createValid')) {
    // Gives each valid booking scenario its own isolated lifecycle.
    describe(testCase.name, function () {
      let bookingId;

      // Removes a booking created by the test to keep the shared API clean.
      afterEach(async function () {
        if (bookingId !== undefined) {
          const token = await createAuthToken();
          const response = await deleteBooking(bookingId, token);
          expect(response.status, 'created booking cleanup').to.equal(201);
          bookingId = undefined;
        }
      });

      // Verifies creation returns an id and preserves every submitted field.
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
    // Confirms malformed payloads are rejected without creating a booking.
    it(`rejects a malformed booking request: ${testCase.name}`, async function () {
      const response = await createBooking(testCase.payload);

      expect(response.status).to.be.at.least(400);
      expect(response.body).not.to.have.property('bookingid');
    });
  }

  for (const testCase of getCases('api.createBoundary')) {
    // Isolates cleanup for each boundary-value booking scenario.
    describe(testCase.name, function () {
      let bookingId;

      // Removes the boundary-value booking after its response has been checked.
      afterEach(async function () {
        if (bookingId !== undefined) {
          const token = await createAuthToken();
          const response = await deleteBooking(bookingId, token);
          expect(response.status, 'created boundary booking cleanup').to.equal(201);
          bookingId = undefined;
        }
      });

      // Confirms valid boundary values are stored and returned unchanged.
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