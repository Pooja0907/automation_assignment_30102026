// Covers valid flight searches and user-visible flight-form validation behavior.
const { expect } = require('chai');
const { browser } = require('@wdio/globals');
const { cheapflightsPage } = require('../../pageobjects/cheapflights.page');
const { flightSearchForm } = require('../../pageobjects/components/flight-search-form.component');
const { getCases } = require('../../data/test-data');

// Groups the data-driven browser tests for flight search behavior.
describe('Cheapflights flight search', function () {
  for (const testCase of getCases('web.flightSearch')) {
    // Confirms a valid Sydney-to-Melbourne search opens a results tab.
    it(`opens search results in a new tab for ${testCase.name}`, async function () {
      await cheapflightsPage.open();
      await flightSearchForm.searchRegion.waitForDisplayed();
      await configureRouteAndDates(testCase);
      await submitSearchAndVerifyNewTab();
    });
  }

  for (const testCase of getCases('web.sameOriginDestination')) {
    // Confirms identical airports are rejected with an overlay under destination.
    it(`shows an error when searching the same origin and destination: ${testCase.name}`, async function () {
      await cheapflightsPage.open();
      await flightSearchForm.searchRegion.waitForDisplayed();
      await flightSearchForm.selectTripType('One-way');
      await flightSearchForm.clearLocation('origin');
      await flightSearchForm.clearLocation('destination');
      await flightSearchForm.selectLocation('origin', testCase.origin, testCase.originCode);
      await flightSearchForm.selectLocation('destination', testCase.origin, testCase.originCode);
      await flightSearchForm.selectDate('Departure', dateWithOffset(testCase.departureOffsetDays));

      const handlesBefore = await browser.getWindowHandles();
      await flightSearchForm.submitSearch();
      expect(await browser.getWindowHandles()).to.have.lengthOf(handlesBefore.length);
      await flightSearchForm.ensureDestinationAutocompleteOpen();

      await browser.waitUntil(
        async () => Boolean(await flightSearchForm.getDestinationAutocompleteError(testCase.errorMessage)),
        {
          timeout: 10_000,
          timeoutMsg: `Expected the destination overlay below its field to show "${testCase.errorMessage}".`
        }
      );

      const errorOverlay = await flightSearchForm.getDestinationAutocompleteError(testCase.errorMessage);
      expect(errorOverlay.text).to.equal(testCase.errorMessage);
    });
  }

  // Negative test case
  for (const testCase of getCases('web.infantsExceedAdults')) {
    // Confirms the traveller controls prevent lap infants from exceeding adults.
    it(`prevents selecting more lap infants than adults: ${testCase.name}`, async function () {
      await cheapflightsPage.open();
      await flightSearchForm.searchRegion.waitForDisplayed();
      await flightSearchForm.selectTripType('One-way');
      await flightSearchForm.clearLocation('origin');
      await flightSearchForm.clearLocation('destination');
      await flightSearchForm.selectLocation('origin', testCase.origin, testCase.originCode);
      await flightSearchForm.selectLocation('destination', testCase.destination, testCase.destinationCode);
      await flightSearchForm.selectDate('Departure', dateWithOffset(testCase.departureOffsetDays));
      await flightSearchForm.openTravellerPicker();

      expect(await flightSearchForm.getTravellerCount('Adults')).to.equal(testCase.adults);
      for (let count = 0; count <= testCase.adults; count += 1) {
        await flightSearchForm.incrementTraveller('Infants on lap');
      }

      expect(await flightSearchForm.getTravellerCount('Infants on lap')).to.equal(testCase.adults);
      expect(await flightSearchForm.isTravellerIncrementDisabled('Infants on lap')).to.equal(true);
      expect(await flightSearchForm.getLapInfantValidationMessage(testCase.errorMessage))
        .to.equal(testCase.errorMessage);
    });
  }

  for (const testCase of getCases('web.incompleteSearch')) {
    // Confirms an empty destination blocks submission and displays its validation.
    it(`does not submit a search with ${testCase.name.toLowerCase()}`, async function () {
      await cheapflightsPage.open();
      await flightSearchForm.searchRegion.waitForDisplayed();
      await flightSearchForm.clearLocation(testCase.missingField);
      await browser.waitUntil(
        async () => !(await flightSearchForm.hasLocationValue(testCase.missingField)),
        {
          timeout: 10_000,
          timeoutMsg: `Expected the ${testCase.missingField} field to be empty before searching.`
        }
      );

      const handlesBefore = await browser.getWindowHandles();
      await flightSearchForm.submitSearch();
      expect(await browser.getWindowHandles()).to.have.lengthOf(handlesBefore.length);

      const errorMessage = 'Please enter a Destination airport';
      await flightSearchForm.ensureDestinationAutocompleteOpen();
      let destinationErrorDropdown;
      await browser.waitUntil(
        async () => {
          destinationErrorDropdown = await flightSearchForm.getDestinationAutocompleteError(errorMessage);
          return Boolean(destinationErrorDropdown);
        },
        {
          timeout: 10_000,
          timeoutMsg: `Expected a destination autocomplete dropdown below the field containing "${errorMessage}".`
        }
      );

      expect(destinationErrorDropdown.text).to.include(errorMessage);
    });
  }

  // Negative test case
  for (const testCase of getCases('web.multiCityBlankSearch')) {
    // Confirms a blank multi-city form is blocked by its expected error dialog.
    it(`shows a blocking error for ${testCase.name.toLowerCase()}`, async function () {
      await cheapflightsPage.open();
      await flightSearchForm.searchRegion.waitForDisplayed();
      await flightSearchForm.selectTripType('Multi-city');
      await flightSearchForm.resetSearchForm();

      const handlesBefore = await browser.getWindowHandles();
      await flightSearchForm.submitSearch();

      let errorDialog;
      await browser.waitUntil(
        async () => {
          errorDialog = await flightSearchForm.getVisibleDialogContainingText(testCase.errorMessage);
          return errorDialog !== undefined;
        },
        {
          timeout: 10_000,
          timeoutMsg: `Expected a blocking dialog containing "${testCase.errorMessage}".`
        }
      );

      expect(await errorDialog.getText()).to.include(testCase.errorMessage);
      expect(await browser.getWindowHandles()).to.have.lengthOf(handlesBefore.length);
    });

    // Confirms adding another multi-city leg creates a new empty route and date row.
    it(`adds a blank flight leg for ${testCase.name.toLowerCase()}`, async function () {
      await cheapflightsPage.open();
      await flightSearchForm.searchRegion.waitForDisplayed();
      await flightSearchForm.selectTripType('Multi-city');
      await flightSearchForm.resetSearchForm();

      const before = await flightSearchForm.getMultiCityLegState();
      await flightSearchForm.addAnotherFlight();

      let after;
      await browser.waitUntil(
        async () => {
          after = await flightSearchForm.getMultiCityLegState();
          return after.originCount === before.originCount + 1 &&
            after.destinationCount === before.destinationCount + 1 &&
            after.departureDateCount === before.departureDateCount + 1;
        },
        {
          timeout: 10_000,
          timeoutMsg: 'Expected Add another flight to add an origin, destination, and departure-date row.'
        }
      );

      expect(after.lastOrigin).to.equal('');
      expect(after.lastDestination).to.equal('');
      expect(after.lastDepartureDate).to.equal('Departure');
    });
  }
});

