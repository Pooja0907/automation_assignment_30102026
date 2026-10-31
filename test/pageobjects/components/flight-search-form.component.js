const { $, $$ } = require('@wdio/globals');

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

  async submitSearch() {
    await clickFreshElement(SEARCH_BUTTON);
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