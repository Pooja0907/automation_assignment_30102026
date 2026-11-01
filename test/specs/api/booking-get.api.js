// Checks that retrieving an existing booking returns its complete saved payload.
const { expect } = require('chai');
const { getBooking } = require('../../api/booking.client');
const { createBookingFixture, deleteBookingFixture } = require('../../fixtures/booking.fixture');
const { getCases } = require('../../data/test-data');

// Groups retrieval scenarios with an isolated booking fixture for each case.
describe('GetBooking API', function () {
  for (const testCase of getCases('api.getExisting')) {
    // Sets up and cleans up the booking used by this named scenario.
    describe(testCase.name, function () {
      let fixture;

      // Creates a unique booking so the retrieval assertion uses known data.
      beforeEach(async function () {
        fixture = await createBookingFixture(testCase.booking);
      });

      // Removes the booking created for this retrieval test.
      afterEach(async function () {
        if (fixture) {
          await deleteBookingFixture(fixture.bookingId);
          fixture = undefined;
        }
      });

      // Checks the get response matches the complete booking submitted at setup.
      it('returns all fields for an existing booking', async function () {
        if (!fixture) {
          throw new Error('Booking fixture was not created before the test.');
        }

        const response = await getBooking(fixture.bookingId);

        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal(testCase.booking);
      });
    });
  }
});