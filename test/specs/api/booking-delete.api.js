const { expect } = require('chai');
const { deleteBooking, getBooking } = require('../../api/booking.client');
const { createAuthToken } = require('../../api/auth.client');
const { createBookingFixture, deleteBookingFixture } = require('../../fixtures/booking.fixture');
const { getCases } = require('../../data/test-data');

describe('DeleteBooking API', function () {
  for (const testCase of getCases('api.delete')) {
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

      it('deletes an existing booking and makes it unavailable', async function () {
        if (!fixture) {
          throw new Error('Booking fixture was not created before the test.');
        }

        const token = await createAuthToken();
        const bookingId = fixture.bookingId;
        const response = await deleteBooking(bookingId, token);

        expect(response.status).to.equal(201);
        fixture = undefined;

        const deletedBooking = await getBooking(bookingId);
        expect(deletedBooking.status).to.equal(404);
      });
    });
  }
});