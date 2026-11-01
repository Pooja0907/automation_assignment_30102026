# RELX Web & API Automation

JavaScript automation for Cheapflights UI scenarios and the Restful Booker API, built with WebdriverIO, Mocha, and Chai.

## Requirements

- Git
- Node.js 18.20.0 or newer, with npm
- Java 8 or newer for generating the Allure HTML report
- Internet access for dependency/browser downloads and the external test services

WebdriverIO downloads the browser and matching driver on the first browser run; separate Chrome or ChromeDriver installation is not required.

## Clone and set up

From a terminal:

```sh
git clone https://github.com/Pooja0907/automation_assignment_30102026.git
cd automation_assignment_30102026
npm run setup
```

In Windows PowerShell, use `npm.cmd` instead of `npm` if script execution policy blocks `npm.ps1`:

```powershell
npm.cmd run setup
```

The setup command checks the Node.js version, creates `.env` from `.env.example` only when `.env` does not already exist, and installs the locked dependencies with `npm ci`. Run commands from the project root.

## Run the tests

| Command | Suite |
|---|---|
| `npm test` | API and browser tests |
| `npm run test:api` | Restful Booker API tests |
| `npm run test:web` | Cheapflights browser tests |

Use the same commands with `npm.cmd` in Windows PowerShell when required. Web tests run in Chrome. Each test receives a fresh browser session/profile; the session is restarted after each test.

## Reports

Each test command clears previous test results and failure screenshots, runs its selected suite(s), and generates a new Allure report at `test_reports/allure-report/index.html`. Failed browser tests also save screenshots under `test_reports/screenshots/` and attach them to their Allure results.

Open the latest report with:

```sh
npm run report:open
```

Use `npm.cmd run report:open` in Windows PowerShell if needed.

## Configuration

Setup creates a local `.env` from [.env.example](./.env.example). It contains the base URLs and demo API credentials used by default. Override values in `.env`; do not commit real credentials, tokens, or other secrets. Restful Booker is a shared demo service, so availability and data outside a test's own records are not controlled by this project.

## Test data

Named scenario inputs are stored in [test/data/test-data.json](./test/data/test-data.json). Each array entry runs as a separate test, and [test/data/test-data.js](./test/data/test-data.js) validates required fields and payload shapes before execution.

| Scenario array | Required entry properties |
|---|---|
| `web.flightSearch` | `name`, `origin`, `originCode`, `destination`, `destinationCode`, `departureOffsetDays`, `returnOffsetDays` |
| `web.sameOriginDestination` | `name`, `origin`, `originCode`, `departureOffsetDays`, `returnOffsetDays`, `errorMessage` |
| `web.infantsExceedAdults` | `name`, `origin`, `originCode`, `destination`, `destinationCode`, `departureOffsetDays`, `adults`, `errorMessage` |
| `web.incompleteSearch` | `name`, `missingField` (`destination`) |
| `web.multiCityBlankSearch` | `name`, `errorMessage` |
| `api.createValid`, `api.createBoundary`, `api.getExisting`, `api.delete`, `api.deleteUnauthorized` | `name`, `booking` (complete booking payload) |
| `api.createInvalid` | `name`, `payload` (intentionally invalid booking request) |
| `api.getMissing` | `name`, `bookingId` |
| `api.update`, `api.updateUnauthorized`, `api.updateInvalidToken` | `name`, `initialBooking`, `updatedBooking`; `api.updateInvalidToken` also requires `token` |

A booking payload contains `firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates.checkin`, `bookingdates.checkout`, and `additionalneeds`. Flight-search date offsets are relative to the run date; return dates must be later than departure dates. For a route to appear in the site's recommendations, use airport codes supported by the configured Cheapflights homepage.

## Coverage

The browser suite checks the homepage header, flight search results in a new tab, route and traveller validation, missing-destination validation, and multi-city search behavior. The API suite covers booking creation, retrieval, update, and deletion, including malformed requests, authorization failures, missing records, and boundary values. See [TEST_CASES.md](./TEST_CASES.md) for individual scenarios and their automation status.

API tests create and clean up their own booking records. Both suites require their respective external service to be reachable.
