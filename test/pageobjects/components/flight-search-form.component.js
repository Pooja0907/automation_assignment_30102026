const { $, $$, browser } = require('@wdio/globals');

const SEARCH_BUTTON = 'aria/Search';

class FlightSearchForm {
  get searchRegion() {
    return $('[role="search"]');
  }

  async clearLocation(field) {
    if (!['origin', 'destination'].includes(field)) {
      throw new Error(`Unsupported flight location field "${field}".`);
    }

    const selector = `[aria-label="Flight ${field} input"] [aria-label="Remove value"]`;
    await clickFreshElement(selector, true);
  }

  async selectLocation(field, city, airportCode) {
    if (!['origin', 'destination'].includes(field)) {
      throw new Error(`Unsupported flight location field "${field}".`);
    }

    const region = this.searchRegion;
    if (field === 'origin') {
      await region.$('[aria-label="Flight origin input"]').click();
    } else {
      await region.$('input[aria-label="Ask anything"]').click();
    }

    const inputLabels = field === 'origin'
      ? ['Origin location']
      : ['Destination location', 'Ask anything'];
    let locationInput;
    for (const inputLabel of inputLabels) {
      const candidate = region.$(`input[aria-label="${inputLabel}"]`);
      if (await candidate.isDisplayed()) {
        locationInput = candidate;
        break;
      }
    }

    if (!locationInput) {
      throw new Error(`The ${field} location input did not become visible.`);
    }

    await locationInput.waitForDisplayed();
    await locationInput.setValue(city);

    await browser.waitUntil(
      async () => {
        const options = await $$('[role="option"]');
        for (const option of options) {
          if (await option.isDisplayed() && (await option.getText()).includes(airportCode)) {
            return true;
          }
        }
        return false;
      },
      {
        timeout: 15_000,
        timeoutMsg: `No airport suggestion appeared for ${city} (${airportCode}).`
      }
    );

    const airportOptions = [];
    const options = await $$('[role="option"]');
    for (const option of options) {
      if (await option.isDisplayed() && (await option.getText()).includes(airportCode)) {
        airportOptions.push(option);
      }
    }

    const allAirportOptions = [];
    for (const option of airportOptions) {
      if ((await option.getText()).toLowerCase().includes('all airports')) {
        allAirportOptions.push(option);
      }
    }

    const matchingOptions = allAirportOptions.length ? allAirportOptions : airportOptions;
    if (matchingOptions.length !== 1) {
      throw new Error(`Expected one suggestion for ${city} (${airportCode}), found ${matchingOptions.length}.`);
    }

    await matchingOptions[0].click();
    await browser.waitUntil(
      async () => (await region.$(`[aria-label="Flight ${field} input"]`).getText()).includes(airportCode),
      {
        timeout: 10_000,
        timeoutMsg: `The ${field} field did not select ${city} (${airportCode}).`
      }
    );
  }

  async getLocationText(field) {
    if (!['origin', 'destination'].includes(field)) {
      throw new Error(`Unsupported flight location field "${field}".`);
    }

    return this.searchRegion.$(`[aria-label="Flight ${field} input"]`).getText();
  }

  async getValidationMessages() {
    const messageElements = await $$('[role="alert"], [aria-live="assertive"], [aria-live="polite"]');
    const messages = [];

    for (const element of messageElements) {
      if (await element.isDisplayed()) {
        const message = (await element.getText()).trim();
        if (message) {
          messages.push(message);
        }
      }
    }

    return messages;
  }

  async getVisibleDialogContainingText(expectedText) {
    const dialogs = await $$('[role="dialog"]');
    for (const dialog of dialogs) {
      if (await dialog.isDisplayed() && (await dialog.getText()).includes(expectedText)) {
        return dialog;
      }
    }

    return undefined;
  }

  async getDestinationAutocompleteError(expectedText) {
    const destinationInput = await this.getDestinationInput(this.searchRegion);
    if (!destinationInput) {
      return undefined;
    }

    const destinationLocation = await destinationInput.getLocation();
    const destinationSize = await destinationInput.getSize();
    const messageElements = await $$('[role="alert"], [aria-live="assertive"], [aria-live="polite"]');
    for (const message of messageElements) {
      if (!(await message.isDisplayed()) || !(await message.getText()).includes(expectedText)) {
        continue;
      }

      const messageLocation = await message.getLocation();
      if (messageLocation.y >= destinationLocation.y + destinationSize.height) {
        return { text: (await message.getText()).trim(), element: message };
      }
    }

    return undefined;
  }

  async ensureDestinationAutocompleteOpen() {
    const destinationInput = await this.getDestinationInput(this.searchRegion);
    if (!destinationInput) {
      throw new Error('The destination input did not become visible.');
    }

    if ((await destinationInput.getAttribute('aria-expanded')) !== 'true') {
      await destinationInput.click();
    }
  }

