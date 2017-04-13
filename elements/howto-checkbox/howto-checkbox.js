/**
 * A `HowToCheckbox` represents a boolean option in a form. The most common type
 * of checkbox is a dual-type which allows the user to toggle between two
 * choices -- checked and unchecked.
 */
(function() {
  /**
   * Define key codes to help with handling keyboard events.
   */
  const KEYCODE = {
    SPACE: 32,
  };

  /**
   * The `HowToCheckbox` exposes a single `checked` attribute/property for
   * toggling its state. Changes to the `checked` property will also be
   * reflected to an `aria-checked` attribute. Similarly, the `disabled`
   * property is reflected to an `aria-disabled` attribute. This controls
   * whether the element is operable or not.
   */
  class HowToCheckbox extends HTMLElement {
    static get observedAttributes() {
      return ['checked', 'disabled'];
    }

    /**
     * `connectedCallback` sets the initial `role` and `tabindex` and installs
     * event listeners.
     */
    connectedCallback() {
      if (!this.hasAttribute('role'))
        this.setAttribute('role', 'checkbox');
      if (!this.hasAttribute('tabindex'))
        this.setAttribute('tabindex', 0);

      this._checked = false;
      this._disabled = false;

      this.addEventListener('keydown', this._onKeyDown);
      this.addEventListener('click', this._onClick);
    }

    _onKeyDown(event) {
      // Don’t handle modifier shortcuts typically used by assistive technology.
      if (event.altKey) return;

      switch (event.keyCode) {
        case KEYCODE.SPACE:
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
     * `_toggleChecked` calls the checked setter and flips its state.
     * Because `_toggleChecked` is only caused by a user action, it will
     * also dispatch a state change event.
     */
    _toggleChecked() {
      if (this.disabled) return;
      this.checked = !this.checked;
      this.dispatchEvent(new CustomEvent('change', {
        detail: {
          checked: this.checked,
        },
        bubbles: false,
      }));
    }

    /**
     * `attributeChangedCallback` watches for changes to the `checked`
     * and `disabled` attributes and reflects their states to the corresponding
     * ARIA attributes. It will be called at startup time if either attribute
     * has been set. Because both `checked` and `disabled` are booleans, the
     * callback determines their values by checking to see if they are present.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      const value = this.hasAttribute(name);
      if (this[name] !== value) this[name] = value;
    }

    /**
     * The `checked` property reflects its state to the `checked`
     * attribute.
     */
    set checked(isChecked) {
      if (this._checked === isChecked) return;
      this._checked = isChecked;
      if (isChecked) {
        this.setAttribute('checked', '');
      } else {
        this.removeAttribute('checked');
      }
      this.setAttribute('aria-checked', isChecked);
    }

    /**
     * The `checked` getter just returns the current `checked` attribute state.
     * This means setting the checked attribute will immediately set the value
     * of the underlying property.
     */
    get checked() {
      return this._checked;
    }

    /**
     * The `disabled` property reflects its state to the `disabled`
     * attribute. A disabled checkbox will be visible, but no longer operable.
     */
    set disabled(isDisabled) {
      if (this._disabled === isDisabled) return;
      this._disabled = isDisabled;
      if (isDisabled) {
        this.setAttribute('disabled', '');
        this.removeAttribute('tabindex');
      } else {
        this.removeAttribute('disabled');
        this.setAttribute('tabindex', '0');
      }
      this.setAttribute('aria-disabled', isDisabled);
    }

    /**
     * The `disabled` getter just returns the current `disabled` state.
     */
    get disabled() {
      return this._disabled;
    }
  }

  window.customElements.define('howto-checkbox', HowToCheckbox);
})();


