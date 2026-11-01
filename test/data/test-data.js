// Loads named scenarios and rejects incomplete or malformed test data early.
const testData = require('./test-data.json');

const requiredFields = {
  'web.flightSearch': [
    'origin', 'originCode', 'destination', 'destinationCode', 'departureOffsetDays', 'returnOffsetDays'
  ],
  'web.sameOriginDestination': [
    'origin', 'originCode', 'departureOffsetDays', 'returnOffsetDays', 'errorMessage'
  ],
  'web.infantsExceedAdults': [
    'origin', 'originCode', 'destination', 'destinationCode', 'departureOffsetDays', 'adults', 'errorMessage'
  ],
  'web.incompleteSearch': ['missingField'],
  'web.multiCityBlankSearch': ['errorMessage'],
  'api.createValid': ['booking'],
  'api.createInvalid': ['payload'],
  'api.createBoundary': ['booking'],
  'api.getExisting': ['booking'],
  'api.getMissing': ['bookingId'],
  'api.update': ['initialBooking', 'updatedBooking'],
  'api.updateUnauthorized': ['initialBooking', 'updatedBooking'],
  'api.updateInvalidToken': ['initialBooking', 'updatedBooking', 'token'],
  'api.delete': ['booking'],
  'api.deleteUnauthorized': ['booking']
};

// Returns validated named scenarios for the requested data group.
function getCases(path) {
  const value = path.split('.').reduce((current, key) => current?.[key], testData);

  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Test data "${path}" must be a non-empty JSON array.`);
  }

  // Validates each entry before making scenario data available to a spec.
  return value.map((testCase, index) => {
    if (!testCase || typeof testCase !== 'object' || typeof testCase.name !== 'string' || !testCase.name.trim()) {
      throw new Error(`Test data "${path}" entry ${index + 1} must have a non-empty name.`);
    }

    for (const field of requiredFields[path] || []) {
      if (!Object.hasOwn(testCase, field)) {
        throw new Error(`Test data "${path}" entry "${testCase.name}" is missing "${field}".`);
      }
    }

    const airportCodes = path === 'web.sameOriginDestination'
      ? [testCase.originCode]
      : [testCase.originCode, testCase.destinationCode];
    if (['web.flightSearch', 'web.sameOriginDestination', 'web.infantsExceedAdults'].includes(path) &&
      !airportCodes.every((code) => /^[A-Z]{3}$/.test(code))) {
      throw new Error(`Test data "${path}" entry "${testCase.name}" must use three-letter airport codes.`);
    }

    if (['web.flightSearch', 'web.sameOriginDestination'].includes(path) &&
      (!Number.isInteger(testCase.departureOffsetDays) ||
        !Number.isInteger(testCase.returnOffsetDays) ||
        testCase.departureOffsetDays < 1 ||
        testCase.returnOffsetDays <= testCase.departureOffsetDays)) {
      throw new Error(
        `Test data "${path}" entry "${testCase.name}" must have a future departure and a later return date.`
      );
    }

    if (path === 'web.sameOriginDestination' &&
      (typeof testCase.origin !== 'string' ||
        !testCase.origin.trim() ||
        typeof testCase.errorMessage !== 'string' ||
        !testCase.errorMessage.trim())) {
      throw new Error(`Test data "${path}" entry "${testCase.name}" must provide an origin city and error message.`);
    }

    if (path === 'web.infantsExceedAdults' &&
      (typeof testCase.origin !== 'string' ||
        !testCase.origin.trim() ||
        typeof testCase.destination !== 'string' ||
        !testCase.destination.trim() ||
        !Number.isInteger(testCase.departureOffsetDays) ||
        testCase.departureOffsetDays < 1 ||
        !Number.isInteger(testCase.adults) ||
        testCase.adults < 1 ||
        typeof testCase.errorMessage !== 'string' ||
        !testCase.errorMessage.trim())) {
      throw new Error(
        `Test data "${path}" entry "${testCase.name}" must include locations, a future departure offset, at least one adult, and an error message.`
      );
    }

    for (const field of ['booking', 'initialBooking', 'updatedBooking']) {
      if (testCase[field] !== undefined && !isBooking(testCase[field])) {
        throw new Error(`Test data "${path}" entry "${testCase.name}" has an invalid "${field}" payload.`);
      }
    }

    if (path === 'web.incompleteSearch' && testCase.missingField !== 'destination') {
      throw new Error(
        `Test data "${path}" entry "${testCase.name}" must set missingField to destination.`
      );
    }

    if (path === 'web.multiCityBlankSearch' &&
      (typeof testCase.errorMessage !== 'string' || !testCase.errorMessage.trim())) {
      throw new Error(`Test data "${path}" entry "${testCase.name}" must provide an error message.`);
    }

    return testCase;
  });
}

// Checks the complete booking shape used in request data.
function isBooking(value) {
  return value !== null &&
    typeof value === 'object' &&
    typeof value.firstname === 'string' &&
    typeof value.lastname === 'string' &&
    typeof value.totalprice === 'number' &&
    typeof value.depositpaid === 'boolean' &&
    typeof value.bookingdates?.checkin === 'string' &&
    typeof value.bookingdates?.checkout === 'string' &&
    typeof value.additionalneeds === 'string';
}

module.exports = { getCases };