  async selectTripType(tripType) {
    if (!['Return', 'One-way', 'Multi-city'].includes(tripType)) {
      throw new Error(`Unsupported flight trip type "${tripType}".`);
    }

    await this.searchRegion.$('[role="combobox"][aria-label^="Trip type "]').click();
    const option = $(`[role="option"][aria-label="${tripType}"]`);
    await option.waitForDisplayed();
    await option.click();
  }

  async openTravellerPicker() {
    const picker = this.searchRegion.$('[role="combobox"][aria-label="Trip type"]');
    await picker.waitForClickable();
    await picker.click();
  }

  async getTravellerCount(travellerType) {
    const input = $(`input[aria-label="${travellerType}"]`);
    await input.waitForDisplayed();
    return Number(await input.getValue());
  }

  async incrementTraveller(travellerType) {
    const input = $(`input[aria-label="${travellerType}"]`);
    await input.waitForDisplayed();
    await input.$('..').$('button[aria-label="Increment"]').click();
  }

  async isTravellerIncrementDisabled(travellerType) {
    const input = $(`input[aria-label="${travellerType}"]`);
    const increment = input.$('..').$('button[aria-label="Increment"]');
    return (await increment.getAttribute('aria-disabled')) === 'true';
  }

  async getLapInfantValidationMessage() {
    const message = $('#error-lapInfant');
    return await message.isDisplayed() ? (await message.getText()).trim() : '';
  }

  async selectDate(type, date) {
    if (!['Departure', 'Return'].includes(type) || !(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new Error('Date selection requires Departure or Return and a valid Date value.');
    }

    const month = new Intl.DateTimeFormat('en-AU', { month: 'long' }).format(date);
    const dateLabelPart = `${date.getDate()} ${month}, ${date.getFullYear()}`;
    const findDateButton = async () => {
      const buttons = await $$('[role="button"][aria-label]');
      for (const button of buttons) {
        const label = await button.getAttribute('aria-label');
        if (await button.isDisplayed() && label.includes(dateLabelPart)) {
          return button;
        }
      }
      return undefined;
    };

    let dateButton = await findDateButton();
    if (!dateButton) {
      const dateControls = await this.searchRegion.$$('[role="button"]');
      let dateControl;
      for (const control of dateControls) {
        const text = await control.getText();
        const isDateSummary = text.includes(' - ') && text.length < 40;
        if (await control.isDisplayed() && (text.includes(type) || isDateSummary)) {
          dateControl = control;
          break;
        }
      }

      if (!dateControl) {
        throw new Error(`The flight search date control for ${type.toLowerCase()} was not found.`);
      }

      await dateControl.click();
      await browser.waitUntil(async () => Boolean(await findDateButton()), {
        timeout: 10_000,
        timeoutMsg: `The ${type.toLowerCase()} date ${dateLabelPart} was not available.`
      });
      dateButton = await findDateButton();
    }

    await dateButton.waitForClickable({ timeout: 10_000 });
    await dateButton.click();
  }

  async swapLocations() {
    const swapButton = this.searchRegion.$('[role="button"][aria-label="Swap origin and destination locations"]');
    await swapButton.waitForClickable();
    await swapButton.click();
  }

  async submitSearch() {
    await clickFreshElement(SEARCH_BUTTON);
  }

  async resetSearchForm() {
    await clickFreshElement('aria/Reset the search form');
  }

  async addAnotherFlight() {
    await clickFreshElement('aria/Add another flight');
  }

  async getMultiCityLegState() {
    const region = this.searchRegion;
    const origins = await region.$$('input[aria-label="Origin location"]');
    const destinations = await region.$$('input[aria-label="Destination location"]');
    const departureDates = await region.$$('[role="button"][aria-label="Departure date"]');
    const lastIndex = origins.length - 1;

    return {
      originCount: origins.length,
      destinationCount: destinations.length,
      departureDateCount: departureDates.length,
      lastOrigin: lastIndex >= 0 ? await origins[lastIndex].getValue() : undefined,
      lastDestination: lastIndex >= 0 ? await destinations[lastIndex].getValue() : undefined,
      lastDepartureDate: lastIndex >= 0 ? await departureDates[lastIndex].getText() : undefined
    };
  }

  async getDestinationInput(region) {
    for (const label of ['Destination location', 'Ask anything', 'or ask anything']) {
      const candidate = region.$(`input[aria-label="${label}"]`);
      if (await candidate.isDisplayed()) {
        return candidate;
      }
    }

    return undefined;
  }
}

async function clickFreshElement(selector, optional = false) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const elements = selector.startsWith('aria/') ? [$(selector)] : await $$(selector);

      for (const element of elements) {
        if (await element.isDisplayed()) {
          await element.click();
          return;
        }
      }

      if (optional) {
        return;
      }

      throw new Error(`No visible element found for "${selector}".`);
    } catch (error) {
      if (!(error instanceof Error) || !/stale element reference/i.test(error.message) || attempt === 2) {
        throw error;
      }
    }
  }
}

const flightSearchForm = new FlightSearchForm();

module.exports = { FlightSearchForm, flightSearchForm };