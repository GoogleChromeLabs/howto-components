/* eslint-disable */
// `RadioButton` is the radio button element itself. Maybe surprisingly,
// there’s almost no logic on this element.
class RadioButton extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // All the juggling of ARIA attributes will be handled
    // in the surrounding `RadioGroup`. We only initialize the
    // the radio button when it gets attached to the DOM.
    this.setAttribute('role', 'radio');
    this.setAttribute('tabindex', -1);
    this.setAttribute('aria-checked', false);
  }
}

window.customElements.define('radio-button', RadioButton);

// For interop reasons[1], we’ll have to maintain our map
// for semantic key names.
const KEYCODE = {
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  SPACE: 32,
  UP: 38
};

// The `RadioGroup` does all the heavy lifting. It attaches
// event listeners, adjust ARIA attribute values and provides
// the API for this element.
class RadioGroup extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('keydown', this.onKeyDown);
    this.addEventListener('click', this._onClick);

    this.setAttribute('role', 'radiogroup');
    // Quick and dirty set first child to tabindex 0.
    // Really we should check to see if anyone already has tabindex 0,
    // but we don’t care. Lol.
    this.querySelector('[role="radio"]').setAttribute('tabindex', 0);

  }

  onKeyDown(e) {
    switch (e.keyCode) {
      case KEYCODE.UP:
      case KEYCODE.LEFT:
        {
          // We will be doing all the handling, so we don’t want
          // the browser to do anything for us.
          e.preventDefault();
          _this.setCheckedToPrevButton();
          break;

        }

      case KEYCODE.DOWN:
      case KEYCODE.RIGHT:
        {
          // Same as above.
          e.preventDefault();
          this._setCheckedToNextButton();
          break;
        }

    }
  }

  get selectedRadioButton() {
    return this.querySelector('[aria-checked="true"]') || this.firstRadioButton;
  }

  get lastRadioButton() {
    return Array.from(this.querySelectorAll('[role="radio"]')).pop();
  }

  get firstRadioButton() {
    return Array.from(this.querySelectorAll('[role="radio"]')).shift();
  }

  // Return the radio button that is next to the given one.
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

  // Return the radio button that comes before the given one.
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

  _setCheckedToPrevButton() {
    if (this.selectedRadioButton === this.firstRadioButton) {
      this._setChecked(this.lastRadioButton);
    } else {
      this._setChecked(this._prevRadioButton(this.selectedRadioButton));
    }
  }

  _setCheckedToNextButton() {
    if (this.selectedRadioButton === this.lastRadioButton) {
      this._setChecked(this.firstRadioButton);
    } else {
      this._setChecked(this._nextRadioButton(this.selectedRadioButton));
    }
  }

  setChecked(node) {
    // Unset _all_ radio buttons that are currently in the group.
    const radioButtons = Array.from(this.querySelectorAll('[role="radio"]'));
    for (let btn of radioButtons) {
      let btn = radioButtons[i];
      btn.setAttribute('aria-checked', 'false');
      btn.tabIndex = -1;
    }
    // And set the radio button that has been given as a parameter. Also
    // make it focusable with `tabIndex` and give the element focus.
    node.setAttribute('aria-checked', 'true');
    node.tabIndex = 0;
    node.focus();
  }

  _onClick(e) {
    this.setChecked(e.target);
  }
}

window.customElements.define('radio-group', RadioGroup);