/**
 * A `DashCheckbox` represents a boolean option in a form. The most common type
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
   * The `DashCheckbox` exposes a single `checked` attribute/property for
   * toggling its state. Changes to the `checked` property will also be
   * reflected to an `aria-checked` attribute.
   */
  class DashCheckbox extends HTMLElement {
    static get observedAttributes() {
      return ['checked', 'disabled'];
    }

    /**
     * `connectedCallback` sets the initial role and checks to see if the
     * user has predefined an `aria-checked` state or `tabindex`.
     */
    connectedCallback() {
      if (!this.hasAttribute('role'))
        this.setAttribute('role', 'checkbox');
      if (!this.hasAttribute('aria-checked'))
        this.checked = false;
      if (!this.hasAttribute('tabindex'))
        this.setAttribute('tabindex', 0);

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
      this.dispatchEvent(new CustomEvent('checked-changed', {
        detail: {
          checked: this.checked,
        },
        bubbles: false,
      }));
    }

    /**
     * `attributeChangedCallback` watches for changes to the `checked`
     * and `disabled` attributes and reflects those to the underlying
     * properties.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      this[name] = this.hasAttribute(name);
    }

    /**
     * The `checked` property reflects its state to the `aria-checked`
     * attribute.
     */
    set checked(isChecked) {
      this.setAttribute('aria-checked', isChecked);
    }

    /**
     * The `checked` getter just returns the current `aria-checked` state.
     * At no point does the element actually track its own private `checked`
     * property.
     */
    get checked() {
      return this.getAttribute('aria-checked') === 'true';
    }

    /**
     * The `disabled` property reflects its state to the `aria-disabled`
     * attribute. A disabled checkbox will be visible, but no longer operable.
     */
    set disabled(isDisabled) {
      this.setAttribute('aria-disabled', isDisabled);
    }

    /**
     * The `disabled` getter just returns the current `aria-disabled` state.
     * At no point does the element actually track its own private `disabled`
     * property.
     */
    get disabled() {
      return this.getAttribute('aria-disabled') === 'true';
    }
  }

  window.customElements.define('dash-checkbox', DashCheckbox);
})();


