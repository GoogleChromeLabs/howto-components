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
      this.metric = DashCombobox.prefixMetric;

      this._onBlur = this._onBlur.bind(this);
      this._onFocus = this._onFocus.bind(this);
      this._onKeyDown = this._onKeyDown.bind(this);
      this._onInput = this._onInput.bind(this);
    }

    /**
     * `connectedCallback` groups tabs and panels by reordering and makes sure
     * exactly one tab is active.
     */
    connectedCallback() {
      // Before the elements starts booting, it waits for
      // the both `<dash-tab>` and `<dash-tabpanel>` to load.
      Promise.all([
        customElements.whenDefined('dash-combobox-suggestions'),
        customElements.whenDefined('dash-combobox-suggestion'),
      ]).then(_ => {
        // The element needs to do some manual input event handling to allow
        // switching with arrow keys and Home/End.
        this.setAttribute('role', 'combobox');
        this.setAttribute('aria-expanded', 'false');
        this.setAttribute('aria-haspopup', 'listbox');

        this._setupInputField();
        this._mutationObserver.observe(this, {childList: true});

        this.setAttribute('aria-owns', this._suggestionContainer().id);
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
          node.removeEventListener('input', this._onInput);
        }
      }
      _setupInputField();
    }

    _inputField() {
      return this.querySelector('input');
    }

    _setupInputField() {
      const node = this._inputField();
      node.setAttribute('aria-autocomplete', 'list');
      node.setAttribute('aria-controls', this._suggestionContainer().id);
      node.addEventListener('blur', this._onBlur);
      node.addEventListener('keydown', this._onKeyDown);
      node.addEventListener('focus', this._onFocus);
      node.addEventListener('input', this._onInput);
    }

    _selectedSuggestion() {
      return this._suggestions()
        .find(
          suggestion => suggestion.getAttribute('aria-selected') === 'true'
        );
    }

    _prevSuggestion() {
      const suggestions = this._activeSuggestions();
      const idx =
        suggestions.findIndex(
          suggestion => suggestion.getAttribute('aria-selected') === 'true'
        ) || 0;
      return suggestions[(idx - 1 + suggestions.length) % suggestions.length];
    }

    _nextSuggestion() {
      const suggestions = this._activeSuggestions();
      const idx =
        suggestions.findIndex(
          suggestion => suggestion.getAttribute('aria-selected') === 'true'
        ) || 0;
      return suggestions[(idx + 1) % suggestions.length];
    }

    _firstSuggestion() {
      return this._activeSuggestions()[0];
    }

    _lastSuggestion() {
      return this._activeSuggestions()[0];
    }

    _deselectAllSuggestions() {
      this._suggestions()
        .forEach(
          suggestion => {
            suggestion.setAttribute('aria-selected', 'false');
            suggestion.id = '';
          }
        );
    }

    _selectSuggestion(suggestion) {
      this._deselectAllSuggestions();
      suggestion.setAttribute('aria-selected', 'true');
      suggestion.id = `${suggestion.parentElement.id}-activedescendant`;

      this._inputField().setAttribute('aria-activedescendant', suggestion.id);
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
          this._showSuggestions();
          newSuggestion = this._nextSuggestion();
          break;

        case KEYCODE.HOME:
          newSuggestion = this._firstSuggestion();
          break;

        case KEYCODE.END:
          newSuggestion = this._lastSuggestion();
          break;

        case KEYCODE.ESCAPE:
          this._hideSuggestions();
          break;

        case KEYCODE.ENTER:
          this._input().value = this._selectedSuggestion().textContent;
          this._hideSuggestions();
          return;
        default:
          return;
      }

      if(newSuggestion) this._selectSuggestion(newSuggestion);
      // The browser might have some native functionality bound to the arrow
      // keys, home or end. The element calls `preventDefault` to prevent the
      // browser from taking any actions.
      event.preventDefault();
    }

    _updateSuggestions() {
      const input = this._input().value;
      const suggestions = this._suggestions();
      for(let suggestion of suggestions) {
        const value = this.metric(input, suggestion.textContent);
        suggestion.style.display = value === -1 ? 'none' : '';
      }
    }

    _onInput(event) {
      this._updateSuggestions();
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

    _activeSuggestions() {
      return this._suggestions()
        .filter(suggestion => suggestion.style.display !== 'none');
    }

    _isExpanded() {
      return this.getAttribute('aria-expanded') === 'true';
    }

    _showSuggestions() {
      if (this._isExpanded()) return;
      const container = this._suggestionContainer();
      const comboRect = this.getBoundingClientRect();
      const inputRect = this._input().getBoundingClientRect();
      container.style.width = `${inputRect.width}px`;
      container.style.left = `${inputRect.left - comboRect.left}px`;

      this._deselectAllSuggestions();
      this._updateSuggestions();
      this.setAttribute('aria-expanded', 'true');
    }

    _hideSuggestions() {
      this.setAttribute('aria-expanded', 'false');
      this._inputField().removeAttribute('aria-activedescendant');
    }

  }
  window.customElements.define('dash-combobox', DashCombobox);

  // `dashTabCounter` counts the number of `<dash-tab>` instances created. The
  // number is used to generated new, unique IDs.
  let dashComboboxSuggestionsCounter = 0;
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
      this.id = 'dash-combobox-suggestions-generated-' +
        dashComboboxSuggestionsCounter++;
    }
  }
  window.customElements
    .define('dash-combobox-suggestions', DashComboboxSuggestions);

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


