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

function isCreatedBookingResponse(value) {
  return (
    isRecord(value) &&
    typeof value.bookingid === 'number' &&
    Number.isInteger(value.bookingid) &&
    value.bookingid > 0 &&
    isBookingPayload(value.booking)
  );
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

module.exports = { isBookingPayload, isCreatedBookingResponse };