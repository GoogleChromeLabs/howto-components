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
   * reflected to an `aria-checked` attribute. Similarly, the `disabled`
   * property is reflected to an `aria-disabled` attribute. This controls
   * whether the element is operable or not.
   */
  class DashCheckbox extends HTMLElement {
    static get observedAttributes() {
      return ['checked', 'disabled'];
    }

    /**
     * `connectedCallback` sets the initial `role` and `tabindex` and checks
     * to see if the user has predefined an `checked` or `disabled` states.
     */
    connectedCallback() {
      if (!this.hasAttribute('role'))
        this.setAttribute('role', 'checkbox');
      if (!this.hasAttribute('tabindex'))
        this.tabIndex = 0;
      if (!this.hasAttribute('checked'))
        this.checked = false;
      if (!this.hasAttribute('disabled'))
        this.disabled = false;

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
     * Reflecting a property to an attribute may potentially cause an infinite
     * loop with `attributeChangedCallback`. These helpers set a flag to ensure
     * that `attributeChangedCallback` returns instead of trying to set the
     * underlying property again.
     */
    _safelySetAttribute(attr, value) {
      if (this._safelyModifyingAttribute) return;
      this._safelyModifyingAttribute = true;
      this.setAttribute(attr, value);
      this._safelyModifyingAttribute = false;
    }

    _safelyRemoveAttribute(attr) {
      if (this._safelyModifyingAttribute) return;
      this._safelyModifyingAttribute = true;
      this.removeAttribute(attr);
      this._safelyModifyingAttribute = false;
    }

    /**
     * `attributeChangedCallback` watches for changes to the `checked`
     * and `disabled` attributes and reflects those to the underlying
     * properties. It will be called at startup time if either attribute
     * has been set.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (this._safelyModifyingAttribute) return;
      this[name] = this.hasAttribute(name);
    }

    /**
     * The `checked` property reflects its state to the `aria-checked`
     * attribute.
     */
    set checked(isChecked) {
      if (isChecked) {
        this._safelySetAttribute('checked', '');
      } else {
        this._safelyRemoveAttribute('checked');
      }
      this.setAttribute('aria-checked', isChecked);
    }

    /**
     * The `checked` getter just returns the current `checked` state.
     */
    get checked() {
      return this.hasAttribute('checked');
    }

    /**
     * The `disabled` property reflects its state to the `aria-disabled`
     * attribute. A disabled checkbox will be visible, but no longer operable.
     */
    set disabled(isDisabled) {
      if (isDisabled) {
        this._safelySetAttribute('disabled', '');
        this.removeAttribute('tabindex');
      } else {
        this._safelyRemoveAttribute('disabled');
        this.setAttribute('tabindex', '0');
      }
      this.setAttribute('aria-disabled', isDisabled);
    }

    /**
     * The `disabled` getter just returns the current `disabled` state.
     */
    get disabled() {
      return this.hasAttribute('disabled');
    }
  }

  window.customElements.define('dash-checkbox', DashCheckbox);
})();


