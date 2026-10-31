const { $ } = require('@wdio/globals');

class SiteHeader {
  get banner() {
    return $('header');
  }
}

const siteHeader = new SiteHeader();

module.exports = { SiteHeader, siteHeader };