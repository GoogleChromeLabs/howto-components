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

window.howtoComponents = {};

/**
 * `waitForElement` waits for the browser to load the definition of the custom
 * element with the name `elementName`.
 * @returns a promise that resolves when the element has been defined.
 */
window.howtoComponents.waitForElement = function(elementName) {
  return customElements.whenDefined(elementName);
};

/**
 * `before` is a wrapper for Mocha’s before() function and adds a “testing area”
 * to the DOM. The element is accessible inside test function via
 * `this.container`. The container can be used to inject markup for the
 * custom element that is supposed to be tested.
 */
window.howtoComponents.before = function(f) {
  return function() {
    this.container = document.createElement('div');
    document.body.appendChild(this.container);
    f && f.call(this);
  };
};

/**
 * `after` cleans up the “testing area” added by `before()`.
 */
window.howtoComponents.after = function(f) {
  return function() {
    this.container.remove();
    this.container = null;
    f && f.call(this);
  };

};

/**
 * `isHidden` returns true if an element is hidden, taken both the `hidden`
 * and `aria-hidden` attribute into account.
 */
window.howtoComponents.isHidden = function(elem) {
  return elem.hidden ||
    (elem.getAttribute('aria-hidden') || '').toLowerCase() === 'true';
};
