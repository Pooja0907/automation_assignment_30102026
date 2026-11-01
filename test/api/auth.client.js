// Authenticates with the configured demo API and validates the returned token.
const { apiRequest } = require('./booking.client');

// Requests and validates an authentication token for protected API operations.
async function createAuthToken() {
  const username = process.env.RESTFUL_BOOKER_USERNAME?.trim();
  const password = process.env.RESTFUL_BOOKER_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'Set RESTFUL_BOOKER_USERNAME and RESTFUL_BOOKER_PASSWORD in the environment or .env file to run authenticated API tests.'
    );
  }

  const response = await apiRequest('/auth', {
    method: 'POST',
    body: { username, password }
  });

  if (response.status !== 200 || !isTokenResponse(response.body) || typeof response.body.token !== 'string') {
    throw new Error(`Restful Booker authentication failed (HTTP ${response.status}).`);
  }

  return response.body.token;
}

// Confirms an API response is an object containing a token field.
function isTokenResponse(value) {
  return typeof value === 'object' && value !== null && 'token' in value;
}

module.exports = { createAuthToken };