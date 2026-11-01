// Shared header selectors used by homepage layout assertions.
const { $ } = require('@wdio/globals');

class SiteHeader {
  // Locates the page banner containing the homepage header controls.
  get banner() {
    return $('header');
  }
}

const siteHeader = new SiteHeader();

module.exports = { SiteHeader, siteHeader };