const { expect } = require('chai');
const { getBooking, updateBooking } = require('../../api/booking.client');
const { createAuthToken } = require('../../api/auth.client');
const { createBookingFixture, deleteBookingFixture } = require('../../fixtures/booking.fixture');
const { getCases } = require('../../data/test-data');

describe('UpdateBooking API', function () {
  for (const testCase of getCases('api.update')) {
    describe(testCase.name, function () {
      let fixture;
      let token = '';

      beforeEach(async function () {
        fixture = await createBookingFixture(testCase.initialBooking);
        token = await createAuthToken();
      });

      afterEach(async function () {
        if (fixture) {
          await deleteBookingFixture(fixture.bookingId);
          fixture = undefined;
        }
      });

      it('updates a booking and persists all fields', async function () {
        if (!fixture) {
          throw new Error('Booking fixture was not created before the test.');
        }

        const response = await updateBooking(fixture.bookingId, testCase.updatedBooking, token);

        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal(testCase.updatedBooking);

        const persistedBooking = await getBooking(fixture.bookingId);
        expect(persistedBooking.status).to.equal(200);
        expect(persistedBooking.body).to.deep.equal(testCase.updatedBooking);
      });
    });
  }
});