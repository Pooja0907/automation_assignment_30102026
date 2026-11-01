// Page-level actions and stable selectors for the Cheapflights homepage.
const { $, browser } = require('@wdio/globals');

const HOMEPAGE_LOGO = 'aria/Go to the cheapflights homepage';
const SIGN_IN_BUTTON = 'aria/Sign in';

class CheapflightsPage {
  // Opens the configured homepage and starts at the top of the page.
  async open() {
    await browser.url('/');
    await browser.execute(() => window.scrollTo(0, 0));
  }

  // Locates the homepage logo using its accessible name.
  get logo() {
    return $(HOMEPAGE_LOGO);
  }

  // Locates the sign-in control using its accessible name.
  get signInButton() {
    return $(SIGN_IN_BUTTON);
  }

  // Locates a flight result group on a results page.
  get flightResults() {
    return $('[role="group"][aria-label^="Result item"]');
  }

  // Opens a recommended route and waits for its results page to load.
  async openRecommendedFlightSearch(originCode, destinationCode) {
    const searchLink = $(`a[href*="/flight-search/${originCode}-${destinationCode}/"]`);
    await searchLink.waitForClickable({ timeout: 20_000 });

    const existingWindowHandles = await browser.getWindowHandles();
    await searchLink.click();

    let resultsWindowHandle;
    await browser.waitUntil(
      async () => {
        const newWindowHandles = await browser.getWindowHandles();
        resultsWindowHandle = newWindowHandles.find((handle) => !existingWindowHandles.includes(handle));
        return resultsWindowHandle !== undefined || (await browser.getUrl()).includes('/flight-search/');
      },
      {
        timeout: 45_000,
        timeoutMsg: 'Expected the Melbourne flight search to open its results page.'
      }
    );

    if (resultsWindowHandle) {
      await browser.switchToWindow(resultsWindowHandle);
    }

    await browser.waitUntil(
      async () => (await browser.getUrl()).includes('/flight-search/'),
      {
        timeout: 30_000,
        timeoutMsg: 'Expected the Melbourne flight search results page to finish loading.'
      }
    );
  }
}

const cheapflightsPage = new CheapflightsPage();

module.exports = { CheapflightsPage, cheapflightsPage };
