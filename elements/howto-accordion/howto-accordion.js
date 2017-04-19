/**
 * Accordions are a pattern to limit visible content by separating
 * it into multiple panels. Any panel can be expanded or collapsed, giving
 * the user control over which content is visible.
 *
 * By either clicking or by using the arrow keys the user changes the
 * selection of the active heading. With enter or space the active headings
 * can be toggled between expanded and collapsed state.
 *
 * The headings and the panels have the classes `expanded` or `collapsed`
 * assigned to them depending on their state.
 *
 * All panels should be styled to be visible if JavaScript is disabled.
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

  // `idCounter` counts the number of IDs generated and is used to generated
  // new, unique IDs.
  let idCounter = 0;

  /**
   * `HowtoAccordion` is a container element for headings and panels.
   *
   * Each heading must be a `<howto-accordion-heading>`, Panels can be any
   * element, but must be adjacent to a heading.
   */
  class HowtoAccordion extends HTMLElement {
    constructor() {
      super();
    }

    /**
     * `connectedCallback` gives unique IDs to all panels and headings, so it
     * can then make headings and panels reference each other using
     * `aria-controls` and `aria-labelledby`. Lastly, it considers the `expand`
     *  attribute on the headers and adjusts the styling accordingly.
     */
    connectedCallback() {
      // `<howto-accordion-headers>` emit a custom event when the heading was
      // instructed to expand. The custom event is a nice abstraction expansion
      // can be triggered by clicks, keyboard input and attribute and property
      // changes alike.
      this.addEventListener('howto-change', this._onHowtoChange);
      // The element also implements roving tab index to switch focus between
      // the headers. Therefore key presses are intercepted.
      this.addEventListener('keydown', this._onKeyDown);

      // Acquire all headings and panels inside the element that need to be
      // set up.
      const headings = this._allHeadings();
      const panels = this._allPanels();

      // Give all headings and panels a unique ID. Set up `aria-controls` and
      // `aria-labelledby` attributes on headings and panels using those IDs.
      headings.forEach(heading => {
        // All buttons inside the `HowtoAccordionHeadings` are made unfocusable
        // here. Only the first heading will be made focusable afterwards.
        // This is necessary to implement roving tab index.
        heading.querySelector('button').setAttribute('tabindex', -1);
        const panel = this._panelForHeading(heading);

        // Headings and panels need an ID so they can reference each other
        // with the `aria-labelledby` and `aria-controls` attributes.
        if (!heading.id)
          heading.id = `howto-accordion-generated-${idCounter++}`;
        if (!panel.id)
          panel.id = `howto-accordion-generated-${idCounter++}`;
        heading.setAttribute('aria-controls', panel.id);
        panel.setAttribute('aria-labelledby', heading.id);

        // Assign the appropriate roles to panels. Headings are custom elements
        // and set their role in their own `connectedCallback`.
        if (!panel.hasAttribute('role'))
          panel.setAttribute('role', 'region');
      });
      // Make the first heading focusable.
      headings[0].querySelector('button').setAttribute('tabindex', 0);

      // Set all the panels to the collapsed state to have a well-defined
      // initial state.

      // Check if any of the headings have been marked as
      // expanded using the `expanded` attribute. If so, all the associated
      // panels get expanded as well. The heading’s `expand` attribute is only
      // available after the element’s has booted.
      customElements.whenDefined('howto-accordion-heading')
        .then(_ => {
          headings
            .forEach(heading => {
              const panel = this._panelForHeading(heading);
              if(!heading.expanded) {
                this._collapseHeading(heading);
                this._collapsePanel(panel);
              } else {
                this._expandHeading(heading);
                this._expandPanel(panel);
              }
            });
        });
    }

    /**
     * `disconnectedCallback` removes all the event listeners that
     * `connectedCallback` added.
     */
    disconnectedCallback() {
      this.removeEventListener('howto-change', this._onHowtoChange);
      this.removeEventListener('keydown', this._onKeyDown);
    }

    /**
     * `_isHeading` returns true if the given element
     * is a `<howto-accordion-heading>`.
     */
    _isHeading(elem) {
      return elem.tagName === 'HOWTO-ACCORDION-HEADING';
    }

    /**
     * `_onHowtoChange` handles the custom `howto-change` event. The event’s
     * target is the heading that has been instructed to expand (by click,
     * keyboard input or by changing the `expanded` attribute or property).
     */
    _onHowtoChange(event) {
      const heading = event.target;
      const panel = this._panelForHeading(heading);
      if(event.detail.isExpandedNow)
        this._expand(heading, panel);
      else
        this._collapse(heading, panel);
    }

    /**
     * `_onKeyDown` handles key presses inside the accordion.
     */
    _onKeyDown(event) {
      // If the keypress originated while a button inside a
      // `<howto-accordion-heading>` was focused, the parent element should
      // be a heading.
      const currentHeading = event.target.parentElement;
      // If this element is not a heading, the keypress originated from inside
      // a panel or empty space. Nothing to do.
      if (!this._isHeading(currentHeading)) return;
      // Don’t handle modifier shortcuts typically used by assistive technology.
      if (event.altKey) return;

      // The switch-case will determine which heading should be focused next
      // depending on the key that was pressed.
      let newHeading;
      switch (event.keyCode) {
        case KEYCODE.LEFT:
        case KEYCODE.UP:
          newHeading = this._prevHeading();
          break;

        case KEYCODE.RIGHT:
        case KEYCODE.DOWN:
          newHeading = this._nextHeading();
          break;

        case KEYCODE.HOME:
          newHeading = this._firstHeading();
          break;

        case KEYCODE.END:
          newHeading = this._lastHeading();
          break;
        // Any other key press is ignored and passed back to the browser.
        default:
          return;
      }

      // The browser might have some native functionality bound to the arrow
      // keys, home or end. The element calls `preventDefault` to prevent the
      // browser from taking any actions.
      event.preventDefault();
      // Make the currently focused heading unfocusable, then make the new
      // heading focusable and give focus to it.
      currentHeading.querySelector('button').setAttribute('tabindex', -1);
      const newButton = newHeading.querySelector('button');
      newButton.setAttribute('tabindex', 0);
      newButton.focus();
    }

    /**
     * `_allPanels` returns all the panels in the accordion. This function could
     * memoize the result if the DOM queries ever become a performance issue.
     * The downside of memoization is that dynamically added headings and panels
     * will not be handled.
     *
     * This is a method and not a getter, because a getter implies that it is
     * cheap to read while this method queries the DOM on every call.
     */
    _allPanels() {
      return Array.from(this.querySelectorAll('howto-accordion-heading + *'));
    }

    /**
     * `_allHeadings` returns all the headings in the accordion.
     */
    _allHeadings() {
      return Array.from(this.querySelectorAll('howto-accordion-heading'));
    }

    /**
     * `_panelForHeading` returns the panel that the given heading controls.
     */
    _panelForHeading(heading) {
      return heading.nextElementSibling;
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
        headings.findIndex(headings =>
          headings === document.activeElement.parentElement) - 1;
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
        headings.findIndex(heading =>
          heading === document.activeElement.parentElement) + 1;
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
     * `_expandPanel` puts the given panel in the expanded state, without any
     * animation.
     */
    _expandPanel(panel) {
      panel.setAttribute('aria-hidden', 'false');
      panel.classList.remove('collapsed');
      panel.classList.add('expanded');
    }

    /**
     * `_expandHeading` puts the given heading in the expanded state, without
     * any animation.
     */
    _expandHeading(heading) {
      heading.setAttribute('aria-expanded', 'true');
      heading.classList.add('expanded');
    }

    /**
     * `_expand` expands both the given heading and panel using an animation.
     */
    _expand(heading, panel) {
      // Put both the heading and the panel in the expanded state immediately.
      // The animation function will hide the panel.
      this._expandHeading(heading);
      this._expandPanel(panel);

      this._animateIn(panel);
    }

    _collapsePanel(panel) {
      panel.setAttribute('aria-hidden', 'true');
      panel.classList.remove('expanded');
      panel.classList.add('collapsed');
    }

    _collapseHeading(heading) {
      heading.setAttribute('aria-expanded', 'false');
      heading.classList.remove('expanded');
    }

    _collapse(heading, panel) {
      // Only put the heading in the collapsed state. The collapsed styles
      // for the panel might remove it from the DOM, so the animation needs to
      // finish first.
      this._collapseHeading(heading);

      this._animateOut(panel)
        .then(_ => {
          this._collapsePanel(panel);
        });
    }

    /**
     * `_animateIn` determines the height of the panel and uses that value for
     * an expanding animation.
     */
    _animateIn(panel) {
      const height = panel.getBoundingClientRect().height;
      return this._animate(panel, -height, 0);
    }

    /**
     * Same as `_animateIn` but in the other direction.
     */
    _animateOut(panel) {
      const height = panel.getBoundingClientRect().height;
      return this._animate(panel, 0, -height);
    }

    /**
     * `_animate` animates a translation on the Y axis from one offset to
     * another. It takes care of promoting all the elements, making sure they
     * will be painted in the right order during animation and cleans up
     * afterwards.
     */
    _animate(panel, startOffset, endOffset) {
      // If start and end are the same there is nothing to do. The reason for
      // explicitly handling this case is that this method waits for an
      // `transitionend` event which won’t fire if there is no animation.
      if(startOffset === endOffset) return Promise.resolve();
      // Turn the list of children into a proper array with all the helper
      // functions defined on it.
      const children = Array.from(this.children);
      // Find the index of the panel that is being animated.
      const idx = children.indexOf(panel);
      // Only that panel and all the headings and panels _after_ the given panel
      // need to be animated.
      const animatedChildren = children.slice(idx);

      // Some children will be translated
      // beyond the top of the element and might end up being visible above the
      // element. Switch the `<howto-accordion>` element to `overflow: hidden`
      // to prevent that.
      this.style.overflow = 'hidden';
      // Switch all children to `position: relative` so that the element
      // has full control over paint order using `z-index`.
      children.forEach(child => {
        child.style.position = 'relative';
        // All children _before_ the animated ones need to be painted _over_
        // all the animated children. Therefore, set all children to
        // `z-index: 2` and set all the animated children to `z-index: 1` next.
        child.style.zIndex = 2;
      });

      // Set `z-index: 1` on all animated children translate them to the
      // start position. Because this function uses a CSS transition we don’t
      // need to use `will-change`.
      animatedChildren.forEach(child => {
        child.style.position = 'relative';
        child.style.zIndex = 1;
        child.style.transform = `translateY(${startOffset}px)`;
      });

      // Wait a frame for all the styles to take effect.
      return requestAnimationFramePromise()
        .then(_ => {
          // Set up the CSS transition on all the children and set them to
          // their end position.
          animatedChildren.forEach(child => {
            child.style.transform = `translateY(${endOffset}px)`;
            child.classList.add('animating');
          });
          // Wait for the transition to end.
          return transitionEndPromise(panel);
        })
        .then(_ => {
          // Clean up all the temporary styles
          animatedChildren.forEach(child => {
            child.style.transform = '';
            child.classList.remove('animating');
          });
          children.forEach(child => {
            child.style.position = '';
            child.style.zIndex = '';
          });
          this.style.overflow = '';
        });
    }
  }
  window.customElements.define('howto-accordion', HowtoAccordion);

  /**
   * `HowtoAccordionHeading` is the element for the headings in the accordion.
   * Accordion to the WAI ARIA Best Practices, each heading needs to wrap a
   * `<button>`. This element dispatches a `howto-accordion-toggle` event when
   * it is supposed to expand.
   *
   * Click the button or pressing space or enter while the button has focus
   * will expand the button. Changing the `expand` attribute or property will
   * also cause the heading to expand.
   */
  class HowtoAccordionHeading extends HTMLElement {
    // The element reacts to changes to the `expanded` attribute.
    static get observedAttributes() {
      return ['expanded'];
    }

    constructor() {
      super();

      // Binding event handlers to `this` ensures that `this` inside the event
      // handler will always be the `<howto-accordion-heading>`, even the
      // handler is hooked up to other elements.
      this._onClick = this._onClick.bind(this);
    }

    /**
     * `connectedCallback()` sets up the role, event handler and initial state.
     */
    connectedCallback() {
      if(!this.hasAttribute('role'))
        this.setAttribute('role', 'heading');
      this.querySelector('button').addEventListener('click', this._onClick);
      this._expanded = this.hasAttribute('expanded');
    }

    /**
     * `disconnectedCallback` cleans up the event handlers set up in
     * `connectedCallback`.
     */
    disconnectedCallback() {
      this.querySelector('button').removeEventListener('click', this._onClick);
    }

    /**
     * `attributeChangedCallback` processes changes to the `expanded` attribute.
     */
    attributeChangedCallback(name) {
      // `expanded` is a boolean attribute it is either set or not set. The
      // actual value is irrelevant.
      const value = this.hasAttribute('expanded');
      // The setter for the `expanded` property contains all the logic.
      if(this.expanded !== value) this.expanded = value;
    }

    /**
     * This function sets an attribute if and only if the value has changed.
     * This is needed to avoid an infinite update loop on the `expanded`
     * attribute.
     */
    _safelySetAttribute(attr, value) {
      if (value && !this.hasAttribute(attr)) {
          this.setAttribute(attr, '');
          return;
      }
      if (!value && this.hasAttribute(attr)) {
        this.removeAttribute(attr);
        return;
      }
    }

    get expanded() {
      return this._expanded;
    }

    /**
     * The setter for `expanded` dispatches the `howto-change` events if
     * appropriate.
     */
    set expanded(value) {
      // Properties can be set to all kinds of string values. This makes sure
      // it’s converted to a proper boolean value using JavaScript’s truthiness
      // & falsiness principles.
      value = Boolean(value);
      // If this conversion ends up giving the same value as before, don’t do
      // anything.
      if(this._expanded === value) return;

      this._expanded = value;
      this._safelySetAttribute('expanded', value);
      this.dispatchEvent(
        new CustomEvent('howto-change', {
          detail: {isExpandedNow: value},
          bubbles: true,
        })
      );
    }

    /**
     * `_onClick` is the event handler for a click. A click toggles the expanded
     * and the collapsed state.
     */
    _onClick() {
      this.expanded = !this.expanded;
    }
  }
  window.customElements
    .define('howto-accordion-heading', HowtoAccordionHeading);

  // These functions help make animations easier.
  // Read https://dassur.ma/things/raf-promise/ for more details.
  function transitionEndPromise(element) {
    return new Promise(resolve => {
      element.addEventListener('transitionend', function f() {
        element.removeEventListener('transitionend', f);
        resolve();
      });
    });
  }

  function requestAnimationFramePromise() {
    return new Promise(resolve => requestAnimationFrame(resolve));
  }
})();


