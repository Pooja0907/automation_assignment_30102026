// Encapsulates flight-form interactions and dynamic accessible selectors.
const { $, $$, browser } = require('@wdio/globals');

class FlightSearchForm {
  // Locates the accessible search region containing the flight form.
  get searchRegion() {
    return $('[role="search"]');
  }

  // Removes selected locations and waits until the field is truly empty.
  async clearLocation(field) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const container = await this.getLocationContainer(field);
      const removeButtons = await container.$$('[role="button"][aria-label="Remove value"]');
      const visibleButtons = [];
      for (const button of removeButtons) {
        if (await button.isDisplayed()) {
          visibleButtons.push(button);
        }
      }

      if (visibleButtons.length === 0) {
        await browser.pause(500);
        if (!(await this.hasLocationValue(field))) {
          return;
        }
        continue;
      }

      await visibleButtons[0].click();
      await browser.waitUntil(
        async () => (await this.getVisibleLocationRemovalButtons(field)).length < visibleButtons.length,
        {
          timeout: 5_000,
          timeoutMsg: `The selected ${field} location did not clear after clicking Remove value.`
        }
      );
      await browser.pause(500);
    }

    if (await this.hasLocationValue(field)) {
      throw new Error(`The ${field} location still has a selected value after clearing its removable values.`);
    }
  }

  // Selects one matching airport suggestion for an origin or destination field.
  async selectLocation(field, city, airportCode) {
    const region = this.searchRegion;
    await browser.waitUntil(async () => Boolean(await this.getLocationInput(region, field)), {
      timeout: 10_000,
      timeoutMsg: `The ${field} location input did not become visible.`
    });
    const locationInput = await this.getLocationInput(region, field);

    await locationInput.click();
    await locationInput.waitForDisplayed();
    await locationInput.setValue(city);

    const suggestionsId = await locationInput.getAttribute('aria-controls');

    await browser.waitUntil(
      async () => (await this.getAirportSuggestions(suggestionsId, airportCode)).length > 0,
      {
        timeout: 15_000,
        timeoutMsg: `No airport suggestion appeared for ${city} (${airportCode}).`
      }
    );

    const airportOptions = await this.getAirportSuggestions(suggestionsId, airportCode);
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
      async () => (await (await this.getLocationContainer(field)).getText()).includes(airportCode),
      {
        timeout: 10_000,
        timeoutMsg: `The ${field} field did not select ${city} (${airportCode}).`
      }
    );
  }

  // Returns the selected text shown for a location field.
  async getLocationText(field) {
    return (await this.getLocationContainer(field)).getText();
  }

  // Reports whether the location field contains a selected value.
  async hasLocationValue(field) {
    return (await this.getVisibleLocationRemovalButtons(field)).length > 0;
  }

  // Locates the current origin or destination container.
  async getLocationContainer(field) {
    this.validateLocationField(field);
    const container = this.searchRegion.$(`[aria-label="Flight ${field} input"]`);
    await container.waitForDisplayed();
    return container;
  }

  // Finds visible remove-value controls for the selected field.
  async getVisibleLocationRemovalButtons(field) {
    const container = await this.getLocationContainer(field);
    const buttons = await container.$$('[role="button"][aria-label="Remove value"]');
    const visibleButtons = [];
    for (const button of buttons) {
      if (await button.isDisplayed()) {
        visibleButtons.push(button);
      }
    }
    return visibleButtons;
  }

  // Collects visible accessibility validation messages on the page.
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

  // Returns the visible dialog containing the expected text, if present.
  async getVisibleDialogContainingText(expectedText) {
    const dialogs = await $$('[role="dialog"]');
    for (const dialog of dialogs) {
      if (await dialog.isDisplayed() && (await dialog.getText()).includes(expectedText)) {
        return dialog;
      }
    }

    return undefined;
  }

  // Reads the destination validation overlay below the field in one browser call.
  async getDestinationAutocompleteError(expectedText) {
    return browser.execute((message) => {
      const destination = document.querySelector(
        '[aria-label="Flight destination input"] input[role="combobox"]'
      );
      if (!destination) {
        return undefined;
      }

      const destinationBottom = destination.getBoundingClientRect().bottom;
      const messages = document.querySelectorAll(
        '[role="alert"], [aria-live="assertive"], [aria-live="polite"]'
      );
      for (const element of messages) {
        const style = window.getComputedStyle(element);
        const bounds = element.getBoundingClientRect();
        const text = (element.innerText || element.textContent || '').trim();
        if (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          bounds.width > 0 &&
          bounds.height > 0 &&
          bounds.top >= destinationBottom &&
          text.includes(message)
        ) {
          return { text };
        }
      }

      return undefined;
    }, expectedText);
  }

  // Opens the destination suggestions when validation has not opened them already.
  async ensureDestinationAutocompleteOpen() {
    const destinationInput = await this.getLocationInput(this.searchRegion, 'destination');
    if (!destinationInput) {
      throw new Error('The destination input did not become visible.');
    }

    if ((await destinationInput.getAttribute('aria-expanded')) !== 'true') {
      await destinationInput.click();
    }
  }

  // Chooses a supported trip type and waits for the control to reflect it.
  async selectTripType(tripType) {
    if (!['Return', 'One-way', 'Multi-city'].includes(tripType)) {
      throw new Error(`Unsupported flight trip type "${tripType}".`);
    }

    const tripTypeControl = this.searchRegion.$('[role="combobox"][aria-label^="Trip type "]');
    await tripTypeControl.click();
    const optionListId = await tripTypeControl.getAttribute('aria-controls');

    // Finds the currently visible trip-type option, including portal-rendered menus.
    const findTripTypeOption = async () => {
      let options = [];
      if (optionListId) {
        const optionList = $(`[id="${optionListId}"]`);
        if (await optionList.isDisplayed()) {
          options = await optionList.$$('[role="option"]');
        }
      }
      if (options.length === 0) {
        options = await $$('[role="option"]');
      }

      for (const option of options) {
        if (await option.isDisplayed() && (await option.getText()).trim() === tripType) {
          return option;
        }
      }

      return undefined;
    };

    await browser.waitUntil(async () => Boolean(await findTripTypeOption()), {
      timeout: 10_000,
      timeoutMsg: `The "${tripType}" trip type option did not become visible.`
    });

    const option = await findTripTypeOption();
    await option.click();
    await browser.waitUntil(
      async () => (await tripTypeControl.getAttribute('aria-label')).includes(tripType),
      {
        timeout: 10_000,
        timeoutMsg: `The trip type did not change to "${tripType}".`
      }
    );
  }

  // Opens the traveller selector.
  async openTravellerPicker() {
    const picker = this.searchRegion.$('[role="combobox"][aria-label="Trip type"]');
    await picker.waitForClickable();
    await picker.click();
  }

  // Returns the current count for the requested traveller category.
  async getTravellerCount(travellerType) {
    const input = this.getTravellerInput(travellerType);
    await input.waitForDisplayed();
    return Number(await input.getValue());
  }

  // Increments a traveller category using its accessible control.
  async incrementTraveller(travellerType) {
    const input = this.getTravellerInput(travellerType);
    await input.waitForDisplayed();
    const incrementButton = input.$('..').$('button[aria-label="Increment"]');
    await incrementButton.waitForClickable();
    await incrementButton.click();
  }

  // Checks whether the traveller category's increment control is disabled.
  async isTravellerIncrementDisabled(travellerType) {
    const input = this.getTravellerInput(travellerType);
    const increment = input.$('..').$('button[aria-label="Increment"]');
    return (await increment.getAttribute('aria-disabled')) === 'true';
  }

  // Locates the input for a supported traveller category.
  getTravellerInput(travellerType) {
    if (!['Adults', 'Children', 'Infants on lap', 'Infants in seat'].includes(travellerType)) {
      throw new Error(`Unsupported traveller type "${travellerType}".`);
    }
    return $(`input[aria-label="${travellerType}"]`);
  }

  // Returns the visible lap-infant validation message when it appears.
  async getLapInfantValidationMessage(expectedMessage) {
    const messageElements = await $$('[role="alert"], [aria-live="assertive"], [aria-live="polite"]');
    for (const element of messageElements) {
      if (await element.isDisplayed()) {
        const message = (await element.getText()).trim();
        if (message.includes(expectedMessage)) {
          return message;
        }
      }
    }
    return '';
  }

  // Selects the requested departure or return date in the calendar.
  async selectDate(type, date) {
    if (!['Departure', 'Return'].includes(type) || !(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new Error('Date selection requires Departure or Return and a valid Date value.');
    }

    const month = new Intl.DateTimeFormat('en-AU', { month: 'long' }).format(date);
    const dateLabelPart = `${date.getDate()} ${month}, ${date.getFullYear()}`;
    // Finds the rendered calendar button for the requested date.
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

  // Swaps the selected origin and destination.
  async swapLocations() {
    const swapButton = this.searchRegion.$('[role="button"][aria-label="Swap origin and destination locations"]');
    await swapButton.waitForClickable();
    await swapButton.click();
  }

  // Submits the flight search form.
  async submitSearch() {
    await this.clickSearchControl('Search');
  }

  // Resets the current search form.
  async resetSearchForm() {
    await this.clickSearchControl('Reset the search form');
  }

  // Adds an additional flight leg to a multi-city search.
  async addAnotherFlight() {
    await this.clickSearchControl('Add another flight');
  }

  // Clicks a search-form control by its accessible name.
  async clickSearchControl(accessibleName) {
    const control = this.searchRegion.$(`aria/${accessibleName}`);
    await control.waitForClickable();
    await control.click();
  }

  // Summarizes route and date values for the last visible multi-city leg.
  async getMultiCityLegState() {
    const region = this.searchRegion;
    const origins = await this.getVisibleLocationInputs(region, 'origin');
    const destinations = await this.getVisibleLocationInputs(region, 'destination');
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

  // Finds the current visible input for an origin or destination.
  async getLocationInput(region, field) {
    this.validateLocationField(field);
    const labels = field === 'origin'
      ? ['Origin location']
      : ['Destination location', 'Ask anything', 'or ask anything'];
    for (const label of labels) {
      const input = region.$(`input[aria-label="${label}"]`);
      if (await input.isDisplayed()) {
        return input;
      }
    }

    return undefined;
  }

  // Collects visible inputs for all route legs of the selected field.
  async getVisibleLocationInputs(region, field) {
    this.validateLocationField(field);
    const labels = field === 'origin'
      ? ['Origin location']
      : ['Destination location', 'Ask anything', 'or ask anything'];
    const inputs = [];
    for (const label of labels) {
      const matchingInputs = await region.$$(`input[aria-label="${label}"]`);
      for (const input of matchingInputs) {
        if (await input.isDisplayed()) {
          inputs.push(input);
        }
      }
    }
    return inputs;
  }

  // Rejects unsupported origin/destination field names.
  validateLocationField(field) {
    if (!['origin', 'destination'].includes(field)) {
      throw new Error(`Unsupported flight location field "${field}".`);
    }
  }

  // Finds visible airport suggestions matching the requested airport code.
  async getAirportSuggestions(listId, airportCode) {
    const matchingOptions = [];
    let options = [];
    if (listId) {
      const list = $(`[id="${listId}"]`);
      if (await list.isDisplayed()) {
        options = await list.$$('[role="option"]');
      }
    }

    if (options.length === 0) {
      options = await $$('[role="listbox"] [role="option"]');
    }

    for (const option of options) {
      if (await option.isDisplayed() && (await option.getText()).includes(airportCode)) {
        matchingOptions.push(option);
      }
    }

    return matchingOptions;
  }
}

const flightSearchForm = new FlightSearchForm();

module.exports = { FlightSearchForm, flightSearchForm };