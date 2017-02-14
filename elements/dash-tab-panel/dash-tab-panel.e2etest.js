const helper = require('../../tools/selenium-helper.js');
const expect = require('chai').expect;
const Key = require('selenium-webdriver').Key;

describe('dash-tablist', function() {
  beforeEach(function() {
    return this.driver.get(`${this.address}/dash-tab-panel_demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'dash-tablist'));
  });

  it('should focus the next element on [arrow right]', async function() {
    const found =
      await helper.pressKeyUntil(
        this.driver,
        Key.TAB,
        `return document.activeElement.getAttribute('role') === 'tab';`
      );
    expect(found).to.equal(true);

    await this.driver
      .executeScript(`window.firstTab = document.activeElement;`);
    await this.driver.actions().sendKeys(Key.ARROW_RIGHT).perform();
    const rightFocus = await this.driver.executeScript(`
      return window.firstTab !== document.activeElement &&
        !!document.activeElement.getAttribute('role')
    `);
    expect(rightFocus).to.equal(true);
  });
});
