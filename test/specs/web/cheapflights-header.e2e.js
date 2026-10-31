const { expect } = require('chai');
const { cheapflightsPage } = require('../../pageobjects/cheapflights.page');
const { siteHeader } = require('../../pageobjects/components/site-header.component');

describe('Cheapflights header', function () {
  beforeEach(async function () {
    await cheapflightsPage.open();
    await siteHeader.banner.waitForDisplayed();
  });

  it('displays the homepage logo', async function () {
    await cheapflightsPage.logo.waitForDisplayed();
    expect(await cheapflightsPage.logo.isDisplayed()).to.equal(true);
  });

  it('displays the sign-in control in the header to the right of the logo', async function () {
    const logo = cheapflightsPage.logo;
    const signIn = cheapflightsPage.signInButton;

    await logo.waitForDisplayed();
    await signIn.waitForDisplayed();

    const headerPosition = await siteHeader.banner.getLocation();
    const headerSize = await siteHeader.banner.getSize();
    const logoPosition = await logo.getLocation();
    const logoSize = await logo.getSize();
    const signInPosition = await signIn.getLocation();
    const signInSize = await signIn.getSize();

    expect(logoPosition.x).to.be.at.least(headerPosition.x);
    expect(logoPosition.x + logoSize.width).to.be.at.most(headerPosition.x + headerSize.width);
    expect(signInPosition.x).to.be.greaterThan(logoPosition.x + logoSize.width);
    expect(signInPosition.y + signInSize.height / 2).to.be.within(
      headerPosition.y,
      headerPosition.y + headerSize.height
    );
  });
});