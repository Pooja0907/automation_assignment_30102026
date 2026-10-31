const { expect } = require('chai');
const { browser } = require('@wdio/globals');
const { cheapflightsPage } = require('../../pageobjects/cheapflights.page');
const { flightSearchForm } = require('../../pageobjects/components/flight-search-form.component');
const { getCases } = require('../../data/test-data');

describe('Cheapflights flight search', function () {
  for (const testCase of getCases('web.flightSearch')) {
    it(`shows results for ${testCase.name}`, async function () {
      await cheapflightsPage.open();
      await flightSearchForm.searchRegion.waitForDisplayed();
      await cheapflightsPage.openRecommendedFlightSearch(testCase.originCode, testCase.destinationCode);

      const resultsUrl = await browser.getUrl();
      const resultsTitle = await browser.getTitle();

      expect(resultsUrl).to.include(`/flight-search/${testCase.originCode}-${testCase.destinationCode}/`);
      expect(resultsTitle).to.match(new RegExp(`^${testCase.originCode} to ${testCase.destinationCode},`));

      await cheapflightsPage.flightResults.waitForDisplayed({ timeout: 45_000 });
      expect(await cheapflightsPage.flightResults.isDisplayed()).to.equal(true);
    });
  }

  for (const testCase of getCases('web.incompleteSearch')) {
    it(`does not submit a search with ${testCase.name.toLowerCase()}`, async function () {
      await cheapflightsPage.open();
      await flightSearchForm.searchRegion.waitForDisplayed();
      await flightSearchForm.clearLocation(testCase.missingField);

      const homepageUrl = await browser.getUrl();
      await flightSearchForm.submitSearch();

      expect(await browser.getUrl()).to.equal(homepageUrl);
      expect(await browser.getUrl()).not.to.include('/flight-search/');
    });
  }
});