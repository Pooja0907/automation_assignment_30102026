const { expect } = require('chai');
const { deleteBooking, getBooking, updateBooking } = require('../../api/booking.client');
const { createBookingFixture, deleteBookingFixture } = require('../../fixtures/booking.fixture');
const { getCases } = require('../../data/test-data');

describe('Booking API negative cases', function () {
  for (const testCase of getCases('api.getMissing')) {
    it(`returns not found for a missing booking: ${testCase.name}`, async function () {
      const response = await getBooking(testCase.bookingId);

      expect(response.status).to.equal(404);
    });
  }

  describe('authorization', function () {
    for (const testCase of getCases('api.updateUnauthorized')) {
      describe(testCase.name, function () {
        let fixture;

        beforeEach(async function () {
          fixture = await createBookingFixture(testCase.initialBooking);
        });

        afterEach(async function () {
          if (fixture) {
            await deleteBookingFixture(fixture.bookingId);
            fixture = undefined;
          }
        });

        it('rejects an update without an auth token and preserves the booking', async function () {
          if (!fixture) {
            throw new Error('Booking fixture was not created before the test.');
          }

          const response = await updateBooking(fixture.bookingId, testCase.updatedBooking, '');
          expect(response.status).to.equal(403);

          const unchangedBooking = await getBooking(fixture.bookingId);
          expect(unchangedBooking.body).to.deep.equal(testCase.initialBooking);
        });
      });
    }

    for (const testCase of getCases('api.updateInvalidToken')) {
      describe(testCase.name, function () {
        let fixture;

        beforeEach(async function () {
          fixture = await createBookingFixture(testCase.initialBooking);
        });

        afterEach(async function () {
          if (fixture) {
            await deleteBookingFixture(fixture.bookingId);
            fixture = undefined;
          }
        });

        it('rejects an invalid auth token and preserves the booking', async function () {
          if (!fixture) {
            throw new Error('Booking fixture was not created before the test.');
          }

          const response = await updateBooking(fixture.bookingId, testCase.updatedBooking, testCase.token);
          expect(response.status).to.equal(403);

          const unchangedBooking = await getBooking(fixture.bookingId);
          expect(unchangedBooking.status).to.equal(200);
          expect(unchangedBooking.body).to.deep.equal(testCase.initialBooking);
        });
      });
    }

    for (const testCase of getCases('api.deleteUnauthorized')) {
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

        it('rejects deletion without an auth token and preserves the booking', async function () {
          if (!fixture) {
            throw new Error('Booking fixture was not created before the test.');
          }

          const response = await deleteBooking(fixture.bookingId);
          expect(response.status).to.equal(403);

          const unchangedBooking = await getBooking(fixture.bookingId);
          expect(unchangedBooking.body).to.deep.equal(testCase.booking);
        });
      });
    }
  });
});