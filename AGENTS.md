# Project Guidelines

## Assessment Scope

- Test the Cheapflights website at `https://www.cheapflights.com.au/`: verify the logo and sign-in control, exercise flight search, and assert meaningful results and relative layout.
- Test the Restful Booker API at `https://restful-booker.herokuapp.com`: cover CreateBooking, UpdateBooking, GetBooking, and DeleteBooking with positive, negative, and boundary scenarios.
- Use stable, user-facing selectors and observable behavior; avoid brittle pixel coordinates and incidental implementation details.

## Architecture

- Keep browser specs in `test/specs/web/` and API specs in `test/specs/api/`.
- Put browser selectors and interactions in `test/pageobjects/`; put shared UI components in `test/pageobjects/components/`.
- Keep API request helpers and response validation in `test/api/`, and reusable test data in `test/fixtures/`.
- Store data-driven inputs in grouped arrays in `test/data/test-data.json`; add one test execution per entry instead of hardcoding test values in specs.
- Use JavaScript and CommonJS modules throughout the project. WebdriverIO is the browser automation framework.
- Keep tests focused on behavior; avoid duplicating page or request logic across specs.

## JavaScript and Test Conventions

- Use modern JavaScript, async/await, and the existing Mocha and Chai setup.
- Validate API status codes and response fields, including returned booking data. Negative tests must assert expected error responses.
- Give each API test the booking data it needs. Keep tests independent of execution order and clean up created resources.
- Read URLs and credentials from environment variables. Never commit secrets, tokens, or real account credentials; use `.env.example` only to document variable names.
- Guard nullable or optional values before accessing nested properties, and validate external API response shapes at runtime.

## Coding Standards

- Before implementing a requested requirement or change, ask the user to clarify any ambiguity in scope, expected behavior, or edge cases; wait for their answer before proceeding. Do not guess when clarification is needed.
- Keep code concise, clear, and focused on one responsibility. Prefer straightforward control flow and descriptive names.
- Avoid redundant logic and duplicated setup. Extract helpers only when they improve clarity or reuse without hiding behavior.
- Prefer simple, memory-efficient approaches; do not retain unnecessary data or build large intermediate collections.
- Handle expected runtime failures explicitly. Report actionable context when browser actions, API requests, parsing, or cleanup fail; do not swallow exceptions or turn failures into passing defaults.
- Keep comments crisp and understandable. Explain intent or non-obvious constraints rather than restating code.
- Avoid magic values. Name meaningful timeouts, URLs, and test data; centralize shared configuration when it improves consistency.
- Keep tests deterministic and isolated. Wait for observable conditions rather than using fixed sleeps.
- Make assertions specific and useful without coupling them to incidental details.

## Commands

- Set up a fresh clone with `npm run setup`; this checks Node.js, creates `.env` from `.env.example` without replacing an existing file, and installs locked dependencies.
- Install locked dependencies manually with `npm ci`.
- Run API tests with `npm run test:api`.
- Run browser tests with `npm run test:web`.
- Run both suites with `npm test`.
- Test execution generates an Allure report at `test_reports/allure-report/index.html`; failure screenshots are stored in `test_reports/screenshots/`.
- Keep scenario-specific inputs in `test/data/test-data.json`, not in test code.
- WebdriverIO manages Chrome and its driver; internet access is required on the first browser run.
- Do not claim tests pass unless the relevant command has been run successfully.
