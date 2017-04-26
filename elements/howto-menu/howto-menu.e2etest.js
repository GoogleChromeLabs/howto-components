const helper = require('../../tools/selenium-helper.js');
const expect = require('chai').expect;
const {Key, By} = require('selenium-webdriver');

describe('howto-menu', function() {
  let success;
  beforeEach(function() {
    return this.driver.get(`${this.address}/howto-menu_demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'howto-menu'));
  });

  it('should focus the first item when opened',
    async function() {
      await this.driver.executeScript(_ => {
        window.menu = document.querySelector('howto-menu');
        window.menu.toggle();
        window.expectedMenuItem = document.querySelector('howto-menuitem');
      });
      success = await this.driver.executeScript(
        _ => document.activeElement === window.expectedMenuItem
      );
      expect(success).to.equal(true);
    }
  );

  it('should focus the next item on [arrow down]',
    async function() {
      await this.driver.executeScript(_ => {
        window.menu = document.querySelector('howto-menu');
        window.menu.toggle();
      });
      await this.driver.actions().sendKeys(Key.ARROW_DOWN).perform();
      success = await this.driver.executeScript(`
        return document.activeElement ===
          document.querySelectorAll('howto-menuitem')[1];
      `);
      expect(success).to.equal(true);
    }
  );

  it('should wrap the focus at the end of menu on [arrow down]',
    async function() {
      await this.driver.executeScript(_ => {
        window.menu = document.querySelector('howto-menu');
        window.menu.toggle();
        const items = document.querySelectorAll('howto-menuitem');
        items[items.length - 1].focus();
      });
      await this.driver.actions().sendKeys(Key.ARROW_DOWN).perform();
      success = await this.driver.executeScript(`
        return document.activeElement ===
          document.querySelector('howto-menuitem');
      `);
      expect(success).to.equal(true);
    }
  );

  it('should focus the previous item on [arrow up]',
    async function() {
      await this.driver.executeScript(_ => {
        window.menu = document.querySelector('howto-menu');
        window.menu.toggle();
        const items = document.querySelectorAll('howto-menuitem');
        items[1].focus();
      });
      await this.driver.actions().sendKeys(Key.ARROW_UP).perform();
      success = await this.driver.executeScript(`
        return document.activeElement ===
          document.querySelector('howto-menuitem');
      `);
      expect(success).to.equal(true);
    }
  );

  it('should wrap the focus at the start of menu on [arrow up]',
    async function() {
      await this.driver.executeScript(_ => {
        window.menu = document.querySelector('howto-menu');
        window.menu.toggle();
      });
      await this.driver.actions().sendKeys(Key.ARROW_UP).perform();
      success = await this.driver.executeScript(`
        const items = document.querySelectorAll('howto-menuitem');
        return document.activeElement === items[items.length - 1];
      `);
      expect(success).to.equal(true);
    }
  );

  it('should focus an item that starts with the [letter key]',
    async function() {
      await this.driver.executeScript(_ => {
        window.menu = document.querySelector('howto-menu');
        window.menu.toggle();
      });
      await this.driver.actions().sendKeys('s').perform();
      success = await this.driver.executeScript(`
        const items = document.querySelectorAll('howto-menuitem');
        return document.activeElement === items[1];
      `);
      expect(success).to.equal(true);
    }
  );

  it('should exit the menu on [ESCAPE]',
    async function() {
      await this.driver.executeScript(_ => {
        window.menu = document.querySelector('howto-menu');
        window.menu.toggle();
      });
      await this.driver.actions().sendKeys(Key.ESCAPE).perform();
      const focusedMenuBtn = await this.driver.executeScript(`
        return document.activeElement === document.querySelector('#menu-btn');
      `);
      expect(focusedMenuBtn).to.equal(true);
      const closedMenu = await this.driver.executeScript(`
        return document.querySelector('howto-menu').getAttribute('aria-hidden') === 'true';
      `);
      //expect(closedMenu).to.equal(true);
    }
  );
});
