# RELX Web & API Automation

TypeScript test automation for the Cheapflights website and Restful Booker API, using WebdriverIO, Mocha, and Chai.

## Requirements

- Git
- Node.js 18.20.0 or newer, with npm
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

Or run a single suite:

```powershell
npm run test:api
npm run test:web
```

Type-check the TypeScript project:

```sh
npm run typecheck
```

The first browser test run may take longer while WebdriverIO downloads Chrome and its matching driver.

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
- A recommended Sydney-to-Melbourne flight search and assertions on its results page.
- Restful Booker create, update, retrieve, and delete booking requests, response fields, malformed input, missing bookings, and unauthorized operations.

API tests create and clean up their own booking data. Browser tests require the external Cheapflights site and API tests require the external Restful Booker service to be reachable.
