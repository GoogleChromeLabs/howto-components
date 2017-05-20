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
module.exports = {
  /**
   * `pressKeyUntil` sends a key presses to the page until the script
   * evaluates to true. A maximum of `maxPresses` key presses will be sent.
   * @returns a promise that resolves to `true` if the condition was met.
   * `false` otherwise.
   */
  pressKeyUntil: async (driver, key, script, maxPresses = 100) => {
    // Tab through the page until the focused element matches selector.
    let found = false;
    for(let i = 0; i < maxPresses; i++) {
      found = await driver.executeScript(script);
      if (found)
        break;
      // Press tab to advance to next element.
      await driver.actions()
        .sendKeys(key)
        .perform();
    }
    return found;
  },
  /**
   * `waitForElement` waits for the browser to load the definition of the custom
   * element with the name `elementName`.
   * @returns a promise that resolves when the element has been defined.
   */
  waitForElement: async (driver, elementName) => {
    return driver.executeAsyncScript(`
      const cb = arguments[arguments.length - 1];
      customElements.whenDefined('${elementName}')
        .then(_ => cb());
    `);
  },

  /**
   * Wait for a set amount of milliseconds.
   * @returns a promise that resolves after the given amount of time.
   */
  sleep: ms => new Promise(resolve => setTimeout(resolve, ms))
};
