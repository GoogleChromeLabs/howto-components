// `RadioButton` is the radio button element itself. Maybe surprisingly,
// there’s almost no logic on this element. All the juggling of ARIA 
// attributes will be handled in the surrounding `RadioGroup`.
class RadioButton extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.setAttribute('role', 'radio');
    this.setAttribute('tabindex', -1);
    this.setAttribute('aria-checked', false);
  }
}

window.customElements.define('radio-button', RadioButton);

// Define values for keycodes
const KEYCODE = {
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  SPACE: 32,
  UP: 38
};

class RadioGroup extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.setAttribute('role', 'radiogroup');
    // Quick and dirty set first child to tabindex 0
    // Really we should check to see if anyone already has tabindex 0
    this.querySelector('[role="radio"]').setAttribute('tabindex', 0);
    this.addEventListener('keydown', this.onKeyDown);
    this.addEventListener('click', this.onClick);
  }

  onKeyDown(e) {
    switch (e.keyCode) {

      case KEYCODE.UP:
      case KEYCODE.LEFT:
        {
          e.preventDefault();
          this.setCheckedToPrevButton();
          break;

        }

      case KEYCODE.DOWN:
      case KEYCODE.RIGHT:
        {
          e.preventDefault();
          this.setCheckedToNextButton();
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

  prevRadioButton(node) {
    let prev = node.previousElementSibling;

    while (prev) {
      if (prev.getAttribute('role') === 'radio') {
        return prev;
      }
      prev = prev.previousElementSibling;
    }

    return null;
  }

  nextRadioButton(node) {
    let next = node.nextElementSibling;

    while (next) {
      if (next.getAttribute('role') === 'radio') {
        return next;
      }
      next = next.nextElementSibling;
    }

    return null;
  }

  setCheckedToPrevButton() {
    if (this.selectedRadioButton === this.firstRadioButton) {
      this.setChecked(this.lastRadioButton);
    } else {
      this.setChecked(this.prevRadioButton(this.selectedRadioButton));
    }
  }

  setCheckedToNextButton() {
    if (this.selectedRadioButton === this.lastRadioButton) {
      this.setChecked(this.firstRadioButton);
    } else {
      this.setChecked(this.nextRadioButton(this.selectedRadioButton));
    }
  }

  setChecked(node) {
    const radioButtons = Array.from(this.querySelectorAll('[role="radio"]'));
    for (var i = 0; i < radioButtons.length; i++) {
      let btn = radioButtons[i];
      btn.setAttribute('aria-checked', 'false');
      btn.tabIndex = -1;
    }
    node.setAttribute('aria-checked', 'true');
    node.tabIndex = 0;
    node.focus();
  }

  onClick(e) {
    this.setChecked(e.target);
  }
}

window.customElements.define('radio-group', RadioGroup);