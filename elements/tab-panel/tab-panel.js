/**
 * TabPanel is a container for tabs and panels associated with these tabs.
 * Activating tab makes the associated panel visible, while the rest 
 * remains invisible.
 * 
 * Tabs have the `aria-role=tab` attribute and the ID of the associated panel
 * in the `aria-controls` attribute.
 * 
 * Panels have the `aria-role=tabpanel` attribute.
 */
class TabPanel extends HTMLElement {
  // For accessibility, the element needs to do some manual input 
  // event handling.
  constructor() {
    super();
    this.addEventListener('keydown', this._handleKeyDown.bind(this));
    this.addEventListener('click', this._handleClick.bind(this));
  }

  /**
   * connectedCallback is a life cycle callback defined by CustomElements v1
   * that gets called when an instance of the element gets inserted into the DOM.
   */
  connectedCallback() {
    const tabs = Array.from(this.querySelectorAll('[aria-role=tab]'));
    const panels = Array.from(this.querySelectorAll('[aria-role=tabpanel]'));
    if (tabs.length === 0) return;

    // It is recommended to interleave tabs and tab panels in the markup for 
    // progressive enhancement. If JavaScript is disabled, all panels are 
    // visible with their respective tab right above them.
    // For that reason, the element reorders all children into
    // two groups. The first group is the tabs, the second group is the panels.
    tabs.forEach(tab => this.appendChild(tab));
    panels.forEach(panel => this.appendChild(panel));
    
    // The element checks if any of the tabs have been marked as selected. If 
    // not, the first tab is declared as selected.
    const selectedTab = tabs.find(e => e.getAttribute('aria-selected') === 'true') || tabs[0];

    // Next, all tabs are marked as deselected and all panels are marked as hidden.
    // Then, the elements marks the selected tab as, well, selected and makes 
    // the corresponding tabpanel visible.
    this.switchTabs(selectedTab);
  }

  /**
   * reset marks all tabs as deselected and hides all teh panels.
   */
  reset() {
    const tabs = Array.from(this.querySelectorAll('[aria-role=tab]'));
    const panels = Array.from(this.querySelectorAll('[aria-role=tabpanel]'));

    tabs.forEach(tab => {
      tab.classList.remove('selected', 'focus');
      tab.setAttribute('tabindex', '-1')
      tab.setAttribute('aria-selected', 'false'); 
    });

    panels.forEach(panel => {
      panel.classList.add('hidden');
      panel.setAttribute('aria-hidden', 'true');
    });
  }

  /**
   * switchTabs deselectes the current tab and marks the given tab as active.
   * Additionally, it hides the current panel and unhides the panel 
   * corresponding to the given tab.
   */
  switchTabs(newTab) {
    this.reset();

    const panels = Array.from(this.querySelectorAll('[aria-role=tabpanel]'));
    const newPanelId = newTab.getAttribute('aria-controls');
    const newPanel = panels.find(panel => panel.id === newPanelId);
    if (!newPanel) throw new Error(`No panel with id ${newPanelId}`);

    newPanel.classList.remove('hidden');
    newPanel.setAttribute('aria-hidden', 'false');

    newTab.classList.add('selected');
    newTab.setAttribute('aria-selected', 'true');
    newTab.setAttribute('tabindex', '0');
    newTab.focus();
  }

  /**
   * HandleKeyDown handles key presses inside the tab panel.
   */
  _handleKeyDown(event) {
    // If the keypress did not originate from a tab, the element does nothing.
    if (event.target.getAttribute('aria-role') !== 'tab') return;
    // TODO: Why are we skipping on alt?
    if (event.altKey) return;

    let newIdx, newTab;
    const tabs = Array.from(this.querySelectorAll('[aria-role=tab]'));

    switch (event.keyCode) {
      // When up or left is pressed, the previous tab is selected. If the
      // first tab is reached, the element loops around to the last tab.
      case 37: // 'ArrowLeft':
      case 38: // 'ArrowUp':
        // Find the index of the selected tab and subtract one.
        newIdx = tabs.findIndex(panel => panel.classList.contains('selected')) - 1;
        newTab = tabs[(newIdx + tabs.length) % tabs.length];
        break;

      // Same goes for right and down, but in the other direction.
      case 39: // 'ArrowRight':
      case 40: // 'ArrowDown':
        newIdx = tabs.findIndex(panel => panel.classList.contains('selected')) + 1;
        newTab = tabs[(newIdx + tabs.length) % tabs.length];
        break;
      
      // The home button will always select the first tab.
      case 36: // 'Home':
        newTab = tabs[0];
        break;

      // And end will always select the last one.
      case 35: // 'End':
        newTab = tabs[tabs.length - 1];
        break;
      default:
        return;
    }
    this.switchTabs(newTab);
    event.preventDefault();
    return false;
  }

  /**
   * handleClick handles clicks inside the tab panel.
   */
  _handleClick(event) {
    // If the click was not targeted on a tab, the element does nothing.
    if (!event.target.getAttribute('aria-role', 'tab')) return;
    this.switchTabs(event.target)
  }
}

window.customElements.define('tab-panel', TabPanel);