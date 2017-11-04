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
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME:	36,
    LEFT_ARROW:	37,
    UP_ARROW:	38,
    RIGHT_ARROW: 39,
    DOWN_ARROW:	40,
  };

  /**
   * Cloning contents from a &lt;template&gt; element is more performant
   * than using innerHTML because it avoids addtional HTML parse costs.
   */
  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      :host {
        display: inline;
      }
      .slider {
        border: 1px solid;
        border-color: #666666 #888888;
        background-color: #dddddd;
        position: relative;
        width: 10px;
        height: 28px;
        top: -14px;
      }
      .slider:focus, .slider:hover {
        outline: 2px solid #888;
        background-color: #ddeeff;
      }
      .slider-container {
        margin: 2px;
        padding: 1px;
        background-color: #eeeeee;
        border: 1px solid #888888;
        position: relative;
        top: 2em;
        height: 4px;
        width: 300px;
        outline: none;
      }
    </style>
    <div class="slider-container">
      <div class="slider"></div>
      <howto-label for="slider" class="value"></howto-label>
    </div>
  `;

  // HIDE
  // ShadyCSS will rename classes as needed to ensure style scoping.
  ShadyCSS.prepareTemplate(template, 'howto-slider');
  // /HIDE

  class HowToSlider extends HTMLElement {
    static get observedAttributes() {
      return ['value'];
    }
    /**
     * The element's constructor is run anytime a new instance is created.
     * Instances are created either by parsing HTML, calling
     * document.createElement('howto-checkbox'), or calling new HowToCheckbox();
     * The construtor is a good place to create shadow DOM, though you should
     * avoid touching any attributes or light DOM children as they may not
     * be available yet.
     */
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    /**
     * `connectedCallback()` fires when the element is inserted into the DOM.
     * It's a good place to set the initial `role`, `tabindex`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `value` internal state,
     * and install event listeners.
     */
    connectedCallback() {
      // HIDE
      // Shim Shadow DOM styles. This needs to be run in `connectedCallback()`
      // because if you shim Custom Properties (CSS variables) the element
      // will need access to its parent node.
      ShadyCSS.styleElement(this);
      // /HIDE

      if (!this.hasAttribute('role'))
        this.setAttribute('role', 'slider');
      if (!this.hasAttribute('tabindex'))
        this.setAttribute('tabindex', 0);
      if (!this.hasAttribute('aria-valuenow'))
        this.setAttribute('aria-valuenow', 0);
      if (!this.hasAttribute('aria-valuemin'))
        this.setAttribute('aria-valuemin', 0);
      if (!this.hasAttribute('aria-valuemax'))
        this.setAttribute('aria-valuemax', 100);
      if (!this.hasAttribute('value'))
        this.setAttribute('value', 0);

      this.shadowRoot.querySelector('howto-label').innerHTML = this.value;

      // A user may set a property on an _instance_ of an element,
      // before its prototype has been connected to this class.
      // The `_upgradeProperty()` method will check for any instance properties
      // and run them through the proper class setters.
      // See the [lazy properites](/web/fundamentals/architecture/building-components/best-practices#lazy-properties)
      // section for more details.
      // this upgrade property to be added

      this.addEventListener('keyup', this._onKeyUp);
      this.addEventListener('click', this._onClick);
      this.addEventListener('mousedown', this._onMousedown);
    }

    _upgradeProperty(prop) {
      if (this.hasOwnProperty(prop)) {
        let value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    }

    /**
     * `disconnectedCallback()` fires when the element is removed from the DOM.
     * It's a good place to do clean up work like releasing references and
     * removing event listeners.
     */
    disconnectedCallback() {
      this.removeEventListener('keyup', this._onKeyUp);
      this.removeEventListener('click', this._onClick);
      this.removeEventListener('mousedown', this._onMousedown);
      this.removeEventListener('mouseup', this._onMouseup);
      this.removeEventListener('mousemove', this._onMousemove);
    }

    /**
     * Properties and their corresponding attributes should mirror one another.
     * The property setter for `checked` handles truthy/falsy values and
     * reflects those to the state of the attribute. See the [avoid
     * reentrancy](/web/fundamentals/architecture/building-components/best-practices#avoid-reentrancy)
     * section for more details.
     */
    set value(value) {
      this.setAttribute('value', value);
    }

    get value() {
      return parseInt(this.getAttribute('value'));
    }

    get valuemax() {
      return parseInt(this.getAttribute('aria-valuemax'));
    }

    get valuemin() {
      return parseInt(this.getAttribute('aria-valuemin'));
    }

    /**
     * `attributeChangedCallback()` is called when any of the attributes in the
     * `observedAttributes` array are changed. It's a good place to handle
     * side effects, like setting ARIA attributes.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      this.setAttribute(`aria-${name}now`, newValue);
    }

    _onKeyUp(event) {
      // Don’t handle modifier shortcuts typically used by assistive technology.
      if (event.altKey)
        return;

      switch (event.keyCode) {
        case KEYCODE.RIGHT_ARROW:
        case KEYCODE.UP_ARROW:
          event.preventDefault();
          this._increaseValue(1);
          break;
        case KEYCODE.LEFT_ARROW:
        case KEYCODE.DOWN_ARROW:
          event.preventDefault();
          this._decreaseValue(1);
          break;
        case KEYCODE.HOME:
          event.preventDefault();
          this._setMinValue();
          break;
        case KEYCODE.END:
          event.preventDefault();
          this._setMaxValue();
          break;
        case KEYCODE.PAGE_UP:
          event.preventDefault();
          this._increaseValue(10);
          break;
        case KEYCODE.PAGE_DOWN:
          event.preventDefault();
          this._decreaseValue(10);
          break;
        // Any other key press is ignored and passed back to the browser.
        default:
          return;
      }
    }

    _onClick(event) {
      const diffX = event.pageX - this.offsetLeft;
      const containerWidth =
          this.shadowRoot.querySelector('.slider-container').offsetWidth;
      this.value =
          parseInt(((this.valuemax - this.valuemin) * diffX) / containerWidth);
      if (this.value <= this.valuemin) {
        this._setMinValue();
      } else if (this.value >= this.valuemax) {
        this._setMaxValue();
      } else {
        this._changeValue(this.value);
      }
    }

    _onMousedown(event) {
      this.addEventListener('mousemove', this._onMousemove);
      this.addEventListener('mouseup', this._onMouseup);
      event.preventDefault();
      event.stopPropagation();
    }

    _onMousemove(event) {
      this._onClick(event);
      event.preventDefault();
      event.stopPropagation();
    }

    _onMouseup(event) {
      this.removeEventListener('mousemove', this._onMousemove);
      this.removeEventListener('mouseup', this._onMouseup);
      event.preventDefault();
      event.stopPropagation();
    }

    _increaseValue(value) {
      if (this.value + value <= this.valuemax) {
        this._changeValue(this.value+value);
      } else {
        this._setMaxValue();
      }
    }

    _decreaseValue(value) {
      if (this.value - value >= this.valuemin) {
        this._changeValue(this.value-value);
      } else {
        this._setMinValue();
      }
    }

    _setMinValue() {
      this._changeValue(this.valuemin);
    }

    _setMaxValue() {
      this._changeValue(this.valuemax);
    }

    _changePosition() {
      const containerWidth =
        this.shadowRoot.querySelector('.slider-container').offsetWidth;
      const sliderWidth =
        this.shadowRoot.querySelector('.slider').offsetWidth;
      const left =
        Math.round((this.value * containerWidth)
                  / (this.valuemax - this.valuemin)) - (sliderWidth / 2);
      this.shadowRoot.querySelector('.slider').style.left = left + 'px';
    }


    /**
     * `_changeValue(value)` calls the `value` setter and sets its value.
     * Because `_changeValue(value)` is only caused by a user action, it will
     * also dispatch a change event. This event bubbles in order to let the
     * change to its listeners.
     */
    _changeValue(value) {
      this.value = value;
      this._changePosition();
      this.shadowRoot.querySelector('howto-label').innerHTML = this.value;
      this.dispatchEvent(new CustomEvent('change', {
        detail: {
          value: this.value,
        },
        bubbles: true,
      }));
    }
  }

  window.customElements.define('howto-slider', HowToSlider);
})();
