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

    connectedCallback() {
      this.setAttribute('role', 'checkbox');
      if (!this.hasAttribute('aria-checked'))
        this.setAttribute('aria-checked', 'false');
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

    _toggleChecked() {
      this.checked = !this.checked;
      this.dispatchEvent(new CustomEvent('checked-changed', {
        detail: {
          checked: this.checked,
        },
        bubbles: false,
      }));
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this.checked = this.hasAttribute('checked');
    }

    set checked(isChecked) {
      this.setAttribute('aria-checked', isChecked);
    }

    get checked() {
      return this.getAttribute('aria-checked') === 'true';
    }
  }

  window.customElements.define('dash-checkbox', DashCheckbox);
})();


