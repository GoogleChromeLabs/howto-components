(function() {
  /**
   * Define key codes to help with handling keyboard events.
   */
  const KEYCODE = {
    DOWN: 40,
    UP: 38,
    ESCAPE: 27,
    TAB: 9,
  };

  class HowtoMenu extends HTMLElement {

    /**
     * The constructor does work that needs to be executed _exactly_ once.
     */
    constructor() {
      super();
      this._onBlur = this._onBlur.bind(this);
    }

    static get observedAttributes() {
      return ['hidden'];
    }


    /**
     * A getter for the first child which is a menuitem.
     */
    get _firstMenuItem() {
      return this.querySelector('[role^="menuitem"]:first-of-type');
    }

    /**
     * A getter for the last child which is a menuitem.
     */
    get _lastMenuItem() {
      return this.querySelector('[role^="menuitem"]:last-of-type');
    }

    /**
     * Moves the browser focus from one element to another.
     * HowtoMenu uses a [roving tabindex](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#Technique_1_Roving_tabindex)
     * technique to manage which menu item is currently focusable.
     * It sets all items to a `tabindex=-1` but for the one that is currently
     * focusable. This ensures the focus cannot enter the menu unless it
     * is open. When the menu gets opened, focus lands
     * on the first `menuitem`.
     */
    _moveFocus(fromEl, toEl) {
      fromEl.setAttribute('tabindex', -1);
      toEl.setAttribute('tabindex', 0);
      toEl.focus();
    }

    /**
     * Checks if a node is a 'menuitem', 'menuitemcheckbox' or 'menuitemradio'.
     */
    _isMenuItem(node) {
      let ariaRoles = ['menuitem', 'menuitemcheckbox', 'menuitemradio'];
      return ariaRoles.indexOf(node.getAttribute('role') > -1);
    }

    /**
     * Returns true if the menu is currently hidden, false otherwise.
     */
    _isHidden() {
      return !!this.getAttribute('hidden');
    }

    /**
     * Returns a menu item coming after the one passed as an argument, or null.
     */
    _nextMenuItem(node) {
      let next = node.nextElementSibling;
      while (next) {
        if (this._isMenuItem(node)) {
          return next;
        }
        next = next.nextElementSibling;
      }
      return null;
    }

    /**
     * Returns a menu item coming before the one passed as an argument, or null.
     */
    _previousMenuItem(node) {
      let prev = node.previousElementSibling;
      while (prev) {
        if (this._isMenuItem(node)) {
          return prev;
        }
        prev = prev.previousElementSibling;
      }
      return null;
    }

    /**
     * Opens the menu.
     */
    _open() {
      this._firstMenuItem.setAttribute('tabindex', 0);
      this._firstMenuItem.focus();
    }

    /**
     * Closes the menu.
     */
    _close() {
      this.reset();
      document.getElementById(
         this.getAttribute('aria-labelledby')).focus();
    }

    /**
     * Makes the element unfocusable, as a reaction to blur event.
     */
    _onBlur(event) {
      if (this._isMenuItem(event.target)) {
        event.target.setAttribute('tabindex', -1);
      }
    }

    /**
     * Hanldes keyboard interaction.
     */
    _onKeyDown(event) {
      let el = event.target;
      switch (event.keyCode) {
        case KEYCODE.DOWN:
          // If arrow down, move to next item. Wrap if necessary.
          event.preventDefault();
          this._moveFocus(el, this._nextMenuItem(el) || this._firstMenuItem);
          break;

       case KEYCODE.UP:
         // If arrow up, move to previous item. Wrap if necessary.
         event.preventDefault();
         this._moveFocus(el, this._previousMenuItem(el) || this._lastMenuItem);
         break;

       case KEYCODE.ESCAPE:
         // If escape, exit the menu.
         event.preventDefault();
         this.setAttribute('hidden', true);
         break;

       case KEYCODE.TAB:
         this.setAttribute('hidden', true);
         break;

       default:
         break;
      };
      // If letter key, move to an item which starts with that letter.
      if (event.keyCode > 64 && event.keyCode < 91) {
        for (let i = 0, child; child = this.children[i]; i++) {
          if (child.innerText.trim()[0] === event.key) {
            event.preventDefault();
            this._moveFocus(el, child);
            break;
          }
        }
      }
    }

    /**
     * Sets up keyboard interactions for menu and its items.
     */
    connectedCallback() {
      // Make children unfocusable by default.
      this.reset();
      this.addEventListener('blur', this._onBlur, true);
      if (!this.hasAttribute('role')) {
        this.setAttribute('role', 'menu');
      }
      this.setAttribute('hidden', true);
      this.addEventListener('keydown', this._onKeyDown);
    }

    /**
     * Unregisters the event listeners that were set up in `connectedCallback`.
     */
    disconnectedCallback() {
      const children = Array.from(this.children);
      children.forEach(el => {
        el.removeEventListener('blur', this._onBlur, true);
      });
      this.removeEventListener('keydown', this._onKeyDown);
    }

    /**
     * Opens or closes the menu based on hidden attribute change.
     * Only caller for 'hidden' due to observedAttributes property.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (newValue) {
        this._close();
      } else {
        this._open();
      }
    }

    /**
     * Resets the menu by setting tabindex to -1 on all menu items.
     */
    reset() {
      const children = Array.from(this.children);
      children.forEach(el => {
        el.setAttribute('tabindex', -1);
      });
    }
  }

  window.customElements.define('howto-menu', HowtoMenu);
})();
