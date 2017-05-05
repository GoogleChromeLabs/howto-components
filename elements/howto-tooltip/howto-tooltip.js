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

class HowtoTooltip extends HTMLElement {
  /**
  * The constructor does work that needs to be executed _exactly_ once.
  */
  constructor() {
    super();

    // These functions are used in a bunch of places, and always need to
    // bind the correct `this` reference, so do it once.
    this._show = this._show.bind(this);
    this._hide = this._hide.bind(this);
  }

  /**
   * `connectedCallback` gets the element that triggers the tooltip and
   * sets up the event listeners on it.
   */
  connectedCallback() {
    // A tooltip should always set its `role` to `tooltip`
    this.setAttribute('role', 'tooltip');

    // Tooltips cannot be focused themselves.
    this.tabIndex = -1;

    // 'aria-hidden' is used to show or hide the tooltip. A tooltip should
    // check to see if its `aria-hidden` value has been set by the user.
    // Otherwise, it should use the default value.
    this.setAttribute('aria-hidden', this.getAttribute('aria-hidden') || true);

    // The element that triggers the tooltip references the tooltip
    // element with aria-describedby.
    this._target = document.querySelector('[aria-describedby=' + this.id + ']');

    // The tooltip needs to listen to focus/blur events from the target,
    // as well as hover events over the target.
    this._target.addEventListener('focus', this._show);
    this._target.addEventListener('blur', this._hide);
    this._target.addEventListener('mouseenter', this._show);
    this._target.addEventListener('mouseleave', this._hide);
  }

  /**
   * `disconnectedCallback` unregisters the event listeners that were set up in
   * `connectedCallback`.
   */
  disconnectedCallback() {
    if (!this._target)
      return;

    // Remove the existing listeners, so that they don't trigger even though
    // there's no tooltip to show.
    this._target.removeEventListener('focus', this._show);
    this._target.removeEventListener('blur', this._hide);
    this._target.removeEventListener('mouseenter', this._show);
    this._target.removeEventListener('mouseleave', this._hide);
    this._target = null;
  }

  _show() {
    // If the tooltip is hidden, show it.
    if (this.getAttribute('aria-hidden') === 'true') {
      this.setAttribute('aria-hidden', 'false');
    }
  }

  _hide() {
    // If the tooltip is visible, hide.
    if (this.getAttribute('aria-hidden') === 'false') {
      this.setAttribute('aria-hidden', 'true');
    }
  }
}

window.customElements.define('howto-tooltip', HowtoTooltip);
