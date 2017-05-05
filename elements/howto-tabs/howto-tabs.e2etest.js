/* eslint max-len: ["off"] */

const helper = require('../../tools/selenium-helper.js');
const expect = require('chai').expect;
const {Key, By} = require('selenium-webdriver');

describe('howto-tabs', function() {
  beforeEach(function() {
    return this.driver.get(`${this.address}/howto-tabs/demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'howto-tabs'));
  });

  it('should focus the next tab on [arrow right]', async function() {
    const found = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement.getAttribute('role') === 'tab');
    expect(found).to.be.true;

    await this.driver.executeScript(_ => {
      window.firstTab = document.querySelector('[role="tablist"] > [role="tab"]:nth-of-type(1)');
      window.secondTab = document.querySelector('[role="tablist"] > [role="tab"]:nth-of-type(2)');
    });
    await this.driver.actions().sendKeys(Key.ARROW_RIGHT).perform();
    const focusedSecondTab = await this.driver.executeScript(_ => window.secondTab === document.activeElement);
    expect(focusedSecondTab).to.be.true;
  });

  it('should focus the prev tab on [arrow left]', async function() {
    const found = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement.getAttribute('role') === 'tab');
    expect(found).to.be.true;

    await this.driver.executeScript(_ => {
      window.firstTab = document.querySelector('[role="tablist"] > [role="tab"]:first-of-type');
      window.lastTab = document.querySelector('[role="tablist"] > [role="tab"]:last-of-type');
    });
    await this.driver.actions().sendKeys(Key.ARROW_LEFT).perform();
    const focusedLastTab = await this.driver.executeScript(_ => window.lastTab === document.activeElement);
    expect(focusedLastTab).to.be.true;
  });

  it('should focus the last tab on [end]', async function() {
    const found = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement.getAttribute('role') === 'tab');
    expect(found).to.be.true;

    await this.driver.executeScript(_ => {
      window.firstTab = document.querySelector('[role="tablist"] > [role="tab"]:first-of-type');
      window.lastTab = document.querySelector('[role="tablist"] > [role="tab"]:last-of-type');
      firstTab.focus();
    });
    await this.driver.actions().sendKeys(Key.END).perform();
    const focusedLastTab = await this.driver.executeScript(_ => window.lastTab === document.activeElement);
    expect(focusedLastTab).to.be.true;
  });

  it('should focus the first tab on [home]', async function() {
    const found = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement.getAttribute('role') === 'tab');
    expect(found).to.be.true;

    await this.driver.executeScript(_ => {
      window.firstTab = document.querySelector('[role="tablist"] > [role="tab"]:first-of-type');
      window.lastTab = document.querySelector('[role="tablist"] > [role="tab"]:last-of-type');
      lastTab.focus();
    });
    await this.driver.actions().sendKeys(Key.HOME).perform();
    const focusedFirstTab = await this.driver.executeScript(_ => window.firstTab === document.activeElement);
    expect(focusedFirstTab).to.be.true;
  });

 it('should focus a tab on click', async function() {
    const lastTab = await this.driver.findElement(By.css('[role=tab]:last-of-type'));
    expect(await lastTab.getAttribute('aria-selected')).to.not.equal('true');
    await lastTab.click();
    expect(await lastTab.getAttribute('aria-selected')).to.equal('true');
  });

  it('should handle elements added after initialization', async function() {
    const found = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement.getAttribute('role') === 'tab');
    expect(found).to.be.true;

    await this.driver.executeScript(_ => {
      window.tabpanel = document.querySelector('howto-tabs');
      window.newTab = document.createElement('howto-tabs-tab');
      newTab.slot = 'tab';
      newTab.textContent = 'New Tab';
      window.newPanel = document.createElement('howto-tabs-panel');
      newPanel.slot = 'panel';
      newPanel.textContent = 'Some content';
      tabpanel.appendChild(newTab);
      tabpanel.appendChild(newPanel);
    });
    await this.driver.actions().sendKeys(Key.END).perform();
    success = await this.driver.executeScript(_ =>
      document.activeElement === newTab
    );
    expect(success).to.be.true;
  });
});
