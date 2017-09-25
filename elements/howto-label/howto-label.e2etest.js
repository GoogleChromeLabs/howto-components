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
const {By} = require('selenium-webdriver');

describe('howto-label', function() {
  let success;

  beforeEach(function() {
    return this.driver.get(`${this.address}/howto-label/demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'howto-label'));
  });

  it('should focus the target on click', async function() {
    await this.driver.findElement(By.css('[for=foo]')).click();
    success = await this.driver.executeScript(function() {
      let activeElement = document.activeElement;
      return activeElement === document.querySelector('#foo');
    });
    expect(success).to.be.true;
  });
});
