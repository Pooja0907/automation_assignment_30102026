// Creates isolated API test records and removes them during test cleanup.
const { createBooking, deleteBooking } = require('../api/booking.client');
const { createAuthToken } = require('../api/auth.client');
const { isCreatedBookingResponse } = require('../api/booking.validation');

// Creates a booking and returns its id together with the original payload.
async function createBookingFixture(booking) {
  if (!booking || typeof booking !== 'object') {
    throw new Error('A booking payload is required to create a booking fixture.');
  }

  const response = await createBooking(booking);

  if (response.status !== 200 || !isCreatedBookingResponse(response.body)) {
    throw new Error(`Could not create booking fixture (HTTP ${response.status}).`);
  }

  return { bookingId: response.body.bookingid, booking };
}

// Authenticates and removes a fixture booking during cleanup.
async function deleteBookingFixture(bookingId) {
  const token = await createAuthToken();
  const response = await deleteBooking(bookingId, token);

  if (response.status !== 201) {
    throw new Error(`Could not clean up booking ${bookingId} (HTTP ${response.status}).`);
  }
}

module.exports = { createBookingFixture, deleteBookingFixture };