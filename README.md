# RELX Web & API Automation

JavaScript test automation for the Cheapflights website and Restful Booker API, using WebdriverIO, Mocha, and Chai.

## Requirements

- Git
- Node.js 18.20.0 or newer, with npm
- Java 8 or newer to generate the Allure HTML report
- Internet access to install packages, download the browser on its first run, and access the test websites and API

You do **not** need to install Chrome or ChromeDriver separately. WebdriverIO manages them for the browser tests.

## Clone and set up

In a terminal (PowerShell, macOS, or Linux), run:

```sh
git clone https://github.com/Pooja0907/automation_assignment_30102026.git
cd automation_assignment_30102026
npm run setup
```

`npm run setup` checks the Node.js version, creates `.env` from `.env.example` if needed, and installs the exact dependencies in `package-lock.json` with `npm ci`. It preserves any existing `.env`. The example file uses the public Restful Booker demo credentials; change them in `.env` only if you have different API credentials.

## Run the tests

Run both the API and browser test suites:

```sh
npm test
```

Or run a single suite (each command regenerates the Allure report for that run):

```powershell
npm run test:api
npm run test:web
```

## Allure reports and failure screenshots

Each test command generates an Allure HTML report at `test_reports/allure-report/index.html`. Browser test failures also save screenshots under `test_reports/screenshots/` and attach them to their Allure test results. The test commands create the report and screenshot folders automatically. Generated files are excluded from Git.

Open the latest report with:

```sh
npm run report:open
```

The first browser test run may take longer while WebdriverIO downloads Chrome and its matching driver.

## Data-driven tests

Test inputs live in [test/data/test-data.json](./test/data/test-data.json), grouped by scenario. Add as many named entries as needed to a scenario's array; the runner creates a separate test for each entry. Keep each entry's properties consistent with its existing examples. Booking payloads must contain all Restful Booker fields. Flight-search airport codes must have a matching recommended route on the configured Cheapflights homepage. Do not put credentials in the JSON file; API credentials belong in `.env`.

The grouped arrays cover valid and malformed booking creation, boundary-value creation, retrieving existing and missing bookings, authorized updates, unauthorized updates/deletes, authorized deletion, flight searches, incomplete searches, and blank multi-city searches and flight-leg addition. Header visibility/layout cases do not require input data.

| JSON array | Required entry properties |
|---|---|
| `web.flightSearch` | `name`, `origin`, `originCode`, `destination`, `destinationCode`, `departureOffsetDays`, `returnOffsetDays` |
| `web.flightSearchSwap` | `name`, `origin`, `originCode`, `destination`, `destinationCode`, `departureOffsetDays`, `returnOffsetDays` |
| `web.sameOriginDestination` | `name`, `origin`, `originCode`, `departureOffsetDays`, `returnOffsetDays` |
| `web.infantsExceedAdults` | `name`, `origin`, `originCode`, `destination`, `destinationCode`, `departureOffsetDays`, `adults`, `errorMessage` |
| `web.incompleteSearch` | `name`, `missingField` (`origin`, `destination`, or `both`) |
| `web.multiCityBlankSearch` | `name`, `errorMessage` |
| `api.createValid`, `api.createBoundary`, `api.getExisting`, `api.delete`, `api.deleteUnauthorized` | `name`, `booking` (complete booking payload) |
| `api.createInvalid` | `name`, `payload` (intentionally invalid booking request) |
| `api.getMissing` | `name`, `bookingId` |
| `api.update`, `api.updateUnauthorized`, `api.updateInvalidToken` | `name`, `initialBooking`, `updatedBooking`; `api.updateInvalidToken` also requires `token` |

A booking payload contains `firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates.checkin`, `bookingdates.checkout`, and `additionalneeds`. Search date offsets are relative to the run date; when both dates are used, return must be later than departure. The loader validates required fields and booking shapes before the suites start.

## Configuration

The setup step creates a local `.env`, which is ignored by Git. Defaults target the assessment's public services:

```text
CHEAPFLIGHTS_BASE_URL=https://www.cheapflights.com.au/
RESTFUL_BOOKER_BASE_URL=https://restful-booker.herokuapp.com
RESTFUL_BOOKER_USERNAME=admin
RESTFUL_BOOKER_PASSWORD=password123
```

Edit `.env` to override these values. Do not commit real credentials. The Restful Booker service is a shared demo API, so availability and its test data are outside this project's control.

## What is covered

- Cheapflights homepage logo and sign-in visibility, including their relative position in the header.
- Data-driven flight searches in a new results tab, reversing a route with the swap control, and invalid-route checks for missing or identical airports, excessive lap infants, or blank multi-city searches; missing-destination autocomplete validation and multi-city leg addition are also covered.
- Restful Booker create, update, retrieve, and delete booking requests; response fields and persistence; malformed input; missing bookings; unauthorized operations; and valid boundary values.

API tests create and clean up their own booking data. Browser tests require the external Cheapflights site and API tests require the external Restful Booker service to be reachable.

See [TEST_CASES.md](./TEST_CASES.md) for the assessment scenarios and their automation status.
