// Confirms missing records and unauthorized mutations fail without changing data.
const { expect } = require('chai');
const { deleteBooking, getBooking, updateBooking } = require('../../api/booking.client');
const { createBookingFixture, deleteBookingFixture } = require('../../fixtures/booking.fixture');
const { getCases } = require('../../data/test-data');

// Groups missing-booking and authorization failure scenarios.
describe('Booking API negative cases', function () {
  for (const testCase of getCases('api.getMissing')) {
    // Confirms an unknown booking id returns the API's not-found status.
    it(`returns not found for a missing booking: ${testCase.name}`, async function () {
      const response = await getBooking(testCase.bookingId);

      expect(response.status).to.equal(404);
    });
  }

  // Runs mutation authorization checks with independent booking fixtures.
  describe('authorization', function () {
    for (const testCase of getCases('api.updateUnauthorized')) {
      // Scopes setup and cleanup to this unauthorized-update scenario.
      describe(testCase.name, function () {
        let fixture;

        // Creates a booking whose original state can be checked after the request.
        beforeEach(async function () {
          fixture = await createBookingFixture(testCase.initialBooking);
        });

        // Removes the authorization-test fixture after assertions complete.
        afterEach(async function () {
          if (fixture) {
            await deleteBookingFixture(fixture.bookingId);
            fixture = undefined;
          }
        });

        // Verifies an unauthenticated update is forbidden and leaves data unchanged.
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
      // Scopes setup and cleanup to this invalid-token scenario.
      describe(testCase.name, function () {
        let fixture;

        // Creates a booking to test rejection of an invalid token.
        beforeEach(async function () {
          fixture = await createBookingFixture(testCase.initialBooking);
        });

        // Removes the invalid-token test fixture after assertions complete.
        afterEach(async function () {
          if (fixture) {
            await deleteBookingFixture(fixture.bookingId);
            fixture = undefined;
          }
        });

        // Verifies an invalid token is forbidden and the saved booking is unchanged.
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
      // Scopes setup and cleanup to this unauthorized-delete scenario.
      describe(testCase.name, function () {
        let fixture;

        // Creates a booking that the unauthenticated delete attempt must preserve.
        beforeEach(async function () {
          fixture = await createBookingFixture(testCase.booking);
        });

        // Removes the fixture after confirming unauthorized deletion was blocked.
        afterEach(async function () {
          if (fixture) {
            await deleteBookingFixture(fixture.bookingId);
            fixture = undefined;
          }
        });

        // Verifies deletion without a token is forbidden and the booking remains.
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