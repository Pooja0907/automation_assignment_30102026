import { $, browser } from '@wdio/globals';

const HOMEPAGE_LOGO = 'aria/Go to the cheapflights homepage';
const SIGN_IN_BUTTON = 'aria/Sign in';
const MELBOURNE_FLIGHT_LINK = 'a[href*="/flight-search/SYD-MEL/"]';

export class CheapflightsPage {
  async open(): Promise<void> {
    await browser.url('/');
    await browser.execute(() => window.scrollTo(0, 0));
  }

  get logo() {
    return $(HOMEPAGE_LOGO);
  }

  get signInButton() {
    return $(SIGN_IN_BUTTON);
  }

  async openRecommendedMelbourneSearch(): Promise<void> {
    const searchLink = $(MELBOURNE_FLIGHT_LINK);
    await searchLink.waitForClickable({ timeout: 20_000 });

    const existingWindowHandles = await browser.getWindowHandles();
    await searchLink.click();

    let resultsWindowHandle: string | undefined;
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

export const cheapflightsPage = new CheapflightsPage();
