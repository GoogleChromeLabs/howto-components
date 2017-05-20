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
  // template for the contents of the ShadowDOM is  is shared by all
  // `<howto-tabs>` instances.
  const shadowDOMTemplate = document.createElement('template');
  shadowDOMTemplate.innerHTML = `
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
    constructor() {
      super();

      // Event handlers that are not attached to this element need to be bound
      // if they need access to `this`.
      this._onSlotChange = this._onSlotChange.bind(this);

      // For progressive enhancement, the markup should alternate between tabs
      // and panels. Elements that reorder their children tend to not work well
      // with frameworks. Instead ShadowDOM is used to reorder the elements by
      // using slots.
      this.attachShadow({mode: 'open'});
      // Import the shared template to create the slots for tabs and panels.
      this.shadowRoot.appendChild(
        document.importNode(shadowDOMTemplate.content, true)
      );
      this._tabSlot = this.shadowRoot.querySelector('slot[name=tab]');
      this._panelSlot = this.shadowRoot.querySelector('slot[name=panel]');
      this._tabSlot.addEventListener('slotchange', this._onSlotChange);
      this._panelSlot.addEventListener('slotchange', this._onSlotChange);
    }

    /**
     * `connectedCallback` groups tabs and panels by reordering and makes sure
     * exactly one tab is active.
     */
    connectedCallback() {
      // The element needs to do some manual input event handling to allow
      // switching with arrow keys and Home/End.
      this.addEventListener('keydown', this._onKeyDown);
      this.addEventListener('click', this._onClick);

      if (!this.hasAttribute('role'))
        this.setAttribute('role', 'tablist');

      // Currently, `slotchange` does not fire when an element is upgraded. For
      // this reason, the element always processes the slots after the inner
      // elements have been defined. If the current behavior of the `slotchange`
      // event is change (as proposed in
      // [this issue](https://github.com/whatwg/dom/issues/447)), the code below
      // can be removed.
      Promise.all([
        customElements.whenDefined('howto-tabs-tab'),
        customElements.whenDefined('howto-tabs-panel'),
      ])
        .then(_ => this._linkPanels());
    }

    /**
     * `_onSlotChange` is called whenever an element is added or removed from
     * one of the ShadowDOM slots.
     */
    _onSlotChange() {
      this._linkPanels();
    }

    /**
     * `_linkPanels` links up tabs with their adjacent panels using
     * `aria-controls` and `aria-labelledby`. Additionally, the method makes
     * sure only one tab is active.
     *
     * If this function becomes a bottle neck, it can be easily optimized by
     * only handling the new elements instead of iterating over all of the
     * element’s children.
     */
    _linkPanels() {
      const tabs = this._allTabs();
      // Give each panel a `aria-labelledby` attribute that refers to the tab
      // that controls it.
      tabs.forEach(tab => {
        const panel = tab.nextElementSibling;
        if (panel.tagName.toLowerCase() !== 'howto-tabs-panel') {
          console.error(`Tab #${tab.id} is not a` +
            `sibling of a <howto-tabs-panel>`);
          return;
        }

        tab.setAttribute('aria-controls', panel.id);
        panel.setAttribute('aria-labelledby', tab.id);
      });

      // The element checks if any of the tabs have been marked as selected.
      // If not, the first tab is now selected.
      const selectedTab =
        tabs.find(tab => tab.selected) || tabs[0];

      // Next, we switch to the selected tab. `selectTab` takes care of
      // marking all other tabs as deselected and hiding all other panels.
      this._selectTab(selectedTab);
    }

    /**
     * `_allPanels` returns all the panels in the tab panel. This function could
     * memoize the result if the DOM queries ever become a performance issue.
     * The downside of memoization is that dynamically added tabs and panels
     * will not be handled.
     *
     * This is a method and not a getter, because a getter implies that it is
     * cheap to read.
     */
    _allPanels() {
      return Array.from(this.querySelectorAll('howto-tabs-panel'));
    }

    /**
     * `_allTabs` returns all the tabs in the tab panel.
     */
    _allTabs() {
      return Array.from(this.querySelectorAll('howto-tabs-tab'));
    }

    /**
     * `_panelForTab` returns the panel that the given tab controls.
     */
    _panelForTab(tab) {
      const panelId = tab.getAttribute('aria-controls');
      return this.querySelector(`#${panelId}`);
    }

    /**
     * `_prevTab` returns the tab that comes before the currently selected one,
     * wrapping around when reaching the first one.
     */
    _prevTab() {
      const tabs = this._allTabs();
      // Use `findIndex` to find the index of the currently
      // selected element and subtracts one to get the index of the previous
      // element.
      let newIdx =
        tabs.findIndex(tab => tab.selected) - 1;
      // Add `tabs.length` to make sure the index is a positive number
      // and get the modulus to wrap around if necessary.
      return tabs[(newIdx + tabs.length) % tabs.length];
    }

    /**
     * `_firstTab` returns the first tab.
     */
    _firstTab() {
      const tabs = this._allTabs();
      return tabs[0];
    }

    /**
     * `_lastTab` returns the last tab.
     */
    _lastTab() {
      const tabs = this._allTabs();
      return tabs[tabs.length - 1];
    }

    /**
     * `_nextTab` gets the tab that comes after the currently selected one,
     * wrapping around when reaching the last tab.
     */
    _nextTab() {
      const tabs = this._allTabs();
      let newIdx = tabs.findIndex(tab => tab.selected) + 1;
      return tabs[newIdx % tabs.length];
    }

    /**
     * `reset` marks all tabs as deselected and hides all the panels.
     */
    reset() {
      const tabs = this._allTabs();
      const panels = this._allPanels();

      tabs.forEach(tab => tab.selected = false);
      panels.forEach(panel => panel.hidden = true);
    }

    /**
     * `disconnectedCallback` removes the event listeners that
     * `connectedCallback` added.
     */
    disconnectedCallback() {
      this.removeEventListener('keydown', this._onKeyDown);
      this.removeEventListener('click', this._onClick);
    }

    /**
     * `_selectTab` marks the given tab as selected.
     * Additionally, it unhides the panel corresponding to the given tab.
     */
    _selectTab(newTab) {
      // Deselect all tabs and hide all panels.
      this.reset();

      // Get the panel that the `newTab` is associated with.
      const newPanel = this._panelForTab(newTab);
      // If that panel doesn’t exist, abort.
      if (!newPanel)
        throw new Error(`No panel with id ${newPanelId}`);
      newTab.selected = true;
      newPanel.hidden = false;
      newTab.focus();
    }

    /**
     * `_onKeyDown` handles key presses inside the tab panel.
     */
    _onKeyDown(event) {
      // If the keypress did not originate from a tab element itself,
      // it was a keypress inside the a panel or on empty space. Nothing to do.
      if (event.target.getAttribute('role') !== 'tab')
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
      // keys, home or end. The element calls `preventDefault` to prevent the
      // browser from taking any actions.
      event.preventDefault();
      // Select the new tab, that has been determined in the switch-case.
      this._selectTab(newTab);
    }

    /**
     * `_onClick` handles clicks inside the tab panel.
     */
    _onClick(event) {
      // If the click was not targeted on a tab element itself,
      // it was a click inside the a panel or on empty space. Nothing to do.
      if (event.target.getAttribute('role') !== 'tab')
        return;
      // If it was on a tab element, though, select that tab.
      this._selectTab(event.target);
    }
  }
  window.customElements.define('howto-tabs', HowtoTabs);

  // `howtoTabCounter` counts the number of `<howto-tab>` instances created. The
  // number is used to generated new, unique IDs.
  let howtoTabCounter = 0;
  /**
   * `HowtoTabsTab` is a tab for a `<howto-tabs>` tab panel. `<howto-tabs-tab>`
   * should always be used with `role=heading` in the markup so that the
   * semantics remain useable when JavaScript is failing.
   *
   * A `<howto-tabs-tab>` declares which `<howto-tabs=panel>` it belongs to by
   * using that panel’s ID as the value for the `aria-controls` attribute.
   *
   * A `<howto-tabs-tab>` will automatically generate a unique ID if none
   * is specified.
   */
  class HowtoTabsTab extends HTMLElement {
    static get observedAttributes() {
      return ['selected'];
    }

    constructor() {
      super();
    }

    connectedCallback() {
      // If this is executed, JavaScript is working and the element
      // changes its role to `tab`.
      this.setAttribute('role', 'tab');
      if (!this.id)
        this.id = `howto-tabs-tab-generated-${howtoTabCounter++}`;

      // Set a well-defined initial state.
      this.setAttribute('aria-selected', 'false');
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
     * do that work in the `attributeChangedCallback`. This will avoid having to
     * manage complex attribute/property reentrancy scenarios.
     */
    attributeChangedCallback() {
      const value = this.hasAttribute('selected');
      this.setAttribute('aria-selected', value);
      this.setAttribute('tabindex', value ? 0 : -1);
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
  window.customElements.define('howto-tabs-tab', HowtoTabsTab);

  let howtoPanelCounter = 0;
  /**
   * `HowtoTabsPanel` is a panel for a `<howto-tabs>` tab panel.
   */
  class HowtoTabsPanel extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.setAttribute('role', 'tabpanel');
      if (!this.id)
        this.id = `howto-tabs-panel-generated-${howtoPanelCounter++}`;
    }
  }
  window.customElements.define('howto-tabs-panel', HowtoTabsPanel);
})();


