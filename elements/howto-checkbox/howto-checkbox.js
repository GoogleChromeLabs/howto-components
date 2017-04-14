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
   * whether the element is operable or not. Although native checkbox elements
   * also provide a `value` attribute, because it is only used for `<form>`
   * submissions, and this element can't take part in that process, it has
   * been omitted.
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

      this._checked = false;
      this._disabled = false;

      this.addEventListener('keydown', this._onKeyDown);
      this.addEventListener('click', this._onClick);
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
     * The `checked` property reflects its state to the `checked` and
     * `aria-checked` attributes. This element supports setting
     * properties to falsey values like `undefined`, `null`, or `''`
     * which are then converted to `true|false`. This is done to
     * match the behavior of native HTML Elements.
     */
    set checked(value) {
      const isChecked = Boolean(value);
      if (this._checked == isChecked)
        return;
      this._checked = isChecked;
      this._safelySetAttribute('checked', isChecked);
      this.setAttribute('aria-checked', isChecked);
    }

    get checked() {
      return this._checked;
    }

    /**
     * The `disabled` property reflects its state to the `disabled` and
     * `aria-disabled` attributes.
     * It will also remove the `tabindex` attribute if disabled is true.
     * This means a disabled checkbox will be visible, but no longer operable.
     */
    set disabled(value) {
      const isDisabled = Boolean(value);
      if (this._disabled == isDisabled)
        return;
      this._disabled = isDisabled;
      this._safelySetAttribute('disabled', isDisabled);
      this.setAttribute('aria-disabled', isDisabled);
      // The `tabindex` attribute does not provide a way to fully remove
      // focusability from an element.
      // Elements with `tabindex=-1` can still be focused with
      // a mouse or by calling `focus()`.
      // To make sure an element is disabled and not focusable, remove the
      // `tabindex` attribute.
      if (isDisabled) {
        this.removeAttribute('tabindex');
        // If the focus is currently on this element, unfocus it by
        // calling the `HTMLElement.blur()` method.
        if (document.activeElement === this)
          this.blur();
      } else {
        this.setAttribute('tabindex', '0');
      }
    }

    get disabled() {
      return this._disabled;
    }

    /**
     * Both `checked` and `disabled` are part of the `observedAttributes` array
     * meaning that setting either attribute will trigger the
     * `attributeChangedCallback`.
     * It's possible to get into a cycle where setting a property sets one of
     * these attributes, which then tries to set the property again.
     * This helper avoids that by checking to see if the attribute is already
     * set.
     */
    _safelySetAttribute(attr, value) {
      if (value && !this.hasAttribute(attr)) {
          this.setAttribute(attr, '');
          return;
      }
      if (!value && this.hasAttribute(attr)) {
        this.removeAttribute(attr);
        return;
      }
    }

    /**
     * `attributeChangedCallback` watches for changes to the `checked`
     * and `disabled` attributes and reflects their states to the corresponding
     * properties. It will be called at startup time if either attribute
     * has been set.
     */
    attributeChangedCallback(name) {
      // Because both `checked` and `disabled` are booleans, the callback
      // determines their values by checking to see if the attributes are
      // present.
      const value = this.hasAttribute(name);
      if (this[name] !== value) this[name] = value;
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


