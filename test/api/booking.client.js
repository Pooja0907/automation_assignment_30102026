require('dotenv/config');

const DEFAULT_BASE_URL = 'https://restful-booker.herokuapp.com';
const REQUEST_TIMEOUT_MS = 15_000;

const baseUrl = (process.env.RESTFUL_BOOKER_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, '');

async function apiRequest(path, options) {
  const headers = { Accept: 'application/json' };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.token) {
    headers.Cookie = `token=${options.token}`;
  }

  const response = await fetch(new URL(path.replace(/^\/+/, ''), `${baseUrl}/`), {
    method: options.method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });
  const responseText = await response.text();
  let body = responseText;

  if (responseText) {
    try {
      body = JSON.parse(responseText);
    } catch (error) {
      if (!(error instanceof SyntaxError)) {
        throw error;
      }
    }
  }

  return { status: response.status, body };
}

function createBooking(booking) {
  return apiRequest('/booking', { method: 'POST', body: booking });
}

function getBooking(bookingId) {
  return apiRequest(`/booking/${bookingId}`, { method: 'GET' });
}

function updateBooking(bookingId, booking, token) {
  return apiRequest(`/booking/${bookingId}`, { method: 'PUT', body: booking, token });
}

function deleteBooking(bookingId, token) {
  return apiRequest(`/booking/${bookingId}`, { method: 'DELETE', token });
}

module.exports = { apiRequest, createBooking, getBooking, updateBooking, deleteBooking };