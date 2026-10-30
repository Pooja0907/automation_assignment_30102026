import 'dotenv/config';
import type { ApiResponse, BookingPayload } from './booking.types';

const DEFAULT_BASE_URL = 'https://restful-booker.herokuapp.com';
const REQUEST_TIMEOUT_MS = 15_000;

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
}

const baseUrl = (process.env.RESTFUL_BOOKER_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, '');

export async function apiRequest(path: string, options: RequestOptions): Promise<ApiResponse> {
  const headers: Record<string, string> = { Accept: 'application/json' };

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
  let body: unknown = responseText;

  if (responseText) {
    try {
      body = JSON.parse(responseText) as unknown;
    } catch (error) {
      if (!(error instanceof SyntaxError)) {
        throw error;
      }
    }
  }

  return { status: response.status, body };
}

export function createBooking(booking: unknown): Promise<ApiResponse> {
  return apiRequest('/booking', { method: 'POST', body: booking });
}

export function getBooking(bookingId: number): Promise<ApiResponse> {
  return apiRequest(`/booking/${bookingId}`, { method: 'GET' });
}

export function updateBooking(
  bookingId: number,
  booking: BookingPayload,
  token: string
): Promise<ApiResponse> {
  return apiRequest(`/booking/${bookingId}`, { method: 'PUT', body: booking, token });
}

export function deleteBooking(bookingId: number, token?: string): Promise<ApiResponse> {
  return apiRequest(`/booking/${bookingId}`, { method: 'DELETE', token });
}