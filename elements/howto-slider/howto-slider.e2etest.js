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
const {Key} = require('selenium-webdriver');

describe('howto-slider', function() {
  let success;
  let value;
  const findSlider = _ => {
    window.expectedSlider = document.querySelector('[role=slider]');
    return window.expectedSlider;
  };

  const initialize = value => {
    window.expectedSlider.setAttribute('aria-valuenow', `${value}`);
    window.expectedSlider.value = value;
    return window.expectedSlider.getAttribute('aria-valuenow') === `${value}`;
  };

  const isInitialized = _ => {
    let isAriaValuenow = window.expectedSlider.getAttribute('aria-valuenow') === '0';
    return isAriaValuenow && window.expectedSlider.value === 0;
  };

  const isChanged = value => {
    let isAriaValuenow = window.expectedSlider.getAttribute('aria-valuenow') === `${value}`;
    return isAriaValuenow && window.expectedSlider.value === value;
  };

  beforeEach(function() {
    value = 0;
    return this.driver.get(`${this.address}/howto-slider/demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'howto-slider'));
  });

  it('should increase the value by 1 on [arrow-up]', async function() {
    await this.driver.executeScript(findSlider);
    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedSlider);
    expect(success).to.be.true;
    success = await this.driver.executeScript(isInitialized);
    expect(success).to.be.true;
    await this.driver.actions().sendKeys(Key.ARROW_UP).perform();
    success = await this.driver.executeScript(isChanged, value+1);
    expect(success).to.be.true;
  });

  it('should increase the value by 1 on [arrow-right]', async function() {
    await this.driver.executeScript(findSlider);
    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedSlider);
    expect(success).to.be.true;
    success = await this.driver.executeScript(isInitialized);
    expect(success).to.be.true;
    await this.driver.actions().sendKeys(Key.ARROW_RIGHT).perform();
    success = await this.driver.executeScript(isChanged, value+1);
    expect(success).to.be.true;
  });

  it('should increase the value by 10 on [page-up]', async function() {
    await this.driver.executeScript(findSlider);
    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedSlider);
    expect(success).to.be.true;
    success = await this.driver.executeScript(isInitialized);
    expect(success).to.be.true;
    await this.driver.actions().sendKeys(Key.PAGE_UP).perform();
    success = await this.driver.executeScript(isChanged, value+10);
    expect(success).to.be.true;
  });

  it('should decrease the value by 1 on [arrow-left]', async function() {
    await this.driver.executeScript(findSlider);
    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedSlider);
    expect(success).to.be.true;
    value = 10;
    success = await this.driver.executeScript(initialize, value);
    expect(success).to.be.true;
    await this.driver.actions().sendKeys(Key.ARROW_LEFT).perform();
    success = await this.driver.executeScript(isChanged, value-1);
    expect(success).to.be.true;
  });

  it('should decrease the value by 1 on [arrow-down]', async function() {
    await this.driver.executeScript(findSlider);
    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedSlider);
    expect(success).to.be.true;
    value = 10;
    success = await this.driver.executeScript(initialize, value);
    expect(success).to.be.true;
    await this.driver.actions().sendKeys(Key.ARROW_DOWN).perform();
    success = await this.driver.executeScript(isChanged, value-1);
    expect(success).to.be.true;
  });

  it('should decrease the value by 10 on [page-down]', async function() {
    await this.driver.executeScript(findSlider);
    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedSlider);
    expect(success).to.be.true;
    value = 50;
    success = await this.driver.executeScript(initialize, value);
    expect(success).to.be.true;
    await this.driver.actions().sendKeys(Key.PAGE_DOWN).perform();
    success = await this.driver.executeScript(isChanged, value-10);
    expect(success).to.be.true;
  });

  it('should set the value to minimum on [home]', async function() {
    await this.driver.executeScript(findSlider);
    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedSlider);
    expect(success).to.be.true;
    value = 99;
    success = await this.driver.executeScript(initialize, value);
    expect(success).to.be.true;
    await this.driver.actions().sendKeys(Key.HOME).perform();
    success = await this.driver.executeScript(isChanged, 0);
    expect(success).to.be.true;
  });

  it('should set the value to maximum on [end]', async function() {
    await this.driver.executeScript(findSlider);
    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedSlider);
    expect(success).to.be.true;
    value = 10;
    success = await this.driver.executeScript(initialize, value);
    expect(success).to.be.true;
    await this.driver.actions().sendKeys(Key.END).perform();
    success = await this.driver.executeScript(isChanged, 100);
    expect(success).to.be.true;
  });

  it('should set the value on mousemove', async function() {
    const slider = await this.driver.executeScript(findSlider);
    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedSlider);
    expect(success).to.be.true;
    value = 10;
    success = await this.driver.executeScript(initialize, value);
    expect(success).to.be.true;
    await this.driver.actions().mouseDown(slider).perform();
    await this.driver.actions().mouseMove(slider, {x: 100, y: 0}).perform();
    await this.driver.actions().mouseUp(slider).perform();
    success = await this.driver.executeScript(isChanged, 100);
    expect(success).to.be.true;
  });
});

describe('howto-slider pre-upgrade', function() {
  let success;

  beforeEach(function() {
    return this.driver.get(`${this.address}/howto-slider/demo.html?nojs`);
  });

  it('should handle attributes set before upgrade', async function() {
    await this.driver.executeScript(_ => window.expectedSlider = document.querySelector('howto-slider'));
    await this.driver.executeScript(_ => window.expectedSlider.setAttribute('value', 0));

    await this.driver.executeScript(_ => _loadJavaScript());
    await helper.waitForElement(this.driver, 'howto-slider');
    success = await this.driver.executeScript(_ =>
      window.expectedSlider.value === 0 &&
      window.expectedSlider.getAttribute('aria-valuenow') === '0'
    );
    expect(success).to.be.true;
  });

  it('should handle instance properties set before upgrade', async function() {
    await this.driver.executeScript(_ => window.expectedSlider = document.querySelector('howto-slider'));
    await this.driver.executeScript(_ => window.expectedSlider.value = 0);

    await this.driver.executeScript(_ => _loadJavaScript());
    await helper.waitForElement(this.driver, 'howto-slider');
    success = await this.driver.executeScript(_ =>
      window.expectedSlider.hasAttribute('value') &&
      window.expectedSlider.hasAttribute('aria-valuenow') &&
      window.expectedSlider.getAttribute('aria-valuenow') === '0'
    );
    expect(success).to.be.true;
  });
});

