import { $ } from '@wdio/globals';

export class SiteHeader {
  get banner() {
    return $('header');
  }
}

export const siteHeader = new SiteHeader();