/*
 * A menu button is a button that opens a menu.
 * It is referenced by the menu using aria-labelledby attribute.
 *
 * See: https://www.w3.org/TR/wai-aria-practices-1.1/#menubutton
 */
(function() {
  /**
   * Define key codes to help with handling keyboard events.
   */
  const KEYCODE = {
    DOWN: 40,
    ENTER: 13,
    SPACE: 32,
  };

  class HowtoMenuButton extends HTMLElement {
    /**
     * A getter for the first menuitem in the menu.
     */
    get firstMenuItem() {
      return this._menu.querySelector('[role^="menuitem"]:first-of-type');
    }

    /**
     * Returns true if the menu is currently opened.
     */
    _isMenuOpen() {
      return !(this._menu.getAttribute('aria-hidden') === 'true');
    }

    /**
     * Opens the menu if it was closed and vice versa.
     */
    _toggleMenu() {
      const isOpen = this._isMenuOpen();
      this._menu.setAttribute('aria-hidden', isOpen);
      if (!isOpen) {
        // Set focus on first menuitem.
        this.firstMenuItem && this.firstMenuItem.focus();
      }
    }

    /**
     * Controls keyboard interactions.
     */
    _handleKeydown(e) {
      const triggers = [KEYCODE.DOWN, KEYCODE.ENTER, KEYCODE.SPACE];
      if (triggers.indexOf(e.keyCode) > -1) {
        this._toggleMenu();
      }
    }

    /**
     * Sets up the menu button element.
     */
    connectedCallback() {
      this.setAttribute('role', 'button');
      this.setAttribute('aria-label', 'menu');
      this.setAttribute('aria-haspopup', true);
      this.setAttribute('tabindex', 0);

      this.style.display = 'inline-block';
      this.style.width = parseInt(this.getAttribute('width'), 10) + 'px';
      this.style.height = parseInt(this.getAttribute('height'), 10) + 'px';
      this.style.overflow = 'hidden';
      this.style.color = 'transparent';
      this.style.background = ('linear-gradient(to bottom, black, black 20%,' +
          ' white 20%, white 40%, black 40%, black 60%, white 60%, white 80%,' +
          ' black 80%, black 100%)');

      this._menu = document.querySelector('[aria-labelledby=' + this.id + ']');
      // TODO: Should this relationship use labelledby or aria-controls?
      this.addEventListener('click', this._toggleMenu);
      this.addEventListener('keydown', this._handleKeydown);
    }

    /**
     * Unregisters the event listeners that were set up in connectedCallback.
     */
    disconnectedCallback() {
      this.removeEventListener('click', this._toggleMenu);
      this.removeEventListener('keydown', this._handleKeydown);
    }
  }

  window.customElements.define('howto-menu-button', HowtoMenuButton);
})();
