import { expect } from '@open-wc/testing';

import { AppElement } from './app.element';

describe('AppElement', () => {
  let el: AppElement;

  beforeEach(() => {
    el = new AppElement();

    el.connectedCallback();
  });

  it('should render', () => {
    expect(el).to.be.instanceOf(AppElement);
  });

  it('should increment', async () => {
    await el.increment();

    expect(el.state.value).to.equal(1);
    expect(el.shadowRoot!.querySelector('span')!.innerHTML).to.equal(
      '<!---->1<!---->'
    );
  });

  it('should render', async () => {
    await el.decrement();

    expect(el.state.value).to.equal(-1);
    expect(el.shadowRoot!.querySelector('span')!.innerHTML).to.equal(
      '<!---->-1<!---->'
    );
  });
});
