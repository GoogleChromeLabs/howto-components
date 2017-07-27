/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint max-len: ["off"] */

const helper = require('../../tools/selenium-helper.js');
const expect = require('chai').expect;
const {Key, By} = require('selenium-webdriver');

describe('howto-menu', function() {
  let success;
  beforeEach(function() {
    return this.driver.get(`${this.address}/howto-menu/demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'howto-menu'));
  });

  const findMenu = _ => {
    window.expectedMenu = document.querySelector('howto-menu');
  };

  const isUnopened = _ => {
    return !window.expectedMenu.opened && !window.expectedMenu.hasAttribute('opened');
  };

  const isOpened = _ => {
    return window.expectedMenu.opened && window.expectedMenu.hasAttribute('opened');
  };

  it('should focus the first item when opened',
    async function() {
      await this.driver.executeScript(findMenu);
      success = await this.driver.executeScript(isUnopened);
      expect(success).to.be.true;
      await this.driver.executeScript( _ => window.expectedMenu.opened = true);
      success = await this.driver.executeScript(isOpened);
      expect(success).to.be.true;
      success = await this.driver.executeScript(_ => {
        return document.activeElement === window.expectedMenu.querySelector('[role="menuitem"]');
      });
      expect(success).to.be.true;
    }
  );

  it('should focus the next item on [arrow down]',
    async function() {
      await this.driver.executeScript(findMenu);
      await this.driver.executeScript( _ => window.expectedMenu.opened = true);
      await this.driver.actions().sendKeys(Key.ARROW_DOWN).perform();
      success = await this.driver.executeScript(`
        return document.activeElement ===
          document.querySelectorAll('[role="menuitem"]')[1];
      `);
      expect(success).to.equal(true);
    }
  );

  it('should wrap the focus at the end of menu on [arrow down]',
    async function() {
      await this.driver.executeScript(findMenu);
      await this.driver.executeScript( _ => window.expectedMenu.opened = true);
      await this.driver.findElement(By.css('[role=menuitem]:last-of-type')).click();
      await this.driver.actions().sendKeys(Key.ARROW_DOWN).perform();
      success = await this.driver.executeScript(`
        return document.activeElement ===
          document.querySelectorAll('[role="menuitem"]')[0];
      `);
      expect(success).to.equal(true);
    }
  );

  it('should focus the previous item on [arrow up]',
    async function() {
      await this.driver.executeScript(findMenu);
      await this.driver.executeScript( _ => window.expectedMenu.opened = true);
      await this.driver.findElement(By.css('[role=menuitem]:last-of-type')).click();
      await this.driver.actions().sendKeys(Key.ARROW_UP).perform();
      success = await this.driver.executeScript(`
        var items = document.querySelectorAll('[role="menuitem"]');
        return document.activeElement === items[items.length - 2];
      `);
      expect(success).to.equal(true);
    }
  );

  it('should wrap the focus at the start of menu on [arrow up]',
    async function() {
      await this.driver.executeScript(findMenu);
      await this.driver.executeScript( _ => window.expectedMenu.opened = true);
      await this.driver.findElement(By.css('[role=menuitem]')).click();
      await this.driver.actions().sendKeys(Key.ARROW_UP).perform();
      success = await this.driver.executeScript(`
        const items = document.querySelectorAll('[role="menuitem"]');
        return document.activeElement === items[items.length - 1];
      `);
      expect(success).to.equal(true);
    }
  );

  it('should focus an item that starts with the [letter key]',
    async function() {
      await this.driver.executeScript(findMenu);
      await this.driver.executeScript( _ => window.expectedMenu.opened = true);
      await this.driver.actions().sendKeys('s').perform();
      success = await this.driver.executeScript(`
        const items = document.querySelectorAll('[role="menuitem"]');
        return document.activeElement === items[1];
      `);
      expect(success).to.equal(true);
    }
  );

  it('should exit the menu on [ESCAPE]',
    async function() {
      await this.driver.executeScript(findMenu);
      await this.driver.executeScript( _ => window.expectedMenu.opened = true);
      await this.driver.actions().sendKeys(Key.ESCAPE).perform();
      success = await this.driver.executeScript(isUnopened);
      expect(success).to.be.true;
    }
  );

  it('should exit the menu on [TAB]',
    async function() {
      await this.driver.executeScript(findMenu);
      await this.driver.executeScript( _ => window.expectedMenu.opened = true);
      await this.driver.actions().sendKeys(Key.TAB).perform();
      success = await this.driver.executeScript(isUnopened);
      expect(success).to.be.true;
    }
  );
});
