import { expect } from 'chai';
import { browser } from '@wdio/globals';
import { cheapflightsPage } from '../../pageobjects/cheapflights.page';
import { flightSearchForm } from '../../pageobjects/components/flight-search-form.component';

describe('Cheapflights flight search', function () {
  it('opens Sydney-to-Melbourne results from a recommended flight search', async function () {
    await cheapflightsPage.open();
    await flightSearchForm.searchRegion.waitForDisplayed();
    await cheapflightsPage.openRecommendedMelbourneSearch();

    const resultsUrl = await browser.getUrl();
    const resultsTitle = await browser.getTitle();

    expect(resultsUrl).to.include('/flight-search/');
    expect(resultsUrl).to.include('SYD-MEL');
    expect(resultsTitle).to.match(/^SYD to MEL,/);
  });
});