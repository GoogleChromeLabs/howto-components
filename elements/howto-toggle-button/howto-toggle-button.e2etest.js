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

describe('howto-toggle-button', function() {
  let success;

  const findToggleButton = _ => {
    window.expectedToggleButton = document.querySelector('[role=button]');
  };

  const isUnpressed = _ => {
    let isAriaUnpressed =
      !window.expectedToggleButton.hasAttribute('aria-pressed') ||
      window.expectedToggleButton.getAttribute('aria-pressed') === 'false';
    return isAriaUnpressed && window.expectedToggleButton.pressed === false;
  };

  const isPressed = _ => {
    let isAriaPressed = window.expectedToggleButton.getAttribute('aria-pressed') === 'true';
    return isAriaPressed && window.expectedToggleButton.pressed === true;
  };

  beforeEach(function() {
    return this.driver.get(`${this.address}/howto-toggle-button/demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'howto-toggle-button'));
  });

  it('should check the toggle button on [space]', async function() {
    await this.driver.executeScript(findToggleButton);
    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedToggleButton);
    expect(success).to.be.true;
    success = await this.driver.executeScript(isUnpressed);
    expect(success).to.be.true;
    await this.driver.actions().sendKeys(Key.SPACE).perform();
    success = await this.driver.executeScript(isPressed);
    expect(success).to.be.true;
  });

  it('should check the toggle button on [enter]', async function() {
    await this.driver.executeScript(findToggleButton);
    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedToggleButton);
    expect(success).to.be.true;
    success = await this.driver.executeScript(isUnpressed);
    expect(success).to.be.true;
    await this.driver.actions().sendKeys(Key.ENTER).perform();
    success = await this.driver.executeScript(isPressed);
    expect(success).to.be.true;
  });

  it('should not be focusable when [disabled] is true', async function() {
    await this.driver.executeScript(findToggleButton);
    success = await helper.pressKeyUntil(this.driver, Key.TAB, _ => document.activeElement === window.expectedToggleButton);
    expect(success).to.be.true;
    success = await this.driver.executeScript(_ => {
      window.expectedToggleButton.disabled = true;
      return document.activeElement != window.expectedToggleButton;
    });
    expect(success).to.be.true;
  });

  it('should check the toggle button on click', async function() {
    await this.driver.executeScript(findToggleButton);
    success = await this.driver.executeScript(isUnpressed);
    expect(success).to.be.true;
    await this.driver.findElement(By.css('[role=button]')).click();
    success = await this.driver.executeScript(isPressed);
    expect(success).to.be.true;
  });
});

describe('howto-toggle-button pre-upgrade', function() {
  let success;

  beforeEach(function() {
    return this.driver.get(`${this.address}/howto-toggle-button/demo.html?nojs`);
  });

  it('should handle attributes set before upgrade', async function() {
    await this.driver.executeScript(_ => window.expectedToggleButton = document.querySelector('howto-toggle-button'));
    await this.driver.executeScript(_ => window.expectedToggleButton.setAttribute('pressed', ''));

    await this.driver.executeScript(_ => _loadJavaScript());
    await helper.waitForElement(this.driver, 'howto-toggle-button');
    success = await this.driver.executeScript(_ =>
      window.expectedToggleButton.pressed === true &&
      window.expectedToggleButton.getAttribute('aria-pressed') === 'true'
    );
    expect(success).to.be.true;
  });

  it('should handle instance properties set before upgrade', async function() {
    await this.driver.executeScript(_ => window.expectedToggleButton = document.querySelector('howto-toggle-button'));
    await this.driver.executeScript(_ => window.expectedToggleButton.pressed = true);

    await this.driver.executeScript(_ => _loadJavaScript());
    await helper.waitForElement(this.driver, 'howto-toggle-button');
    success = await this.driver.executeScript(_ =>
      window.expectedToggleButton.hasAttribute('pressed') &&
      window.expectedToggleButton.getAttribute('aria-pressed') === 'true'
    );
    expect(success).to.be.true;
  });
});
