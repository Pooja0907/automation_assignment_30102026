const testData = require('./test-data.json');

const requiredFields = {
  'web.flightSearch': ['originCode', 'destinationCode'],
  'web.incompleteSearch': ['missingField'],
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

function getCases(path) {
  const value = path.split('.').reduce((current, key) => current?.[key], testData);

  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Test data "${path}" must be a non-empty JSON array.`);
  }

  return value.map((testCase, index) => {
    if (!testCase || typeof testCase !== 'object' || typeof testCase.name !== 'string' || !testCase.name.trim()) {
      throw new Error(`Test data "${path}" entry ${index + 1} must have a non-empty name.`);
    }

    for (const field of requiredFields[path] || []) {
      if (!Object.hasOwn(testCase, field)) {
        throw new Error(`Test data "${path}" entry "${testCase.name}" is missing "${field}".`);
      }
    }

    if (path === 'web.flightSearch' &&
      ![testCase.originCode, testCase.destinationCode].every((code) => /^[A-Z]{3}$/.test(code))) {
      throw new Error(`Test data "${path}" entry "${testCase.name}" must use three-letter airport codes.`);
    }

    for (const field of ['booking', 'initialBooking', 'updatedBooking']) {
      if (testCase[field] !== undefined && !isBooking(testCase[field])) {
        throw new Error(`Test data "${path}" entry "${testCase.name}" has an invalid "${field}" payload.`);
      }
    }

    if (path === 'web.incompleteSearch' && !['origin', 'destination'].includes(testCase.missingField)) {
      throw new Error(`Test data "${path}" entry "${testCase.name}" must set missingField to origin or destination.`);
    }

    return testCase;
  });
}

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
