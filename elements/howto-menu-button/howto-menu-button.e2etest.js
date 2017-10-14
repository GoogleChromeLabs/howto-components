const helper = require('../../tools/selenium-helper.js');
const expect = require('chai').expect;
const {Key} = require('selenium-webdriver');

describe('howto-menu-button', function() {
  let success;
  let driver;
  beforeEach(function() {
    driver = this.driver;
    return this.driver.get(`${this.address}/howto-menu-button/demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'howto-menu-button'));
  });

  function _focusMenuBtn() {
    return driver.executeScript(_ => {
      window.menuBtn = document.querySelector('howto-menu-button');
      window.menuBtn.focus();
    });
  }

  async function _assessFirstItemFocused() {
    success = await driver.executeScript(`
      return document.activeElement ===
        document.querySelector('[role="menuitem"]');
    `);
    expect(success).to.equal(true);
  }

  async function _assessMenuOpened() {
    success = await driver.executeScript(`
      const menu = document.querySelector('[aria-labelledby="menu-btn"]');
      return menu.getAttribute('aria-hidden') === 'false';
    `);
    expect(success).to.equal(true);
  }

  let tests = [
    {key: 'ARROW_DOWN'},
    {key: 'ENTER'},
    {key: 'SPACE'},
  ];

  tests.forEach(function(test) {
    it('should open the menu on [' + test.key + ']',
      async function() {
        await _focusMenuBtn();
        await this.driver.actions().sendKeys(Key[test.key]).perform();
        await _assessMenuOpened();
      }
    );
  });

  tests.forEach(function(test) {
    it('should focus the first menu item on [' + test.key + ']',
      async function() {
        await _focusMenuBtn();
        await this.driver.actions().sendKeys(Key[test.key]).perform();
        await _assessFirstItemFocused();
      }
    );
  });
});
