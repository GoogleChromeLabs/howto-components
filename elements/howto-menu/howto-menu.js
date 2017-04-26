/*
 * A menu is a widget that offers a list of choices to the user,
 * such as a set of actions or functions. A menu is usually opened,
 * or made visible, by activating a menu button, choosing an item in a menu
 * that opens a sub menu, or by invoking a command, such as Shift + F10 in
 * Windows, that opens a context specific menu.
 *
 * The element that opens the menu is referenced with aria-labelledby.
 * TODO(devnook): Should it be aria-labelledby or aria-describedby?
 *
 * See: https://www.w3.org/TR/wai-aria-practices-1.1/#menu
 */
(function() {
  /**
   * Define key codes to help with handling keyboard events.
   */
  const KEYCODE = {
    DOWN: 40,
    UP: 38,
    ESCAPE: 27,
  };

  class HowtoMenu extends HTMLElement {

    /**
     * The constructor does work that needs to be executed _exactly_ once.
     */
    constructor() {
      super();
      this._handleBlur = this._handleBlur.bind(this);
      this._opener = document.getElementById(
         this.getAttribute('aria-labelledby'));
    }

    static get observedAttributes() {
      return ['aria-hidden'];
    }


    /**
     * A getter for the first child which is a menuitem.
     */
    get firstMenuItem() {
      return this.querySelector('[role^="menuitem"]:first-of-type');
    }

    /**
     * A getter for the last child which is a menuitem.
     */
    get lastMenuItem() {
      return this.querySelector('[role^="menuitem"]:last-of-type');
    }

    /**
     * Moves the browser focus from one element to another.
     * @param {Element} fromEl Element to have focus removed.
     * @param {Element} toEl Element to get focus.
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
      return this.getAttribute('aria-hidden') === 'true';
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
      this.firstMenuItem.setAttribute('tabindex', 0);
      this.firstMenuItem.focus();
    }

    /**
     * Closes the menu.
     */
    _close() {
      const children = Array.from(this.children);
      children.forEach(el => {
        el.setAttribute('tabindex', -1);
      });
      this._opener.focus();
    }

    /**
     * Makes the element unfocusable, as a reaction to blur event.
     * @param {Event} event Blur event.
     */
    _handleBlur(event) {
      if (this._isMenuItem(event.target)) {
        event.target.setAttribute('tabindex', -1);
      }
    }

    /**
     * Hanldes keyboard interaction.
     * @param {Event} event Keydown event.
     */
    _handleKeyDown(event) {
      let el = event.target;
      switch (event.keyCode) {
        case KEYCODE.DOWN:
          // If arrow down, move to next item. Wrap if necessary.
          event.preventDefault();
          this._moveFocus(el, this._nextMenuItem(el) || this.firstMenuItem);
          break;

       case KEYCODE.UP:
         // If arrow up, move to previous item. Wrap if necessary.
         event.preventDefault();
         this._moveFocus(el, this._previousMenuItem(el) || this.lastMenuItem);
         break;

       case KEYCODE.ESCAPE:
         // If escape, exit the menu.
         event.preventDefault();
         this.setAttribute('aria-hidden', 'true');
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
          }
        }
      }
    }

    /**
     * Sets up keyboard interactions for menu and its items.
     */
    connectedCallback() {
      // Make children unfocusable by default.
      const children = Array.from(this.children);
      children.forEach(el => {
        el.setAttribute('tabindex', -1);
        el.addEventListener('blur', this._handleBlur);
      });
      this.setAttribute('role', 'menu');
      this.setAttribute('aria-hidden', 'true');
      this.addEventListener('keydown', this._handleKeyDown);
    }

    /**
     * Unregisters the event listeners that were set up in `connectedCallback`.
     */
    disconnectedCallback() {
      const children = Array.from(this.children);
      children.forEach(el => {
        el.removeEventListener('blur', this._handleBlur);
      });
      this.removeEventListener('keydown', this._handleKeyDown);
    }

    /**
     * Opens or closes the menu based on aria-hidden attribute change.
     * Only caller for 'aria-hidden' due to observedAttributes property.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (newValue === 'true') {
        this._close();
      } else {
        this._open();
      }
    }
  }

  window.customElements.define('howto-menu', HowtoMenu);
})();
