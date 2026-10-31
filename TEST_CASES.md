# Assessment Test Cases

These cases cover the Cheapflights website and Restful Booker API requirements: key UI visibility and layout, a flight search, booking CRUD, response validation, negative behavior, and meaningful edge values.

Data-dependent scenarios are parameterized by named entries in `test/data/test-data.json`; each entry runs as a separate test.

Automation status reflects the current test specs: **Automated** means the documented assertions are covered; **Partially automated** means the core action is covered but some assertions remain; **Not automated** means no current spec covers the case.

## Cheapflights website

| ID | Scenario | Steps and expected result | Current automation |
|---|---|---|---|
| WEB-01 | Homepage logo is visible | Open the configured Cheapflights homepage. The logo is displayed in the page header. | Automated |
| WEB-02 | Sign-in control is visible and correctly positioned | Open the homepage and inspect the header. The sign-in control is displayed, is to the right of the logo without overlapping it, and remains within the header bounds. | Automated |
| WEB-03 | Sydney-to-Melbourne search returns results | Start the recommended Sydney-to-Melbourne search. The browser navigates to a flight-results page whose route and title identify SYD to MEL; at least one labeled flight result is displayed. | Automated |
| WEB-04 | Incomplete route is not submitted as a valid search | Leave the origin unset and submit the search form. The browser remains on the homepage instead of navigating to flight results. | Automated |

## Restful Booker API

Use an isolated booking per case that changes data. For cases requiring authentication, obtain a token using the configured test credentials. Verify the response body as well as the status, and delete created bookings during cleanup.

| ID | Scenario | Steps and expected result | Current automation |
|---|---|---|---|
| API-01 | Create a booking with a valid payload | POST a complete booking containing both names, a numeric price, a boolean deposit flag, check-in and checkout dates, and additional needs. Expect HTTP 200, a positive integer `bookingid`, and a `booking` object matching every submitted field. | Automated |
| API-02 | Create a booking with an incomplete payload | POST an empty or structurally incomplete object. Expect a non-success status and no valid created-booking response or booking ID. | Automated |
| API-03 | Retrieve an existing booking | Create a booking, then GET it by its returned ID. Expect HTTP 200 and all fields to match the created payload. | Automated |
| API-04 | Retrieve a nonexistent booking | GET an unused booking ID. Expect HTTP 404 and no booking payload. | Automated |
| API-05 | Update a booking with valid authorization | Create a booking, then PUT a complete replacement payload with a valid token. Expect HTTP 200 and every returned field to match the replacement; GET the booking and confirm the update persisted. | Automated |
| API-06 | Reject an update without authorization | Create a booking, then PUT a changed payload without a token. Expect HTTP 403; GET the booking and confirm none of its original fields changed. | Automated |
| API-07 | Reject an update with an invalid token | Create a booking, then PUT a changed payload with an invalid token. Expect HTTP 403; GET the booking and confirm its original data is unchanged. | Automated |
| API-08 | Delete an existing booking with valid authorization | Create a booking, then DELETE it with a valid token. Expect HTTP 201; a subsequent GET for the same ID returns HTTP 404. | Automated |
| API-09 | Reject deletion without authorization | Create a booking, then DELETE it without a token. Expect HTTP 403; GET the booking and confirm it still exists with unchanged data. | Automated |
| API-10 | Preserve valid boundary values | Create a booking with `totalprice: 0`, `depositpaid: false`, an empty `additionalneeds` string, and valid ISO dates whose checkout follows check-in across a month or year boundary. Expect HTTP 200 and an exact payload round-trip, including the zero, false, and empty values. | Automated |

## Reliability and isolation

- Each API case creates and cleans up its own booking; cases must not depend on execution order or shared booking IDs.
- Cleanup failures are test failures, not successful test outcomes.
- Do not assert exact pixel coordinates or depend on incidental page content. UI assertions should target visible controls, relative layout, and the requested route/results.
- The browser and API cases require their respective external services to be reachable; failures caused by unavailable services should be reported distinctly from assertion failures.
