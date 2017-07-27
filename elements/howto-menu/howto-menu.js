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
    DOWN: 40,
    ESCAPE: 27,
    TAB: 9,
    UP: 38,
  };

  class HowtoMenu extends HTMLElement {
    /**
     * A getter for the first child which is a menuitem.
     */
    get _firstMenuItem() {
      let child = this.firstElementChild;
      while (child) {
        if (this._isMenuItem(child)) {
          return child;
        }
        child = next.nextElementSibling;
      }
      return null;
    }

    /**
     * A getter for the last child which is a menuitem.
     */
    get _lastMenuItem() {
      let child = this.lastElementChild;
      while (child) {
        if (this._isMenuItem(child)) {
          return child;
        }
        child = next.previousElementSibling;
      }
      return null;
    }

    /**
     * Checks if a node is a 'menuitem', 'menuitemcheckbox' or 'menuitemradio'.
     */
    _isMenuItem(node) {
      let ariaRoles = ['menuitem', 'menuitemcheckbox', 'menuitemradio'];
      return ariaRoles.indexOf(node.getAttribute('role') > -1);
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
     * Handles keyboard interaction.
     */
    _onKeyDown(event) {
      let el = event.target;
      switch (event.keyCode) {
        case KEYCODE.DOWN:
          // If arrow down, move to next item. Wrap if necessary.
          event.preventDefault();
          let next = this._nextMenuItem(el) || this._firstMenuItem;
          next.focus();
          break;
       case KEYCODE.UP:
         // If arrow up, move to previous item. Wrap if necessary.
         event.preventDefault();
         let prev = this._previousMenuItem(el) || this._lastMenuItem;
         prev.focus();
         break;
       case KEYCODE.ESCAPE:
         // If escape, close the menu.
         event.preventDefault();
         this.opened = false;
         break;
       case KEYCODE.TAB:
         // If escape, close the menu.
         event.preventDefault();
         this.opened = false;
         break;
       default:
         break;
      }
      // If letter key, move to an item which starts with that letter.
      if (event.keyCode > 64 && event.keyCode < 91) {
        for (let i = 0, child; child = this.children[i]; i++) {
          if (child.innerText.trim()[0] === event.key) {
            event.preventDefault();
            child.focus();
            break;
          }
        }
      }
    }

    open() {
      this._setTabindex(true);
      this._firstMenuItem.focus();
    }

    set opened(isOpened) {
      if (!!isOpened) {
        this.setAttribute('opened', '');
        this.open();
      } else {
        this.removeAttribute('opened');
        this._setTabindex(false);
      }
    }

    get opened() {
      return this.hasAttribute('opened');
    }

    _upgradeProperty(prop) {
      if (this.hasOwnProperty(prop) || this.hasAttribute(prop)) {
        let value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    }

    _onFocusOut(event) {
      if (event.relatedTarget === null || !this.contains(event.relatedTarget)) {
        this.opened = false;
      }
    }

    /**
     * `connectedCallback` fires when the element is inserted into the DOM.
     * It's a good place to set the initial `role`, `tabindex`, internal state,
     * and install event listeners.
     */
    connectedCallback() {
      if (!this.hasAttribute('role')) {
        this.setAttribute('role', 'menu');
      }

      // A user may set a property on an _instance_ of an element,
      // before its prototype has been connected to this class.
      // The `_upgradeProperty` method will check for any instance properties
      // and run them through the proper class setters.
      // See the [lazy properites](#lazy-properties) section for more details.
      this._upgradeProperty('opened');

      this.addEventListener('keydown', this._onKeyDown);
      this.addEventListener('focusout', this._onFocusOut);
    }

    /**
     * Unregisters the event listeners that were set up in `connectedCallback`.
     */
    disconnectedCallback() {
      this.removeEventListener('keydown', this._onKeyDown);
      this.removeEventListener('focusout', this._onKeyDown);
    }

    /**
     * Resets the menu by removing tabindex on all menu items.
     */
    _setTabindex(set) {
      const children = Array.from(this.children);
      children.forEach(el => {
        if (set) {
          el.setAttribute('tabindex', '0');
        } else {
          el.removeAttribute('tabindex');
        }
      });
    }
  }

  window.customElements.define('howto-menu', HowtoMenu);
})();
