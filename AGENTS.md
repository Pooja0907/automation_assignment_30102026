# Project Guidelines

## Assessment Scope

- Implement the web assessment for `https://www.cheapflights.com.au/`: verify the logo and login control are visible, exercise flight search, and assert meaningful search results.
- Implement the Restful Booker booking API assessment using `https://restful-booker.herokuapp.com`: cover CreateBooking, UpdateBooking, GetBooking, and DeleteBooking.
- Include positive and negative cases, assert API response fields, and check web element position or layout using stable relative assertions rather than brittle exact pixel coordinates.

## Architecture

- Keep browser specs in `test/specs/web/` and API specs in `test/specs/api/`.
- Put browser selectors and user-facing interactions in `test/pageobjects/`; keep reusable UI pieces in `test/pageobjects/components/`.
- Keep API request helpers and shared API types in `test/api/`, and reusable test data in `test/fixtures/`.
- Keep test cases focused on behavior and assertions; avoid duplicating page or request logic across specs.

## TypeScript and Test Conventions

- Use TypeScript with strict typing, async/await, and the existing Mocha and Chai setup.
- Use WebdriverIO for browser interaction. Prefer stable, user-facing selectors and assert observable behavior rather than implementation details.
- Validate API status codes and response fields, including returned booking data. Make negative tests assert the expected error status or response.
- Give each API test the data and booking it needs; avoid order-dependent tests and clean up created resources where the API allows it.
- Read URLs and credentials from environment variables. Never commit secrets, tokens, or real account credentials; use `.env.example` only for documenting variable names.

## Coding Standards

- Keep code concise, clear, and focused on one responsibility. Prefer straightforward control flow and descriptive names over clever or overly generic abstractions.
- Avoid redundant logic and duplicated test setup. Extract a helper only when it improves clarity or reuse without hiding important test behavior.
- Prefer simple, memory-efficient approaches; avoid retaining unnecessary data or building large intermediate collections.
- Use TypeScript types and strict null checks to make invalid states harder to represent. Check optional values and API response shapes before accessing nested properties.
- Handle expected runtime failures explicitly. Assert and report actionable context when browser actions, API requests, parsing, or cleanup fail; do not silently swallow exceptions or convert failures into passing defaults.
- Keep comments short and useful: explain intent, constraints, or non-obvious decisions rather than restating the code.
- Avoid magic values. Name meaningful timeouts, URLs, and test data, and centralize shared configuration where it improves consistency.
- Keep tests deterministic and isolated. Use explicit waits for observable conditions instead of fixed sleeps, and avoid dependence on execution order or shared mutable state.
- Make assertions specific enough to identify what failed, while avoiding brittle checks tied to incidental implementation details.
- Make the smallest change that fully solves the problem, and update directly related tests when behavior changes.

## Commands

- Set up a fresh clone with `npm run setup`; this installs the locked dependencies and creates `.env` from `.env.example` without replacing an existing `.env`.
- Install locked dependencies manually with `npm ci`.
- Run API tests with `npm run test:api`.
- Run browser tests with `npm run test:web`.
- Run both suites with `npm test`.
- WebdriverIO manages the Chrome browser and driver for browser tests; an internet connection is required the first time they are run.
- Do not claim tests pass unless the relevant command has been run successfully.
