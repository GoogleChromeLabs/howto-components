/**
 * // TODO
 */
(function() {
  /**
   * Define key codes to help with handling keyboard events.
   */
  const KEYCODE = {
    SPACE: 32,
  };

  class DashCheckbox extends HTMLElement {
    static get observedAttributes() {
      return ['checked'];
    }

    constructor() {
      super();
    }

    /**
     * `connectedCallback` sets the initial role and checks to see if the
     * user has predefined an `aria-checked` state or `tabindex`.
     */
    connectedCallback() {
      this.setAttribute('role', 'checkbox');
      if (!this.hasAttribute('aria-checked'))
        this.checked = false;
      if (!this.hasAttribute('tabindex'))
        this.setAttribute('tabindex', 0);

      this.addEventListener('keydown', this._onKeyDown);
      this.addEventListener('click', this._onClick);
    }

    /**
     * `_onKeyDown` handles key presses on the checkbox.
     */
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

    /**
     * `_onClick` handles clicks on the checkbox.
     */
    _onClick(event) {
      this._toggleChecked();
    }

    /**
     * `_toggleChecked` calls the checked setter and flips its state.
     * Because `_toggleChecked` is only caused by a user action, it will
     * also dispatch a state change event.
     */
    _toggleChecked() {
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
     * attribute and reflects those to the underlying checked property.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      this.checked = this.hasAttribute('checked');
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
  }

  window.customElements.define('dash-checkbox', DashCheckbox);
})();


