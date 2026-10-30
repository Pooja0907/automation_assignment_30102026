import { $ } from '@wdio/globals';

export class FlightSearchForm {
  get searchRegion() {
    return $('[role="search"]');
  }
}

export const flightSearchForm = new FlightSearchForm();