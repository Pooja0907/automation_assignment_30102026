const { expect } = require('chai');
const { getBooking } = require('../../api/booking.client');
const { createBookingFixture, deleteBookingFixture } = require('../../fixtures/booking.fixture');
const { getCases } = require('../../data/test-data');

describe('GetBooking API', function () {
  for (const testCase of getCases('api.getExisting')) {
    describe(testCase.name, function () {
      let fixture;

      beforeEach(async function () {
        fixture = await createBookingFixture(testCase.booking);
      });

      afterEach(async function () {
        if (fixture) {
          await deleteBookingFixture(fixture.bookingId);
          fixture = undefined;
        }
      });

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