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
(function() {
  /**
   * Define key codes to help with handling keyboard events.
   */
  const KEYCODE = {
    SPACE: 32,
  };

  /**
   * The `HowToCheckbox` exposes a `checked` attribute/property for
   * toggling its state. Changes to the `checked` property will also be
   * reflected to an `aria-checked` attribute. Similarly, the `disabled`
   * property/attribute is reflected to an `aria-disabled` attribute. Although
   * native checkbox elements also provide a `value` property, because it is
   * only used for `<form>` submissions, and this element can't take part in
   * that process, it has been omitted.
   */
  class HowToCheckbox extends HTMLElement {
    static get observedAttributes() {
      return ['checked', 'disabled'];
    }

    /**
     * `connectedCallback` sets the initial `role`, `tabindex`,
     * internal state, and installs event listeners.
     */
    connectedCallback() {
      if (!this.hasAttribute('role'))
        this.setAttribute('role', 'checkbox');
      if (!this.hasAttribute('tabindex'))
        this.setAttribute('tabindex', 0);

      // A user may set a property on an _instance_ of an element,
      // before its prototype has been connected to this class.
      // The `upgradeProperty` method will check for any instance properties
      // and run them through the proper class setters.
      this.upgradeProperty('checked');
      this.upgradeProperty('disabled');

      this.addEventListener('keydown', this._onKeyDown);
      this.addEventListener('click', this._onClick);
    }

    /**
     * Check if a property has an instance value. If so, copy the value, and
     * delete the instance property so it doesn't shadow the class property
     * setter. Finally, pass the value to the class property setter so it can
     * trigger any side effects.
     * This is to safe guard against cases where, for instance, a framework
     * may have added the element to the page and set a value on one of its
     * properties, but lazy loaded its definition. Without this guard, the
     * upgraded element would miss that property and the instance property
     * would prevent the class property setter from ever being called.
     */
    upgradeProperty(prop) {
      if (this.hasOwnProperty(prop)) {
        let value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    }

    /**
     * `disconnectedCallback` fires whenever the element is removed from
     * the DOM. It's a good place to do clean up work like releasing
     * references and removing event listeners.
     */
    disconnectedCallback() {
      this.removeEventListener('keydown', this._onKeyDown);
      this.removeEventListener('click', this._onClick);
    }

    /**
     * Properties and their corresponding attributes should mirror one another.
     * To this effect, the property setter for `checked` handles truthy/falsy
     * values and reflects those to the state of the attribute.
     * It's important to note that there are no side effects taking place in
     * the property setter. For example, the setter does not set
     * `aria-checked`.
     * Instead, that work happens in the `attributeChangedCallback`.
     * As a general rule, make property setters very dumb, and if setting a
     * property or attribute should cause a side effect (like setting a
     * corresponding ARIA attribute) do that work in the
     * `attributeChangedCallback`. This will avoid having to manage complex
     * attribute/property reentrancy scenarios.
     */
    set checked(value) {
      const isChecked = Boolean(value);
      if (isChecked)
        this.setAttribute('checked', '');
      else
        this.removeAttribute('checked');
    }

    get checked() {
      return this.hasAttribute('checked');
    }

    set disabled(value) {
      const isDisabled = Boolean(value);
      if (isDisabled)
        this.setAttribute('disabled', '');
      else
        this.removeAttribute('disabled');
    }

    get disabled() {
      return this.hasAttribute('disabled');
    }

    /**
     * `attributeChangedCallback` watches for changes to the `checked` and
     * `disabled` attributes and reflects their states to the corresponding
     * properties and ARIA attributes. It will be called at startup time if
     * either attribute has been set.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      const hasValue = newValue !== null;
      switch (name) {
        case 'checked':
          this.setAttribute('aria-checked', hasValue);
          break;
        case 'disabled':
          this.setAttribute('aria-disabled', hasValue);
          // The `tabindex` attribute does not provide a way to fully remove
          // focusability from an element.
          // Elements with `tabindex=-1` can still be focused with
          // a mouse or by calling `focus()`.
          // To make sure an element is disabled and not focusable, remove the
          // `tabindex` attribute.
          if (hasValue) {
            this.removeAttribute('tabindex');
            // If the focus is currently on this element, unfocus it by
            // calling the `HTMLElement.blur()` method.
            if (document.activeElement === this)
              this.blur();
          } else {
            this.setAttribute('tabindex', '0');
          }
          break;
      }
    }

    _onKeyDown(event) {
      // Don’t handle modifier shortcuts typically used by assistive technology.
      if (event.altKey)
        return;

      switch (event.keyCode) {
        case KEYCODE.SPACE:
          event.preventDefault();
          this._toggleChecked();
          break;
        // Any other key press is ignored and passed back to the browser.
        default:
          return;
      }
    }

    _onClick(event) {
      this._toggleChecked();
    }

    /**
     * `_toggleChecked` calls the `checked` setter and flips its state.
     * Because `_toggleChecked` is only caused by a user action, it will
     * also dispatch a change event. This event bubbles in order to mimic
     * the native behavior of `<input type=checkbox>`.
     */
    _toggleChecked() {
      if (this.disabled)
        return;
      this.checked = !this.checked;
      this.dispatchEvent(new CustomEvent('change', {
        detail: {
          checked: this.checked,
        },
        bubbles: true,
      }));
    }
  }

  window.customElements.define('howto-checkbox', HowToCheckbox);
})();