// Fills both route fields and selects the corresponding travel dates.
async function configureRouteAndDates(testCase) {
  await flightSearchForm.clearLocation('origin');
  await flightSearchForm.clearLocation('destination');
  await flightSearchForm.selectLocation('origin', testCase.origin, testCase.originCode);
  await flightSearchForm.selectLocation('destination', testCase.destination, testCase.destinationCode);
  await selectDates(testCase);
}

// Selects the departure and return dates using offsets from today.
async function selectDates(testCase) {
  await flightSearchForm.selectDate('Departure', dateWithOffset(testCase.departureOffsetDays));
  await flightSearchForm.selectDate('Return', dateWithOffset(testCase.returnOffsetDays));
}

// Submits a valid search, verifies its new results tab, then restores the original tab.
async function submitSearchAndVerifyNewTab() {
  const originalHandle = await browser.getWindowHandle();
  const handlesBefore = await browser.getWindowHandles();

  await flightSearchForm.submitSearch();

  let resultsHandle;
  await browser.waitUntil(
    async () => {
      const handlesAfter = await browser.getWindowHandles();
      resultsHandle = handlesAfter.find((handle) => !handlesBefore.includes(handle));
      return resultsHandle !== undefined;
    },
    {
      timeout: 45_000,
      timeoutMsg: 'Expected flight search results to open in a new browser tab.'
    }
  );

  const handlesAfter = await browser.getWindowHandles();
  // Results open in a separate tab; close it so later steps return to the homepage.
  expect(handlesAfter).to.have.lengthOf(handlesBefore.length + 1);
  await browser.switchToWindow(resultsHandle);
  await browser.waitUntil(
    async () => (await browser.getUrl()).includes('/flight-search/'),
    {
      timeout: 30_000,
      timeoutMsg: 'The new browser tab did not load the flight-search results page.'
    }
  );
  await browser.closeWindow();
  await browser.switchToWindow(originalHandle);
}

// Builds a stable local date for a scenario's number of days in the future.
function dateWithOffset(offsetDays) {
  const date = new Date();
  // Midday avoids crossing a local date boundary when the browser formats the date.
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date;
}