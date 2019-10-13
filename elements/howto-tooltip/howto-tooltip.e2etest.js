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
/* eslint max-len: ["o9"]
"] */

const helper = require('../../tools/selenium-helper.js');
const expect = require('chai').expect;
// const {Key, By} = require('selenium-webdriver');

describe('howto-tooltip', function() {
  beforeEach(function() {
    return this.driver.get(`${this.address}/howto-tooltip/demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'howto-tooltip'));
  });

  it('should have role \'tooltip\'', async function() {
    success = await this.driver.executeScript(_ => {
      window.tooltip = document.querySelector('howto-tooltip');
      return tooltip.getAttribute('role') === 'tooltip';
    });
    expect(success).to.be.true;
  });
});
