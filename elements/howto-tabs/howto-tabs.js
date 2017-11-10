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
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    HOME: 36,
    END: 35,
  };

  // To avoid invoking the parser with `.innerHTML` for every new instance, a
  // template for the contents of the shadow DOM is shared by all
  // `<howto-tabs>` instances.
  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      :host {
        display: flex;
        flex-wrap: wrap;
      }
      ::slotted(howto-panel) {
        flex-basis: 100%;
      }
    </style>
    <slot name="tab"></slot>
    <slot name="panel"></slot>
  `;

  /**
   * `HowtoTabs` is a container element for tabs and panels.
   *
   * All children of `<howto-tabs>` should be either `<howto-tab>` or
   * `<howto-tabpanel>`. This element is stateless, meaning that no values are
   * cached and therefore, changes during runtime work.
   */
  class HowtoTabs extends HTMLElement {
    static get observedAttributes() {
      return ['role'];
    }
    constructor() {
      super();
      this.attachAccessibleRoot();
      this.accessibleRoot.role = 'tablist';
      // Event handlers that are not attached to this element need to be bound
      // if they need access to `this`.
      this._onSlotChange = this._onSlotChange.bind(this);

      // For progressive enhancement, the markup should alternate between tabs
      // and panels. Elements that reorder their children tend to not work well
      // with frameworks. Instead shadow DOM is used to reorder the elements by
      // using slots.
      this.attachShadow({mode: 'open'});
      // Import the shared template to create the slots for tabs and panels.
      this.shadowRoot.appendChild(template.content.cloneNode(true));

      this._tabSlot = this.shadowRoot.querySelector('slot[name=tab]');
      this._panelSlot = this.shadowRoot.querySelector('slot[name=panel]');

      // This element needs to react to new children as it links up tabs and
      // panel semantically using `aria-labelledby` and `aria-controls`.
      // New children will get slotted automatically and cause `slotchange`
      // to fire, so not `MutationObserver` is needed.
      this._tabSlot.addEventListener('slotchange', this._onSlotChange);
      this._panelSlot.addEventListener('slotchange', this._onSlotChange);
    }

    /**
     * `connectedCallback()` groups tabs and panels by reordering and makes sure
     * exactly one tab is active.
     */
    connectedCallback() {
      // The element needs to do some manual input event handling to allow
      // switching with arrow keys and Home/End.
      this.addEventListener('keydown', this._onKeyDown);
      this.addEventListener('click', this._onClick);

      // Up until recently, `slotchange` events did not fire when an element was
      // upgraded by the parser. For this reason, the element invokes the
      // handler manually. Once the new behavior lands in all browsers, the code
      // below can be removed.
      // https://github.com/whatwg/dom/issues/447
      Promise.all([
        customElements.whenDefined('howto-tab'),
        customElements.whenDefined('howto-panel'),
      ])
        .then(_ => this._linkPanels());
    }

    /**
     * `disconnectedCallback()` removes the event listeners that
     * `connectedCallback` added.
     */
    disconnectedCallback() {
      this.removeEventListener('keydown', this._onKeyDown);
      this.removeEventListener('click', this._onClick);
    }

    /**
     * `_onSlotChange()` is called whenever an element is added or removed from
     * one of the shadow DOM slots.
     */
    _onSlotChange() {
      this._linkPanels();
    }

    /**
     * `_linkPanels()` links up tabs with their adjacent panels using
     * AOM controls and AOM labeledBy. Additionally, the method makes
     * sure only one tab is active.
     *
     * If this function becomes a bottleneck, it can be easily optimized by
     * only handling the new elements instead of iterating over all of the
     * element’s children.
     */
    _linkPanels() {
      const tabs = this._allTabs();
      // Give each panel a `aria-labelledby` attribute that refers to the tab
      // that controls it.
      tabs.forEach(tab => {
        const panel = tab.nextElementSibling;
        if (panel.tagName.toLowerCase() !== 'howto-panel') {
          return;
        }

        tab.panel = panel; // Would prefer if this was private somehow...
        tab.accessibleRoot.controls = [panel];
        panel.tab = tab;
        panel.accessibleRoot.labelledBy = [tab];
      });

      // The element checks if any of the tabs have been marked as selected.
      // If not, the first tab is now selected.
      const selectedTab =
        tabs.find(tab => tab.selected) || tabs[0];

      // Next, switch to the selected tab. `selectTab()` takes care of
      // marking all other tabs as deselected and hiding all other panels.
      this._selectTab(selectedTab);
    }

    /**
     * `_allPanels()` returns all the panels in the tab panel. This function
     * could memoize the result if the DOM queries ever become a performance
     * issue. The downside of memoization is that dynamically added tabs and
     * panels will not be handled.
     *
     * This is a method and not a getter, because a getter implies that it is
     * cheap to read.
     */
    _allPanels() {
      return Array.from(this.querySelectorAll('howto-panel'));
    }

    /**
     * `_allTabs()` returns all the tabs in the tab panel.
     */
    _allTabs() {
      return Array.from(this.querySelectorAll('howto-tab'));
    }

    /**
     * `_panelForTab()` returns the panel that the given tab controls.
     */
    _panelForTab(tab) {
      // Originally this method relied on looking at the aria-controls id
      // and querying for that element. If AOM had a reference back to its
      // element we could use that instead.
      return tab.panel;
    }

    /**
     * `_prevTab()` returns the tab that comes before the currently selected
     * one, wrapping around when reaching the first one.
     */
    _prevTab() {
      const tabs = this._allTabs();
      // Use `findIndex()` to find the index of the currently
      // selected element and subtracts one to get the index of the previous
      // element.
      let newIdx =
        tabs.findIndex(tab => tab.selected) - 1;
      // Add `tabs.length` to make sure the index is a positive number
      // and get the modulus to wrap around if necessary.
      return tabs[(newIdx + tabs.length) % tabs.length];
    }

    /**
     * `_firstTab()` returns the first tab.
     */
    _firstTab() {
      const tabs = this._allTabs();
      return tabs[0];
    }

    /**
     * `_lastTab()` returns the last tab.
     */
    _lastTab() {
      const tabs = this._allTabs();
      return tabs[tabs.length - 1];
    }

    /**
     * `_nextTab()` gets the tab that comes after the currently selected one,
     * wrapping around when reaching the last tab.
     */
    _nextTab() {
      const tabs = this._allTabs();
      let newIdx = tabs.findIndex(tab => tab.selected) + 1;
      return tabs[newIdx % tabs.length];
    }

    /**
     * `reset()` marks all tabs as deselected and hides all the panels.
     */
    reset() {
      const tabs = this._allTabs();
      const panels = this._allPanels();

      tabs.forEach(tab => tab.selected = false);
      panels.forEach(panel => panel.hidden = true);
    }


    /**
     * `_selectTab()` marks the given tab as selected.
     * Additionally, it unhides the panel corresponding to the given tab.
     */
    _selectTab(newTab) {
      // Deselect all tabs and hide all panels.
      this.reset();

      // Get the panel that the `newTab` is associated with.
      const newPanel = this._panelForTab(newTab);
      // If that panel doesn’t exist, abort.
      if (!newPanel)
        return;
      newTab.selected = true;
      newPanel.hidden = false;
      newTab.focus();
    }

    /**
     * `_onKeyDown()` handles key presses inside the tab panel.
     */
    _onKeyDown(event) {
      // If the keypress did not originate from a tab element itself,
      // it was a keypress inside the a panel or on empty space. Nothing to do.
      if (event.target.nodeName.toLowerCase() !== 'howto-tab')
        return;
      // Don’t handle modifier shortcuts typically used by assistive technology.
      if (event.altKey)
        return;

      // The switch-case will determine which tab should be marked as active
      // depending on the key that was pressed.
      let newTab;
      switch (event.keyCode) {
        case KEYCODE.LEFT:
        case KEYCODE.UP:
          newTab = this._prevTab();
          break;

        case KEYCODE.RIGHT:
        case KEYCODE.DOWN:
          newTab = this._nextTab();
          break;

        case KEYCODE.HOME:
          newTab = this._firstTab();
          break;

        case KEYCODE.END:
          newTab = this._lastTab();
          break;
        // Any other key press is ignored and passed back to the browser.
        default:
          return;
      }

      // The browser might have some native functionality bound to the arrow
      // keys, home or end. The element calls `preventDefault()` to prevent the
      // browser from taking any actions.
      event.preventDefault();
      // Select the new tab, that has been determined in the switch-case.
      this._selectTab(newTab);
    }

    /**
     * `_onClick()` handles clicks inside the tab panel.
     */
    _onClick(event) {
      // If the click was not targeted on a tab element itself,
      // it was a click inside the a panel or on empty space. Nothing to do.
      if (event.target.nodeName.toLowerCase() !== 'howto-tab')
        return;
      // If it was on a tab element, though, select that tab.
      this._selectTab(event.target);
    }
  }
  customElements.define('howto-tabs', HowtoTabs);

  /**
   * `HowtoTabsTab` is a tab for a `<howto-tabs>` tab panel. `<howto-tab>`
   * should always be used with `role=heading` in the markup so that the
   * semantics remain useable when JavaScript is failing.
   *
   * A `<howto-tab>` declares which `<howto-panel>` it belongs to by
   * using that panel’s ID as the value for the `aria-controls` attribute.
   *
   * A `<howto-tab>` will automatically generate a unique ID if none
   * is specified.
   */
  class HowtoTab extends HTMLElement {
    static get observedAttributes() {
      return ['role', 'selected', 'aria-selected'];
    }

    constructor() {
      super();
      this.attachAccessibleRoot();
      this.accessibleRoot.role = 'tab';
      this.accessibleRoot.selected = false;
    }

    connectedCallback() {
      this.setAttribute('tabindex', -1);
      this._upgradeProperty('selected');
    }

    /**
    * Check if a property has an instance value. If so, copy the value, and
    * delete the instance property so it doesn't shadow the class property
    * setter. Finally, pass the value to the class property setter so it can
    * trigger any side effects.
    * This is to safe guard against cases where, for instance, a framework
    * may have added the element to the page and set a value on one of its
    * properties, but lazy loaded its definition. Without this guard, the
    * upgraded element would miss that property and the instance property
    * would prevent the class property setter from ever being called.
    */
    _upgradeProperty(prop) {
      if (this.hasOwnProperty(prop)) {
        let value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    }

    /**
     * Properties and their corresponding attributes should mirror one another.
     * To this effect, the property setter for `selected` handles truthy/falsy
     * values and reflects those to the state of the attribute. It’s important
     * to note that there are no side effects taking place in the property
     * setter. For example, the setter does not set `aria-selected`. Instead,
     * that work happens in the `attributeChangedCallback`. As a general rule,
     * make property setters very dumb, and if setting a property or attribute
     * should cause a side effect (like setting a corresponding ARIA attribute)
     * do that work in the `attributeChangedCallback()`. This will avoid having
     * to manage complex attribute/property reentrancy scenarios.
     */
    attributeChangedCallback(name, oldVal, newVal) {
      switch (name) {
        case 'selected':
          let value = this.hasAttribute('selected');
          // Don't override the user if ARIA is set. This is kinda weird.
          if (!this.hasAttribute('aria-selected'))
            this.accessibleRoot.selected = value;
          // AOM doesn't help with tabindex so apologies to the user if they
          // set this...
          this.setAttribute('tabindex', value ? 0 : -1);
          break;
        case 'aria-selected':
          if (newVal)
            this.accessibleRoot.selected = newVal;
          break;
      }
    }

    set selected(value) {
      value = Boolean(value);
      if (value)
        this.setAttribute('selected', '');
      else
        this.removeAttribute('selected');
    }

    get selected() {
      return this.hasAttribute('selected');
    }
  }
  customElements.define('howto-tab', HowtoTab);

  class HowtoPanel extends HTMLElement {
    constructor() {
      super();
      this.attachAccessibleRoot();
      this.accessibleRoot.role = 'tabpanel';
    }
  }
  customElements.define('howto-panel', HowtoPanel);
})();


