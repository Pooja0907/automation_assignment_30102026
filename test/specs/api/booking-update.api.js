// Verifies authorized updates are returned and persisted by the API.
const { expect } = require('chai');
const { getBooking, updateBooking } = require('../../api/booking.client');
const { createAuthToken } = require('../../api/auth.client');
const { createBookingFixture, deleteBookingFixture } = require('../../fixtures/booking.fixture');
const { getCases } = require('../../data/test-data');

// Groups update scenarios and their booking-fixture lifecycle.
describe('UpdateBooking API', function () {
  for (const testCase of getCases('api.update')) {
    // Runs the update flow for one named before-and-after booking pair.
    describe(testCase.name, function () {
      let fixture;
      let token = '';

      // Creates the initial booking and obtains credentials for the update.
      beforeEach(async function () {
        fixture = await createBookingFixture(testCase.initialBooking);
        token = await createAuthToken();
      });

      // Removes the updated booking after the test to isolate API state.
      afterEach(async function () {
        if (fixture) {
          await deleteBookingFixture(fixture.bookingId);
          fixture = undefined;
        }
      });

      // Verifies the update response and subsequent retrieval both contain new data.
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