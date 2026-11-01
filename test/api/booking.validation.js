// Runtime guards for the response shapes exercised by the API specs.
// Checks that a value contains every required booking field with the right type.
function isBookingPayload(value) {
  if (!isRecord(value) || !isRecord(value.bookingdates)) {
    return false;
  }

  return (
    typeof value.firstname === 'string' &&
    typeof value.lastname === 'string' &&
    typeof value.totalprice === 'number' &&
    typeof value.depositpaid === 'boolean' &&
    typeof value.bookingdates.checkin === 'string' &&
    typeof value.bookingdates.checkout === 'string' &&
    typeof value.additionalneeds === 'string'
  );
}

// Validates the identifier and booking object returned after creation.
function isCreatedBookingResponse(value) {
  return (
    isRecord(value) &&
    typeof value.bookingid === 'number' &&
    Number.isInteger(value.bookingid) &&
    value.bookingid > 0 &&
    isBookingPayload(value.booking)
  );
}

// Identifies non-null, non-array objects before their fields are inspected.
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

module.exports = { isBookingPayload, isCreatedBookingResponse };