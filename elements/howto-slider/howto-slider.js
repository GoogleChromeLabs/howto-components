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
    LEFT:	37,
    UP:	38,
    RIGHT: 39,
    DOWN:	40,
  };

  /**
   * Cloning contents from a &lt;template&gt; element is more performant
   * than using innerHTML because it avoids addtional HTML parse costs.
   */
  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      :host {
        display: inline-block;
      }
      .track {
        box-sizing: border-box;
        position: relative;
        width: 300px;
        height: 5px;
        border: 1px solid #888888;
        background-color: #eeeeee;
        outline: none;
      }
      .thumb {
        box-sizing: border-box;
        border: 1px solid;
        border-color: #666666 #888888;
        background-color: #dddddd;
        position: relative;
        width: 10px;
        height: 28px;
        top: -14px;
      }
      .thumb:focus, .thumb:hover {
        outline: 2px solid #888;
        background-color: #ddeeff;
      }
    </style>
    <div class="track">
      <div class="thumb"></div>
    </div>
  `;

  // HIDE
  // ShadyCSS will rename classes as needed to ensure style scoping.
  ShadyCSS.prepareTemplate(template, 'howto-slider');
  // /HIDE

  class HowToSlider extends HTMLElement {
    static get observedAttributes() {
      return ['min', 'max', 'value'];
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
      this._track = this.shadowRoot.querySelector('.track');
      this._thumb = this.shadowRoot.querySelector('.thumb');

      // Event handlers that are not attached to this element need to be bound
      // if they need access to `this`.
      this._onKeyUp = this._onKeyUp.bind(this);
      this._onClick = this._onClick.bind(this);
      this._onMouseDown = this._onMouseDown.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onMouseUp = this._onMouseUp.bind(this);
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

      // A user may set a property on an _instance_ of an element,
      // before its prototype has been connected to this class.
      // The `_upgradeProperty()` method will check for any instance properties
      // and run them through the proper class setters.
      // See the [lazy properites](/web/fundamentals/architecture/building-components/best-practices#lazy-properties)
      // section for more details.
      // this upgrade property to be added
      this._upgradeProperty('min');
      this._upgradeProperty('max');
      this._upgradeProperty('value');

      // Setup defaults
      if (!this.hasAttribute('role'))
        this.setAttribute('role', 'slider');
      if (!this.hasAttribute('tabindex'))
        this.setAttribute('tabindex', 0);
      if (!this.hasAttribute('min'))
        this.min = 0;
      if (!this.hasAttribute('max'))
        this.max = 100;
      if (!this.hasAttribute('value'))
        this.value = 50;

      this.addEventListener('keyup', this._onKeyUp);
      this.addEventListener('click', this._onClick);
      this._thumb.addEventListener('mousedown', this._onMouseDown);
    }

    _upgradeProperty(prop) {
      if (this.hasOwnProperty(prop)) {
        let value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    }

    /**
     * Properties and their corresponding attributes should mirror one another.
     * See the [avoid
     * reentrancy](/web/fundamentals/architecture/building-components/best-practices#avoid-reentrancy)
     * section for more details.
     */
    /**
     * The setter for value will clamp the value so it falls within the min/max
     * range.
     */
    set value(value) {
      let newValue = value;

      if (newValue > this.max) {
        newValue = this.max;
      }

      if (newValue < this.min) {
        newValue = this.min;
      }

      this.setAttribute('value', newValue);
    }

    get value() {
      return parseInt(this.getAttribute('value'), 10);
    }

    set min(value) {
      this.setAttribute('min', value);
    }

    get min() {
      return parseInt(this.getAttribute('min'), 10);
    }

    set max(value) {
      this.setAttribute('max', value);
    }

    get max() {
      return parseInt(this.getAttribute('max'), 10);
    }

    /**
     * `attributeChangedCallback()` is called when any of the attributes in the
     * `observedAttributes` array are changed. It's a good place to handle
     * side effects, like setting ARIA attributes.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      switch (name) {
        case 'value':
          this.setAttribute('aria-valuenow', newValue);
          this._moveThumbTo(newValue);
          break;
        case 'min':
          this.setAttribute('aria-valuemin', newValue);
          if (this.value)
            this.value = this.value;
          break;
        case 'max':
          this.setAttribute('aria-valuemax', newValue);
          if (this.value)
            this.value = this.value;
          break;
        default:
          break;
      }
    }

    _onKeyUp(event) {
      // Don’t handle modifier shortcuts typically used by assistive technology.
      if (event.altKey)
        return;

      switch (event.keyCode) {
        case KEYCODE.RIGHT:
        case KEYCODE.UP:
          event.preventDefault();
          this._increaseValue(1);
          break;
        case KEYCODE.LEFT:
        case KEYCODE.DOWN:
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

    _increaseValue(value) {
      this.value = this.value + value;
    }

    _decreaseValue(value) {
      this.value = this.value - value;
    }

    _setMinValue() {
      this.value = this.min;
    }

    _setMaxValue() {
      this.value = this.max;
    }

    _onClick(event) {
      const trackWidth = this._track.offsetWidth;
      const trackLeft = this._track.offsetLeft;
      const deltaX = event.pageX - trackLeft;
      this.value =
        parseInt(
        (((this.max - this.min) * deltaX) / trackWidth) + this.min
        , 10);

      this.dispatchEvent(new CustomEvent('change', {
        detail: {
          value: this.value,
        },
        bubbles: true,
      }));

      event.preventDefault();
      event.stopPropagation();
    }

    _onMouseDown(event) {
      // Add listeners to the document so the user can continue
      // dragging the thumb even if they move the pointer outside
      // of the bounds of the element.
      document.addEventListener('mousemove', this._onMouseMove);
      document.addEventListener('mouseup', this._onMouseUp);
      this._thumb.focus();
      event.preventDefault();
      event.stopPropagation();
    }

    _onMouseMove(event) {
      this._onClick(event);
    }

    _onMouseUp(event) {
      document.removeEventListener('mousemove', this._onMouseMove);
      document.removeEventListener('mouseup', this._onMouseUp);
      event.preventDefault();
      event.stopPropagation();
    }

    _moveThumbTo(value) {
      const trackWidth = this._track.offsetWidth;
      const thumbWidth = this._thumb.offsetWidth;
      // Percentage(value, min, max) = (value − min) / (max − min);
      const percent = (value - this.min) / (this.max - this.min);
      const pos = trackWidth * percent - thumbWidth / 2;
      this._thumb.style.left = `${pos}px`;
    }
  }

  window.customElements.define('howto-slider', HowToSlider);
})();
