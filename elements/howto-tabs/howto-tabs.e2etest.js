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
    expect(found).to.equal(true);

    await this.driver.executeScript(_ => window.firstTab = document.activeElement);
    await this.driver.actions().sendKeys(Key.ARROW_RIGHT).perform();
    const focusedSomeTab = await this.driver.executeScript(_ =>
      window.firstTab !== document.activeElement && !!document.activeElement.getAttribute('role')
    );
    expect(focusedSomeTab).to.equal(true);
  });

  it('should focus the prev tab on [arrow left]', async function() {
    const found = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement.getAttribute('role') === 'tab');
    expect(found).to.equal(true);

    await this.driver.executeScript(_ => window.firstTab = document.activeElement);
    await this.driver.actions().sendKeys(Key.ARROW_LEFT).perform();
    const focusedAnotherTab = await this.driver.executeScript(_ =>
      window.firstTab !== document.activeElement && document.activeElement.getAttribute('role') === 'tab'
    );
    expect(focusedAnotherTab).to.equal(true);
  });

  it('should focus the last tab on [end]', async function() {
    const found = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement.getAttribute('role') === 'tab');
    expect(found).to.equal(true);
    await this.driver.executeScript(_ => window.firstTab = document.activeElement);

    await this.driver.actions().sendKeys(Key.END).perform();
    const focusedSomeTab = await this.driver.executeScript(_ =>
      window.firstTab !== document.activeElement && document.activeElement.getAttribute('role') === 'tab'
    );
    expect(focusedSomeTab).to.equal(true);

    await this.driver.actions().sendKeys(Key.ARROW_RIGHT).perform();
    const nextTabWasFirstTab = await this.driver.executeScript(_ =>
      window.firstTab === document.activeElement
    );
    expect(nextTabWasFirstTab).to.equal(true);
  });

  it('should focus the first tab on [home]', async function() {
    const found = await helper.pressKeyUntil( this.driver, Key.TAB, _ => document.activeElement.getAttribute('role') === 'tab');
    expect(found).to.equal(true);
    await this.driver.executeScript(_ => window.firstTab = document.activeElement);

    await this.driver.actions().sendKeys(Key.ARROW_LEFT).perform();
    await this.driver.actions().sendKeys(Key.HOME).perform();
    const focusedSomeTab = await this.driver.executeScript(_ =>
      window.firstTab === document.activeElement
    );
    expect(focusedSomeTab).to.equal(true);
  });

 it('should focus a tab on click', async function() {
    const lastTab = await this.driver.findElement(By.css('[role=tab]:last-of-type'));
    expect(await lastTab.getAttribute('aria-selected')).to.not.equal('true');
    await lastTab.click();
    expect(await lastTab.getAttribute('aria-selected')).to.equal('true');
  });

  it('should handle elements added after initialization', async function() {
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
    expect(success).to.equal(true);
  });
});
