/* eslint-disable */
/**
 * A `RadioGroup` is a set of checkable buttons, where only one button may be
 * checked at a time. The `RadioGroup` element wraps a set of `RadioButton`
 * children and manages their checked states in response to user keyboard
 * actions such as pressing arrow keys to select the next radio button, or if
 * the user clicks with a mouse.
 */

(function() {
  /**
   * Define keycodes to help with handling keyboard events.
   */
  const KEYCODE = {
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    SPACE: 32,
    UP: 38
  };

  /**
   * `RadioButton` is a simple, checkable button.
   */
  class RadioButton extends HTMLElement {
    constructor() {
      super();
    }

    /**
     * The `RadioButton` sets its initial ARIA attributes when it's attached to
     * the DOM. The surrounding RadioGroup handles dynamic changes to the ARIA
     * attributes. The RadioButton should always set a `role` of `radio`, and
     * should check to see if its `tabindex` and `aria-checked` values have been
     * set by the user. Otherwise, it can set these attributes to default
     * values. Here, the tabindex and aria-checked values are set to defaults
     * just to indcate that they will likely change in the future.
     */
    connectedCallback() {
      this.setAttribute('role', 'radio');
      this.setAttribute('tabindex', this.getAttribute('tabindex') || -1);
      this.setAttribute('aria-checked', this.getAttribute('aria-checked') || false);
    }
  }

  /**
   * Define a custom element, `<dash-radio-button>`, and associate it with the
   * `RadioButton` class.
   */
  window.customElements.define('dash-radio-button', RadioButton);

  /**
   * `RadioGroup` is responsible for handling user input, and updating the state
   * of its `RadioButton` children. It uses the [roving tabindex](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#Technique_1_Roving_tabindex)
   * technique to respond to keyboard events. This ensures that the entire
   * `RadioGroup` is a single tabstop, and tabbing into the `RadioGroup` will
   * always focus the previously checked item, if one exists.
   */
  class RadioGroup extends HTMLElement {
    constructor() {
      super();
    }

    /**
     * The `RadioGroup` sets its ARIA role to `radiogroup` and sets the
     * `tabindex` on its first `RadioButton` child to 0 if no other child is
     * already set to `tabindex=0`. This makes the first `RadioButton` focusable.
     * This assumes `RadioButton` children are already in the DOM and their
     * definition has already been loaded. For a more robust implementation you
     * might consider using a Mutation Observer to detect if children are
     * present yet. The `RadioGroup` also adds listeners for keyboard and mouse
     * events. 
     */
    connectedCallback() {
      this.setAttribute('role', 'radiogroup');
      let hasCheckedChild = this.querySelector('[role="radio"][tabindex="0"]');
      if (!hasCheckedChild) {
        this.querySelector('[role="radio"]').setAttribute('tabindex', 0); 
      }
      this.addEventListener('keydown', this._onKeyDown);
      this.addEventListener('click', this._onClick);
    }

    /**
     * If the `RadioGroup` is removed from the DOM, clean up any event
     * listeners.
     */
    disconnectedCallback() {
      this.removeEventListener('keydown', this._onKeyDown);
      this.removeEventListener('click', this._onClick);
    }

    /**
     * If the user pressed an arrow key, call preventDefault to prevent the
     * page from scrolling. If the up or left arrow keys were pressed, select
     * the previous `RadioButton`. If the down or right keys were pressed,
     * select the next `RadioButton`.
     */
    _onKeyDown(e) {
      switch (e.keyCode) {
        case KEYCODE.UP:
        case KEYCODE.LEFT:
          e.preventDefault();
          this._setCheckedToPrevButton();
          break;

        case KEYCODE.DOWN:
        case KEYCODE.RIGHT:
          e.preventDefault();
          this._setCheckedToNextButton();
          break;
        
        default:
          break;
      }
    }

    /**
     * A getter for whichever `RadioButton` is currently checked. If no button
     * is checked, return the first `RadioButton` child.
     */
    get checkedRadioButton() {
      return this.querySelector('[aria-checked="true"]') || this.firstRadioButton;
    }

    /**
     * A getter for the first `RadioButton` child.
     */
    get firstRadioButton() {
      return this.querySelector('[role="radio"]:first-of-type');
    }

    /**
     * A getter for the last `RadioButton` child.
     */
    get lastRadioButton() {
      return this.querySelector('[role="radio"]:last-of-type');
    }

    /**
     * A helper for when the user tries to moves backwards through the
     * `RadioGroup` using their keyboard. Return the `RadioButton` coming before
     * the one passed as an argument. If no previous `RadioButton` is found,
     * return null.
     */
    _prevRadioButton(node) {
      let prev = node.previousElementSibling;
      while (prev) {
        if (prev.getAttribute('role') === 'radio') {
          return prev;
        }
        prev = prev.previousElementSibling;
      }
      return null;
    }

    /**
     * A helper for when the user tries to moves forwards through the
     * `RadioGroup` using their keyboard. Return the `RadioButton` coming after
     * the one passed as an argument. If no next `RadioButton` is found, return
     * null.
     */
    _nextRadioButton(node) {
      let next = node.nextElementSibling;
      while (next) {
        if (next.getAttribute('role') === 'radio') {
          return next;
        }
        next = next.nextElementSibling;
      }
      return null;
    }

    /**
     * This method is called in response to a user pressing a key to move
     * backwards through the `RadioGroup`.
     * Check to see if the currently checked `RadioButton` is the first child.
     * If so, loop around and focus the last child. Otherwise, find the previous
     * sibling of the currently checked `RadioButton`, and make it the new
     * checked button.
     */
    _setCheckedToPrevButton() {
      let checkedButton = this.checkedRadioButton;
      if (checkedButton === this.firstRadioButton) {
        this._setChecked(this.lastRadioButton);
      } else {
        this._setChecked(this._prevRadioButton(checkedButton));
      }
    }

    /**
     * This method is called in response to a user pressing a key to move
     * forwards through the `RadioGroup`.
     * Check to see if the currently checked `RadioButton` is the last child.
     * If so, loop around and focus the first child. Otherwise, find the next
     * sibling of the currently checked `RadioButton`, and make it the new
     * checked button.
     */
    _setCheckedToNextButton() {
      let checkedButton = this.checkedRadioButton;
      if (checkedButton === this.lastRadioButton) {
        this._setChecked(this.firstRadioButton);
      } else {
        this._setChecked(this._nextRadioButton(checkedButton));
      }
    }

    /**
     * Any user action (a keypress or mouse click) eventually funnels down to
     * this method which ensures that only the passed in element is checked.
     * Uncheck _all_ `RadioButton` children. Then set the `RadioButton` that was
     * passed in to `aria-checked=true`. Also make it focusable with
     * `tabIndex=0` and call its `focus()` method.
     */
    _setChecked(node) {
      const radioButtons = Array.from(this.querySelectorAll('[role="radio"]'));
      for (let i = 0; i < radioButtons.length; i++) {
        let btn = radioButtons[i];
        btn.setAttribute('aria-checked', 'false');
        btn.tabIndex = -1;
      }
      node.setAttribute('aria-checked', 'true');
      node.tabIndex = 0;
      node.focus();
    }

    /**
     * If the user clicks inside of the `RadioGroup`, verify that the clicked
     * element has a `role` of `radio`, and if so, make it the new checked
     * button.
     */
    _onClick(e) {
      if (e.target.getAttribute('role') === 'radio') {
        this._setChecked(e.target);
      }
    }
  }

  /**
   * Define a custom element, `<dash-radio-group>`, and associate it with the
   * `RadioGroup` class.
   */
  window.customElements.define('dash-radio-group', RadioGroup);
})();