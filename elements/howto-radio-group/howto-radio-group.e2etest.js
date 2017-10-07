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

describe('howto-radio-group', function() {
  let success;
  beforeEach(function() {
    return this.driver.get(`${this.address}/howto-radio-group/demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'howto-radio-group'));
  });

  it('should handle spacebar', async function() {
    await this.driver.executeScript(_ => {
      window.expectedFirstRadio = document.querySelector('howto-radio-button:nth-of-type(1)');
    });

    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedFirstRadio);
    expect(success).to.be.true;

    await this.driver.actions().sendKeys(Key.SPACE).perform();
    success = await this.driver.executeScript(_ => window.expectedFirstRadio.getAttribute('aria-checked') === 'true');
    expect(success).to.be.true;
  });

  it('should handle arrow keys', async function() {
    await this.driver.executeScript(_ => {
      window.expectedFirstRadio = document.querySelector('howto-radio-button:nth-of-type(1)');
      window.expectedSecondRadio = document.querySelector('howto-radio-button:nth-of-type(2)');
    });

    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedFirstRadio);
    expect(success).to.be.true;

    await this.driver.actions().sendKeys(Key.ARROW_RIGHT).perform();
    success = await this.driver.executeScript(_ => document.activeElement === window.expectedSecondRadio);
    expect(success).to.be.true;

    await this.driver.actions().sendKeys(Key.ARROW_LEFT).perform();
    success = await this.driver.executeScript(_ => document.activeElement === window.expectedFirstRadio);
    expect(success).to.be.true;

    await this.driver.actions().sendKeys(Key.ARROW_DOWN).perform();
    success = await this.driver.executeScript(_ => document.activeElement === window.expectedSecondRadio);
    expect(success).to.be.true;

    await this.driver.actions().sendKeys(Key.ARROW_UP).perform();
    success = await this.driver.executeScript(_ => document.activeElement === window.expectedFirstRadio);
    expect(success).to.be.true;
  });

  it('should wrap focus', async function() {
    await this.driver.executeScript(_ => {
      window.expectedFirstRadio = document.querySelector('howto-radio-button:first-of-type');
      window.expectedLastRadio = document.querySelector('howto-radio-button:last-of-type');
    });

    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedFirstRadio);
    expect(success).to.be.true;

    await this.driver.actions().sendKeys(Key.ARROW_UP).perform();
    success = await this.driver.executeScript(_ => document.activeElement === window.expectedLastRadio);
    expect(success).to.be.true;

    await this.driver.actions().sendKeys(Key.ARROW_DOWN).perform();
    success = await this.driver.executeScript(_ => document.activeElement === window.expectedFirstRadio);
    expect(success).to.be.true;
  });

  it('should focus the last radio on [end]', async function() {
    await this.driver.executeScript(_ => {
      window.expectedFirstRadio = document.querySelector('howto-radio-button:first-of-type');
      window.expectedLastRadio = document.querySelector('howto-radio-button:last-of-type');
    });

    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedFirstRadio);
    expect(success).to.be.true;
    await this.driver.actions().sendKeys(Key.END).perform();
    success = await this.driver.executeScript(_ => document.activeElement === window.expectedLastRadio);
    expect(success).to.be.true;
  });

  it('should focus the first radio on [home]', async function() {
    await this.driver.executeScript(_ => {
      window.expectedFirstRadio = document.querySelector('howto-radio-button:first-of-type');
      window.expectedLastRadio = document.querySelector('howto-radio-button:last-of-type');
    });

    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedFirstRadio);
    expect(success).to.be.true;
    await this.driver.actions().sendKeys(Key.ARROW_LEFT).perform();
    await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedLastRadio);
    expect(success).to.be.true;
    await this.driver.actions().sendKeys(Key.HOME).perform();
    success = await this.driver.executeScript(_ => document.activeElement === window.expectedFirstRadio);
    expect(success).to.be.true;
  });

  it('should mark the selected element as aria-checked=true', async function() {
    await this.driver.executeScript(_ => {
      window.expectedFirstRadio = document.querySelector('howto-radio-button:nth-of-type(1)');
      window.expectedSecondRadio = document.querySelector('howto-radio-button:nth-of-type(2)');
    });

    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedFirstRadio);
    expect(success).to.be.true;

    await this.driver.actions().sendKeys(Key.ARROW_RIGHT).perform();
    success = await this.driver.executeScript(_ => window.expectedSecondRadio.getAttribute('aria-checked') === 'true');
    expect(success).to.be.true;
  });

  it('should return focus to the checked element', async function() {
    await this.driver.executeScript(_ => {
      window.expectedFirstRadio = document.querySelector('howto-radio-button:nth-of-type(1)');
      window.expectedSecondRadio = document.querySelector('howto-radio-button:nth-of-type(2)');
    });

    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedFirstRadio);
    expect(success).to.be.true;

    await this.driver.actions().sendKeys(Key.ARROW_RIGHT).perform();
    // Hold SHIFT, then press TAB
    // Note, Selenium will hold the SHIFT modifier key down till the next
    // time it encounters it
    await this.driver.actions().sendKeys(Key.SHIFT, Key.TAB).perform();
    // Release SHIFT, then press TAB
    await this.driver.actions().sendKeys(Key.SHIFT, Key.TAB).perform();
    success = await this.driver.executeScript(_ => document.activeElement === window.expectedSecondRadio);
    expect(success).to.be.true;
  });

  it('should focus and select a radio on click', async function() {
    const secondRadio = await this.driver.findElement(By.css('howto-radio-button:nth-of-type(2)'));
    await secondRadio.click();
    expect(await secondRadio.getAttribute('aria-checked')).to.equal('true');
    expect(await secondRadio.getAttribute('tabindex')).to.equal('0');
  });
});
