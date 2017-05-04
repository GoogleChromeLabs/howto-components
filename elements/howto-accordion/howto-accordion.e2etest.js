/* eslint max-len: ["off"] */

const helper = require('../../tools/selenium-helper.js');
const expect = require('chai').expect;
const {Key, By} = require('selenium-webdriver');

describe('howto-accordion', function() {
  let success;
  beforeEach(function() {
    return this.driver.get(`${this.address}/howto-accordion/demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'howto-accordion'));
  });

  it('should handle arrow keys', async function() {
    await this.driver.executeScript(_ => {
      window.expectedFirstHeading = document.querySelector('[role=heading]:nth-of-type(1)');
      window.expectedSecondHeading = document.querySelector('[role=heading]:nth-of-type(2)');
    });

    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedFirstHeading);
    expect(success).to.equal(true);

    await this.driver.actions().sendKeys(Key.ARROW_RIGHT).perform();
    success = await this.driver.executeScript(_ => document.activeElement === window.expectedSecondHeading);
    expect(success).to.equal(true);

    await this.driver.actions().sendKeys(Key.ARROW_LEFT).perform();
    success = await this.driver.executeScript(_ => document.activeElement === window.expectedFirstHeading);
    expect(success).to.equal(true);
  });

  it('should focus the last panel on [end]', async function() {
    await this.driver.executeScript(_ => {
      window.expectedFirstHeading = document.querySelector('[role=heading]:nth-of-type(1)');
      window.expectedLastHeading = document.querySelector('[role=heading]:last-of-type');
    });

    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedFirstHeading);
    expect(success).to.equal(true);

    await this.driver.actions().sendKeys(Key.END).perform();
    success = await this.driver.executeScript(_ => document.activeElement === window.expectedLastHeading);
    expect(success).to.equal(true);
  });

  it('should focus the first panel on [home]', async function() {
    await this.driver.executeScript(_ => {
      window.expectedFirstHeading = document.querySelector('[role=heading]:nth-of-type(1)');
      window.expectedLastHeading = document.querySelector('[role=heading]:last-of-type');
    });

    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedFirstHeading);
    expect(success).to.equal(true);

    await this.driver.actions().sendKeys(Key.ARROW_LEFT).perform();
    await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedLastHeading);
    expect(success).to.equal(true);

    await this.driver.actions().sendKeys(Key.HOME).perform();
    success = await this.driver.executeScript(_ => document.activeElement === window.expectedFirstHeading);
    expect(success).to.equal(true);
  });

  it('should expand a panel on click', async function() {
    const lastHeading = await this.driver.findElement(By.css('[role=heading]:last-of-type'));
    const lastPanelId = await lastHeading.getAttribute('aria-controls');
    const lastPanel = await this.driver.findElement(By.id(lastPanelId));
    expect(await lastHeading.getAttribute('aria-expanded')).to.not.equal('true');
    expect(await lastPanel.getAttribute('aria-hidden')).to.not.equal('false');

    await lastHeading.click();
    await helper.sleep(500);
    expect(await lastPanel.getAttribute('aria-hidden')).to.equal('false');
    expect(await lastHeading.getAttribute('aria-expanded')).to.equal('true');
  });

  it('should toggle a panel on [space]', async function() {
    await this.driver.executeScript(_ => {
      window.firstHeading = document.querySelector('[role=heading]:nth-of-type(1)');
    });
    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.firstHeading);
    expect(success).to.equal(true);

    success = await this.driver.executeScript(_ => {
      window.firstPanel = document.getElementById(firstHeading.getAttribute('aria-controls'));
      return !!window.firstPanel;
    });
    expect(success).to.equal(true);

    await this.driver.actions().sendKeys(Key.SPACE).perform();
    success = await this.driver.executeScript(_ => firstPanel.getAttribute('aria-hidden') === 'false');
    expect(success).to.equal(true);

    await this.driver.actions().sendKeys(Key.SPACE).perform();
    success = await this.driver.executeScript(_ => firstPanel.getAttribute('aria-hidden') === 'true');
  });
});
