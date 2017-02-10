/**
 * Tab panels are a pattern to limit visible content by separating
 * it into multiple panels. Only one panel is visible at a time, while
 * _all_ corresponding tabs are always visible. To switch from one panel
 * to another, the corresponding tab has to be selected.
 *
 * Invisible panels are hidden with `display: none` and `aria-hidden`.
 * By either clicking or by using the arrow keys the user changes the
 * selection.
 *
 * If JavaScript is disabled, all panels are shown interleaved with the
 * respective tabs. The tabs now function as headings.
 */
/**
 * `TabPanel` is a container element for tabs and panels.
 *
 * Tabs have the `aria-role=tab` attribute and the ID of the associated panel
 * in the `aria-controls` attribute. The selected tab has the `.selected` class.
 *
 * Panels have the `aria-role=tabpanel` attribute.
 */
class TabPanel extends HTMLElement {

  /**
   * The constructor hooks up the event handlers. Since only events on the
   * element itself are handled, this can take place in the constructor.
   */
  constructor() {
    super();
    // For accessibility, the element needs to do some manual input
    // event handling.
    this.addEventListener('keydown', this._handleKeyDown.bind(this));
    this.addEventListener('click', this._handleClick.bind(this));
  }

  /**
   * `connectedCallback` groups tabs and panels by reordering and makes sure
   * exactly one tab is active.
   */
  connectedCallback() {
    // Acquire all tabs and panels inside the element
    const tabs = Array.from(this.querySelectorAll('[aria-role=tab]'));
    const panels = Array.from(this.querySelectorAll('[aria-role=tabpanel]'));
    // If there are no tabs, there is no way to switch between panels. Abort.
    if (tabs.length === 0) return;

    // For progressive enhancement, the markup should alternate between tabs
    // and panels. If JavaScript is disabled, all panels are
    // visible with their respective tab right above them.
    // If JavaScript is enabled, the element reorders all children into
    // their two groups. First all the tabs, then all the panels.
    // Calling `appendChild` on an already inserted element _moves_ the
    // element to the last child position.
    tabs.forEach(tab => this.appendChild(tab));
    panels.forEach(panel => this.appendChild(panel));

    // The element checks if any of the tabs have been marked as selected. If
    // not, the first tab is now selected.
    const selectedTab =
      tabs.find(e => e.getAttribute('aria-selected') === 'true') || tabs[0];

    // Next, we switch to the selected tab. `selectTab` takes care of marking
    // all other tabs as deselected and hiding all other panels.
    this._selectTab(selectedTab);
  }

  /**
   * `reset` marks all tabs as deselected and hides all the panels.
   */
  reset() {
    const tabs = Array.from(this.querySelectorAll('[aria-role=tab]'));
    const panels = Array.from(this.querySelectorAll('[aria-role=tabpanel]'));

    tabs.forEach(tab => {
      tab.classList.remove('selected');
      tab.setAttribute('tabindex', '-1');
      tab.setAttribute('aria-selected', 'false');
    });

    panels.forEach(panel => {
      panel.classList.add('hidden');
      panel.setAttribute('aria-hidden', 'true');
    });
  }

  /**
   * `selectTab` marks the given tab as selected.
   * Additionally, it unhides the panel corresponding to the given tab.
   */
  _selectTab(newTab) {
    // Deselect all tabs and hide all panels.
    this.reset();

    const panels = Array.from(this.querySelectorAll('[aria-role=tabpanel]'));
    // Get the panel that corresponds to the given tab.
    const newPanelId = newTab.getAttribute('aria-controls');
    const newPanel = panels.find(panel => panel.id === newPanelId);
    // If that panel doesn’t exist, abort.
    if (!newPanel) throw new Error(`No panel with id ${newPanelId}`);

    // Unhide the panel and mark the tab as active.
    newPanel.classList.remove('hidden');
    newPanel.setAttribute('aria-hidden', 'false');

    newTab.classList.add('selected');
    newTab.setAttribute('aria-selected', 'true');
    newTab.setAttribute('tabindex', '0');
    newTab.focus();
  }

  /**
   * `_handleKeyDown` handles key presses inside the tab panel.
   */
  _handleKeyDown(event) {
    // If the keypress did not originate from a tab element itself,
    // it was a keypress inside the a panel or on empty space. Nothing to do.
    if (event.target.getAttribute('aria-role') !== 'tab') return;
    // TODO: Why are we skipping on alt?
    if (event.altKey) return;

    let newIdx;
    let newTab;
    const tabs = Array.from(this.querySelectorAll('[aria-role=tab]'));

    // The switch-case will determine which tab should be marked as active
    // depending on the key that was pressed.
    switch (event.keyCode) {
      // When up or left is pressed, the previous tab is selected. If the
      // first tab is reached, the element loops around to the last tab.
      case 37: // 'ArrowLeft':
      case 38: // 'ArrowUp':
        newIdx =
          tabs.findIndex(panel => panel.classList.contains('selected')) - 1;
        newTab = tabs[(newIdx + tabs.length) % tabs.length];
        break;

      // Same goes for right and down, but in the other direction.
      case 39: // 'ArrowRight':
      case 40: // 'ArrowDown':
        newIdx =
          tabs.findIndex(panel => panel.classList.contains('selected')) + 1;
        newTab = tabs[(newIdx + tabs.length) % tabs.length];
        break;

      // The home button always selects the first tab.
      case 36: // 'Home':
        newTab = tabs[0];
        break;

      // And end always selects the last one.
      case 35: // 'End':
        newTab = tabs[tabs.length - 1];
        break;
      // Any other key press is ignored and passed back to the browser.
      default:
        return;
    }
    // Select the new tab, that has been determined in the switch-case.
    this._selectTab(newTab);
    // The browser might have some native functionality bound to the arrow
    // keys. Prevent the browser from taking any actions.
    event.preventDefault();
  }

  /**
   * `_handleClick` handles clicks inside the tab panel.
   */
  _handleClick(event) {
    // If the click was not targeted on a tab element itself,
    // it was a click inside the a panel or on empty space. Nothing to do.
    if (!event.target.getAttribute('aria-role', 'tab')) return;
    // If it was on a tab element, though, select that tab.
    this._selectTab(event.target);
  }
}

window.customElements.define('dash-tab-panel', TabPanel);
