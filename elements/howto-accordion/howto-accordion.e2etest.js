/* eslint max-len: ["off"] */

const helper = require('../../tools/selenium-helper.js');
const expect = require('chai').expect;
const {Key} = require('selenium-webdriver');

describe('howto-accordion', function() {
  let success;
  beforeEach(function() {
    return this.driver.get(`${this.address}/howto-accordion/demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'howto-accordion'))
      .then(_ => this.driver.executeScript(_ => {
        window.queryShadowAgnosticSelector = function(elem, s) {
         return elem.querySelector(s) || (elem.shadowRoot && elem.shadowRoot.querySelector(s));
        };

        window.isHidden = function(elem) {
          return getComputedStyle(elem).display === 'none' ||
            getComputedStyle(elem).visibility === 'hidden' ||
            elem.hidden ||
            (elem.getAttribute('aria-hidden') || '').toLowerCase() === 'true';
        };
      }));
  });

  it('should handle arrow keys', async function() {
    await this.driver.executeScript(_ => {
      window.expectedFirstHeading = document.querySelector('[role=heading]:nth-of-type(1)');
      window.expectedSecondHeading = document.querySelector('[role=heading]:nth-of-type(2)');
    });

    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedFirstHeading);
    expect(success).to.be.true;

    await this.driver.actions().sendKeys(Key.ARROW_RIGHT).perform();
    success = await this.driver.executeScript(_ => document.activeElement === window.expectedSecondHeading);
    expect(success).to.be.true;

    await this.driver.actions().sendKeys(Key.ARROW_LEFT).perform();
    success = await this.driver.executeScript(_ => document.activeElement === window.expectedFirstHeading);
    expect(success).to.be.true;
  });

  it('should focus the last panel on [end]', async function() {
    await this.driver.executeScript(_ => {
      window.expectedFirstHeading = document.querySelector('[role=heading]:nth-of-type(1)');
      window.expectedLastHeading = document.querySelector('[role=heading]:last-of-type');
    });

    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedFirstHeading);
    expect(success).to.be.true;

    await this.driver.actions().sendKeys(Key.END).perform();
    success = await this.driver.executeScript(_ => document.activeElement === window.expectedLastHeading);
    expect(success).to.be.true;
  });

  it('should focus the first panel on [home]', async function() {
    await this.driver.executeScript(_ => {
      window.expectedFirstHeading = document.querySelector('[role=heading]:nth-of-type(1)');
      window.expectedLastHeading = document.querySelector('[role=heading]:last-of-type');
    });

    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedFirstHeading);
    expect(success).to.be.true;

    await this.driver.actions().sendKeys(Key.ARROW_LEFT).perform();
    await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedLastHeading);
    expect(success).to.be.true;

    await this.driver.actions().sendKeys(Key.HOME).perform();
    success = await this.driver.executeScript(_ => document.activeElement === window.expectedFirstHeading);
    expect(success).to.be.true;
  });

  it('should expand a panel on click', async function() {
    success = await this.driver.executeScript(_ => {
      window.lastHeading = document.querySelector('[role=heading]:last-of-type');
      window.lastPanel = document.getElementById(lastHeading.getAttribute('aria-controls'));
      window.lastButton = queryShadowAgnosticSelector(lastHeading, 'button');
      return [lastButton.getAttribute('aria-expanded'), isHidden(lastPanel)];
    });
    expect(success).to.deep.equal(['false', true]);

    const lastHeading = await this.driver.executeScript(_ => lastHeading);
    await lastHeading.click();
    await helper.sleep(500);
    success = await this.driver.executeScript(_ =>
      [lastButton.getAttribute('aria-expanded'), isHidden(lastPanel)]
    );
    expect(success).to.deep.equal(['true', false]);
  });

  it('should toggle a panel on [space]', async function() {
    await this.driver.executeScript(_ => {
      window.firstHeading = document.querySelector('[role=heading]:nth-of-type(1)');
    });
    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.firstHeading);
    expect(success).to.be.true;

    success = await this.driver.executeScript(_ => {
      window.firstPanel = document.getElementById(firstHeading.getAttribute('aria-controls'));
      return !!window.firstPanel;
    });
    expect(success).to.be.true;

    await this.driver.actions().sendKeys(Key.SPACE).perform();
    await helper.sleep(500);
    success = await this.driver.executeScript(_ => isHidden(firstPanel));
    expect(success).to.be.false;

    await this.driver.actions().sendKeys(Key.SPACE).perform();
    await helper.sleep(500);
    success = await this.driver.executeScript(_ => isHidden(firstPanel));
    expect(success).to.be.true;
  });
});
