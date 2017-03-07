/**
 * Tab panels are a pattern to limit visible content by separating
 * it into multiple panels. Only one panel is visible at a time, while
 * _all_ corresponding tabs are always visible. To switch from one panel
 * to another, the corresponding tab has to be selected.
 *
 * By either clicking or by using the arrow keys the user changes the
 * selection of the active tab.
 *
 * If JavaScript is disabled, all panels are shown interleaved with the
 * respective tabs. The tabs now function as headings.
 */
(function() {
  /**
   * Define key codes to help with handling keyboard events.
   */
  const KEYCODE = {
    DOWN: 40,
    UP: 38,
    HOME: 36,
    END: 35,
    ESCAPE: 27,
    ENTER: 13,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
  };

  /**
   * `DashTabs` is a container element for tabs and panels.
   *
   * All children of `<dash-tabs>` should be either `<dash-tab>` or
   * `<dash-tabpanel>`. This element is stateless, meaning that no values are
   * cached and therefore, changes during runtime work.
   */
  class DashCombobox extends HTMLElement {
    static prefixMetric(input, word) {
      if (word.indexOf(input) !== 0) return -1;
      return input.length;
    }

    constructor() {
      super();
      this._mutationObserver = new MutationObserver(this._onMutation);

      this._onBlur = this._onBlur.bind(this);
      this._onFocus = this._onFocus.bind(this);
      this._onKeyDown = this._onKeyDown.bind(this);
    }

    /**
     * `connectedCallback` groups tabs and panels by reordering and makes sure
     * exactly one tab is active.
     */
    connectedCallback() {
      // The element needs to do some manual input event handling to allow
      // switching with arrow keys and Home/End.
      this.setAttribute('role', 'combobox');
      this.setAttribute('aria-autocomplete', 'inline');
      this.setAttribute('aria-expanded', 'false');

      this._setupInputField();
      this._mutationObserver.observe(this, {childList: true});

      // Before the elements starts booting, it waits for
      // the both `<dash-tab>` and `<dash-tabpanel>` to load.
      Promise.all([
        customElements.whenDefined('dash-combobox-suggestions'),
        customElements.whenDefined('dash-combobox-suggestion'),
      ]).then(_ => {
      });
    }
    /**
     * `disconnectedCallback` removes the event listeners that
     * `connectedCallback` added.
     */
    disconnectedCallback() {
      this._mutationObserver.disconnect();
    }

    _onMutation(mutations) {
      for(let mutation of mutations) {
        for(let node of mutation.removeNodes) {
          node.removeEventListener('blur', this._onBlur);
          node.removeEventListener('focus', this._onFocus);
          node.removeEventListener('keydown', this._onKeyDown);
        }
      }
      _setupInputField();
    }

    _setupInputField() {
      const node = this.querySelector('input');
      node.addEventListener('blur', this._onBlur);
      node.addEventListener('keydown', this._onKeyDown);
      node.addEventListener('focus', this._onFocus);
    }

    _selectedSuggestion() {
      return this._suggestions()
        .find(
          suggestion => suggestion.getAttribute('aria-selected') === 'true'
        );
    }

    _prevSuggestion() {
      const suggestions = this._suggestions();
      const idx =
        suggestions.findIndex(
          suggestion => suggestion.getAttribute('aria-selected') === 'true'
        ) || 0;
      return suggestions[(idx - 1 + suggestions.length) % suggestions.length];
    }

    _nextSuggestion() {
      const suggestions = this._suggestions();
      const idx =
        suggestions.findIndex(
          suggestion => suggestion.getAttribute('aria-selected') === 'true'
        ) || 0;
      return suggestions[(idx + 1) % suggestions.length];
    }

    _firstSuggestion() {
      return this._suggestions()[0];
    }

    _lastSuggestion() {
      return this._suggestions()[0];
    }

    _deselectAllSuggestions() {
      this._suggestions()
        .forEach(
          suggestion => suggestion.setAttribute('aria-selected', 'false')
        );
    }

    _selectSuggestion(suggestion) {
      this._deselectAllSuggestions();
      suggestion.setAttribute('aria-selected', 'true');
    }

    _onKeyDown(event) {
      // Don’t handle modifier shortcuts typically used by assistive technology.
      if (event.altKey) return;

      let newSuggestion;
      switch (event.keyCode) {
        case KEYCODE.UP:
          newSuggestion = this._prevSuggestion();
          break;

        case KEYCODE.DOWN:
          newSuggestion = this._nextSuggestion();
          break;

        case KEYCODE.HOME:
          newSuggestion = this._firstSuggestion();
          break;

        case KEYCODE.END:
          newSuggestion = this._lastSuggestion();
          break;

        case KEYCODE.ENTER:
          this._input().value = this._selectedSuggestion().textContent;
          return;
        default:
          return;
      }

      this._selectSuggestion(newSuggestion);
      // The browser might have some native functionality bound to the arrow
      // keys, home or end. The element calls `preventDefault` to prevent the
      // browser from taking any actions.
      event.preventDefault();
    }

    _onBlur(event) {
      this._hideSuggestions();
    }

    _onFocus(event) {
      this._showSuggestions();
    }

    _input() {
      return this.querySelector('input');
    }

    _suggestionContainer() {
      return this.querySelector('dash-combobox-suggestions');
    }

    _suggestions() {
      return Array.from(this.querySelectorAll('dash-combobox-suggestion'));
    }

    _showSuggestions() {
      const width = this._input().getBoundingClientRect().width;
      this._suggestionContainer().style.width = `${width}px`;
      this._deselectAllSuggestions();
      this.setAttribute('aria-expanded', 'true');
    }

    _hideSuggestions() {
      this.setAttribute('aria-expanded', 'false');
    }

  }
  window.customElements.define('dash-combobox', DashCombobox);

  // `dashTabCounter` counts the number of `<dash-tab>` instances created. The
  // number is used to generated new, unique IDs.
  let dashTabCounter = 0;
  /**
   * `DashTabsTab` is a tab for a `<dash-tabs>` tab panel. `<dash-tabs-tab>`
   * should always be used with `role=heading` in the markup so that the
   * semantics remain useable when JavaScript is failing.
   *
   * A `<dash-tabs-tab>` declares which `<dash-tabs=panel>` it belongs to by
   * using that panel’s ID as the value for the `aria-controls` attribute.
   *
   * A `<dash-tabs-tab>` will automatically generate a unique ID if none
   * is specified.
   */
  class DashComboboxSuggestions extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.setAttribute('role', 'listbox');
    }
  }
  window.customElements
    .define('dash-combobox-suggestions', DashComboboxSuggestions);

  let dashPanelCounter = 0;
  /**
   * `DashTabsPanel` is a panel for a `<dash-tabs>` tab panel.
   */
  class DashComboboxSuggestion extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.setAttribute('role', 'option');
    }
  }
  window.customElements
    .define('dash-combobox-suggestion', DashComboboxSuggestion);
})();


