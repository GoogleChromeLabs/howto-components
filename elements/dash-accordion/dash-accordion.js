/**
 * Accordions are a pattern to limit visible content by separating
 * it into multiple panels. Any panel can be expanded or collapsed, giving
 * the user control over which content is visible.
 *
 * By either clicking or by using the arrow keys the user changes the
 * selection of the active heading. With enter or space the active headings
 * can be toggled between expanded and collapsed state.
 *
 * If JavaScript is disabled, all panels are shown interleaved with the
 * respective headings.
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
    SPACE: 32,
    ENTER: 13,
  };

  /**
   * `DashAccordion` is a container element for headings and panels.
   *
   * All children of `<dash-accordion>` should be either
   * `<dash-accordion-heading>` or `<dash-accordion-panel>`. This element is
   * stateless, meaning that no values are cached and therefore, changes during
   * runtime are incorporated.
   */
  class DashAccordion extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      // The headings emit elements depending on how they get interacted with.
      this.addEventListener('accordion-expand', this._onAccordionExpand);
      this.addEventListener('accordion-collapse', this._onAccordionCollapse);
      this.addEventListener('accordion-previous', this._onAccordionPrevious);
      this.addEventListener('accordion-next', this._onAccordionNext);
      this.addEventListener('accordion-first', this._onAccordionFirst);
      this.addEventListener('accordion-last', this._onAccordionLast);

      // Before the elements starts booting, it waits for
      // the both `<dash-accordion-heading>` and `<dash-accordion-panel>` to
      // load.
      Promise.all([
        customElements.whenDefined('dash-accordion-heading'),
        customElements.whenDefined('dash-accordion-panel'),
      ]).then(_ => {
        // Acquire all headings and panels inside the element
        const headings = this._allHeadings();
        const panels = this._allPanels();
        // If there are no headings, there is no way to activate panels.
        // Abort.
        if (headings.length === 0) return;

        // Give each panel a `aria-labelledby` attribute that refers to the
        // heading that controls it.
        headings.forEach(heading => {
          const panel = this._panelForHeading(heading);
          if(panel)
            panel.setAttribute('aria-labelledby', heading.id);
          else
            console.warn(`Heading #${heading.id} does not have a valid panel` +
            'associated with it.');
        });

        // Set all the panels to the collapsed state. This is done directly
        // (and not using `_collapsePanel()`) to skip the animation.
        panels.forEach(panel => {
          panel.classList.remove('expanded');
          panel.classList.add('collapsed');
          panel.setAttribute('aria-hidden', 'true');
        });
        // Check if any of the headings have been marked as
        // expanded. If so, all the associated panels get expanded.
        headings
          .filter(heading =>
            heading.getAttribute('aria-expanded') === 'true')
          .forEach(heading => {
            const panel = this._panelForHeading(heading);
            this._expandPanel(panel);
          });
      });
    }

    /**
     * `disconnectedCallback` removes all the event listeners that
     * `connectedCallback` added.
     */
    disconnectedCallback() {
      this.removeEventListener('accordion-expand', this._onAccordionExpand);
      this.removeEventListener('accordion-collapse', this._onAccordionCollapse);
      this.removeEventListener('accordion-previous', this._onAccordionPrevious);
      this.removeEventListener('accordion-next', this._onAccordionNext);
      this.removeEventListener('accordion-first', this._onAccordionFirst);
      this.removeEventListener('accordion-last', this._onAccordionLast);
    }

    /**
     * `_allPanels` returns all the panels in the accordion. This function could
     * memoize the result if the DOM queries ever become a performance issue.
     * The downside of memoization is that dynamically added headings and panels
     * will not be handled.
     *
     * This is a method and not a getter, because a getter implies that it is
     * cheap to read.
     */
    _allPanels() {
      return Array.from(this.querySelectorAll('dash-accordion-panel'));
    }
    /**
     * `_allHeadings` returns all the headings in the accordion.
     */
    _allHeadings() {
      return Array.from(this.querySelectorAll('dash-accordion-heading'));
    }

    /**
     * `_panelForHeading` returns the panel that the given heading controls.
     */
    _panelForHeading(heading) {
      const panelId = heading.getAttribute('aria-controls');
      return this.querySelector(`#${panelId}`);
    }

    /**
     * `_prevHeading` returns the heading that comes before the currently
     * selected one, wrapping around when reaching the first one.
     */
    _prevHeading() {
      const headings = this._allHeadings();
      // Use `findIndex` to find the index of the currently
      // selected element and subtracts one to get the index of the previous
      // element.
      let newIdx =
        headings.findIndex(headings => headings === document.activeElement) - 1;
      // Add `headings.length` to make sure the index is a positive number
      // and get the modulus to wrap around if necessary.
      return headings[(newIdx + headings.length) % headings.length];
    }

    /**
     * `_nextHeading` gets the heading that comes after the currently selected
     * one, wrapping around when reaching the last heading.
     */
    _nextHeading() {
      const headings = this._allHeadings();
      let newIdx =
        headings.findIndex(heading => heading === document.activeElement) + 1;
      return headings[newIdx % headings.length];
    }

    /**
     * `_firstHeading` returns the first heading.
     */
    _firstHeading() {
      const headings = this._allHeadings();
      return headings[0];
    }

    /**
     * `_lastHeading` returns the last heading.
     */
    _lastHeading() {
      const headings = this._allHeadings();
      return headings[headings.length - 1];
    }

    /**
     * Event handler for the `accordion-expand` event. The handler expands
     * the panel that is associated with the heading the even originated from.
     */
    _onAccordionExpand(event) {
      const heading = event.target;
      const panel = this._panelForHeading(heading);
      heading.setAttribute('aria-expanded', 'true');
      this._expandPanel(panel);
    }

    /**
     * Event handler for the `accordion-collapse` event. The handler collapses
     * the panel that is associated with the heading the even originated from.
     */
    _onAccordionCollapse(event) {
      const heading = event.target;
      const panel = this._panelForHeading(heading);
      heading.setAttribute('aria-expanded', 'false');
      this._collapsePanel(panel);
    }

    /**
     * Event handler for the `accordion-previous` event. Focuses the previous
     * heading.
     */
    _onAccordionPrevious() {
      this._prevHeading().focus();
    }

    /**
     * Event handler for the `accordion-next` event. Focuses the next
     * heading.
     */
    _onAccordionNext() {
      this._nextHeading().focus();
    }

    /**
     * Event handler for the `accordion-first` event. Focuses the first
     * heading.
     */
    _onAccordionFirst() {
      this._firstHeading().focus();
    }

    /**
     * Event handler for the `accordion-last` event. Focuses the last
     * heading.
     */
    _onAccordionLast() {
      this._lastHeading().focus();
    }

    /**
     * `_expandPanel` expands the given panel.
     */
    _expandPanel(panel) {
      panel.setAttribute('aria-hidden', 'false');
      panel.classList.add('expanded');
      panel.classList.remove('collapsed');
    }

    /**
     * `_collapsePanel` collapses the given panel.
     */
    _collapsePanel(panel) {
      panel.setAttribute('aria-hidden', 'true');
      panel.classList.remove('expanded');
      panel.classList.add('collapsed');
    }
  }
  window.customElements.define('dash-accordion', DashAccordion);

  // `dashAccordionHeadingCounter` counts the number of
  // `<dash-accordion-heading>` instances created. The
  // number is used to generated new, unique IDs.
  let dashAccordionHeadingCounter = 0;
  /**
   * `DashAccordionHeading` is a heading for a `<dash-accordion>`.
   * `<dash-accordion-heading>` should always be used with `role=heading` in the
   * markup so that the semantics remain useable when JavaScript is failing.
   *
   * A `<dash-accordion-heading>` declares which `<dash-accordion-panel>` it
   * belongs to by using that panel’s ID as the value for the `aria-controls`
   * attribute.
   *
   * A `<dash-accordion-heading>` will automatically generate a unique ID if
   * none is specified.
   */
  class DashAccordionHeading extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      // In contrast to `<dash-tabs>`, the children handle the input events.
      this.addEventListener('keydown', this._onKeyDown);
      this.addEventListener('click', this._onClick);

      this.setAttribute('role', 'heading');
      // The WAI-ARIA best practices prescribe a button inside the heading. To
      // keep the markup simple, `<dash-accordion-heading>` behaves like a
      // button instead by being focusable and reacting to enter and space.
      this.tabIndex = 0;

      // If this element doesn’t have an id, generate one.
      if (!this.id)
        this.id =
          `dash-accordion-heading-generated-${dashAccordionHeadingCounter++}`;
      if (!this.getAttribute('aria-controls'))
        console.warn(`The heading #${this.id} has no aria-controls attribute`);
    }

    /**
     * `isExpanded` is a getter to query if the associated panel is expanded
     * or collpased.
     */
    get isExpanded() {
      return this.getAttribute('aria-expanded') === 'true';
    }

    /**
     * `_displayToggleEvent` emits either a `accordion-collapse` or an
     * `accordion-expand` event depending on the current state.
     */
    _dispatchToggleEvent() {
      if (this.isExpanded)
        this.dispatchEvent(
          new CustomEvent('accordion-collapse', {bubbles: true})
        );
      else
        this.dispatchEvent(
          new CustomEvent('accordion-expand', {bubbles: true})
        );
    }

    /**
     * Event handle for the `keydown` event.
     */
    _onKeyDown(event) {
      // Don’t handle modifier shortcuts typically used by assistive technology.
      if (event.altKey) return;

      switch (event.keyCode) {
        case KEYCODE.SPACE:
        case KEYCODE.ENTER:
          this._dispatchToggleEvent();
          break;
        case KEYCODE.LEFT:
        case KEYCODE.UP:
          this.dispatchEvent(
            new CustomEvent('accordion-previous', {bubbles: true})
          );
          break;

        case KEYCODE.RIGHT:
        case KEYCODE.DOWN:
          this.dispatchEvent(
            new CustomEvent('accordion-next', {bubbles: true})
          );
          break;

        case KEYCODE.HOME:
          this.dispatchEvent(
            new CustomEvent('accordion-first', {bubbles: true})
          );
          break;

        case KEYCODE.END:
          this.dispatchEvent(
            new CustomEvent('accordion-last', {bubbles: true})
          );
          break;
        // Any other key press is ignored and passed back to the browser.
        default:
          return;
      }

      // The browser might have some native functionality bound to the arrow
      // keys, home or end. The element calls `preventDefault` to prevent the
      // browser from taking any actions.
      event.preventDefault();
    }

    /**
     * Event handler for `click` event.
     */
    _onClick() {
      this._dispatchToggleEvent();
    }
  }
  window.customElements.define('dash-accordion-heading', DashAccordionHeading);

  /**
   * `DashAccordionPanel` is a panel for a `<dash-accordion>`.
   */
  class DashAccordionPanel extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.setAttribute('role', 'region');
      this.setAttribute('aria-hidden', 'true');
      if (!this.id)
        console.warn('An accordion panel without an ID' +
          'will never be activated');
    }
  }
  window.customElements.define('dash-accordion-panel', DashAccordionPanel);
})();


