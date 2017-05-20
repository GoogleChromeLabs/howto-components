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

  /**
   * `HowtoAccordion` is a container element for headings and panels.
   *
   * Each heading must be a `<howto-accordion-heading>`. Each panel must be a
   * `<howto-accordion-panel>` and must be adjacent to a heading.
   */
  class HowtoAccordion extends HTMLElement {
    constructor() {
      super();
    }

    /**
     * `connectedCallback` hooks up the even listeners and considers the
     * `expanded` attribute on the headers to adjust their styling accordingly.
     */
    connectedCallback() {
      // `<howto-accordion-headers>` emit a custom event when the heading is
      // instructed to expand.
      this.addEventListener('change', this._onChange);
      // The element also implements [roving tabindex] to switch focus between
      // the headers. Therefore key presses are intercepted.
      //
      // [roving tabindex]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#Technique_1_oving_tabindex
      this.addEventListener('keydown', this._onKeyDown);

      // TODO: Set up MutationObserver to listen for `expanded` attribute on the
      // headings.

      // Wait for `<howto-accordion-heading>` and `<howto-accordion-panel`
      // to have booted before proceeding.
      Promise.all([
        customElements.whenDefined('howto-accordion-heading'),
        customElements.whenDefined('howto-accordion-panel'),
      ])
        .then(_ => {
        // Acquire all headings inside the element that need to be set up.
        const headings = this._allHeadings();

        // Give all headings and panels a unique ID. Set up `aria-controls` and
        // `aria-labelledby` attributes on headings and panels using those IDs.
        headings.forEach(heading => {
          // All buttons inside the `HowtoAccordionHeadings` are made
          // unfocusable here. Only the first heading will be made focusable
          // afterwards. This is necessary to implement roving tabindex.
          heading.setAttribute('tabindex', -1);
          const panel = this._panelForHeading(heading);

          // Make headings and panels reference each other
          // with the `aria-labelledby` and `aria-controls` attributes.
          heading.setAttribute('aria-controls', panel.id);
          panel.setAttribute('aria-labelledby', heading.id);
        });
        // Make the first heading focusable.
        headings[0].setAttribute('tabindex', 0);

        // Set all the panels to the collapsed state to have a well-defined
        // initial state.

        // Check if any of the headings have been marked as
        // expanded using the `expanded` attribute. If so, all the associated
        // panels get expanded as well.
        headings
          .forEach(heading => {
            const panel = this._panelForHeading(heading);
            if (!heading.expanded) {
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
      this.removeEventListener('change', this._onChange);
      this.removeEventListener('keydown', this._onKeyDown);
    }

    /**
     * `_isHeading` returns true if the given element
     * is a `<howto-accordion-heading>`.
     */
    _isHeading(elem) {
      return elem.tagName.toLowerCase() === 'howto-accordion-heading';
    }

    /**
     * `_onChange` handles the `change` event. The event’s
     * target is the heading that has been instructed to expand by click,
     * keyboard input.
     */
    _onChange(event) {
      this._animatePanelForHeading(event.target, event.detail.isExpandedNow);
    }

    /**
     * `_animatePanelForHeading` animates the expansion of a panel, provided
     * there is no other animation running.
     */
    _animatePanelForHeading(heading, expand) {
      // If there’s an animation running, ignore the event.
      if (this.classList.contains('animating'))
        return;
      const panel = this._panelForHeading(heading);
      if (expand) {
        this._expandPanel(panel);
        this._animateIn(panel);
      } else {
        this._animateOut(panel)
          .then(_ => this._collapsePanel(panel));
      }
    }

    /**
     * `_onKeyDown` handles key presses inside the accordion.
     */
    _onKeyDown(event) {
      // If the currently focused element is not a heading, the keypress
      // originated from inside a panel or empty space. Nothing to do.
      const currentHeading = event.target;
      if (!this._isHeading(currentHeading))
        return;
      // Don’t handle modifier shortcuts typically used by assistive technology.
      if (event.altKey)
        return;

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
      currentHeading.setAttribute('tabindex', -1);
      newHeading.setAttribute('tabindex', 0);
      newHeading.focus();
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
      return Array.from(this.querySelectorAll('howto-accordion-panel'));
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
      const next = heading.nextElementSibling;
      if (next.tagName.toLowerCase() !== 'howto-accordion-panel') {
        console.error('Sibling element to a heading need to be a panel.');
        return;
      }
      return next;
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
          headings === document.activeElement) - 1;
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
          heading === document.activeElement) + 1;
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
     * `_expandPanel` puts the given panel in the expanded state.
     */
    _expandPanel(panel) {
      panel.expanded = true;
    }

    /**
     * `_collapsePanel` puts the given panel in the collapsed state.
     */
    _collapsePanel(panel) {
      panel.expanded = false;
    }

    /**
     * `_expandHeading` puts the given heading in the expanded state.
     */
    _expandHeading(heading) {
      heading.expanded = true;
    }

    /**
     * `_collapseHeading` puts the given heading in the collapsed state.
     */
    _collapseHeading(heading) {
      heading.expanded = false;
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
      if (startOffset === endOffset)
        return Promise.resolve();
      // Set the `animating` class on the `<howto-accordion>` element. This
      // discards all further `change` events until the animation is done.
      this.classList.add('animating');
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

      // Wait two frames for all the styles to take effect.
      return requestAnimationFramePromise()
        .then(_ => requestAnimationFramePromise())
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
          this.classList.remove('animating');
        });
    }
  }
  window.customElements.define('howto-accordion', HowtoAccordion);

  // `headingIdCounter` counts the number of IDs generated and is used to
  // generated new, unique IDs.
  let headingIdCounter = 0;

  // To avoid invoking the parser with `.innerHTML` for every new instance, a
  // template for the contents of the ShadowDOM is is shared by all
  // `<howto-accordion>` instances.
  //
  // The WAI ARIA Best Practices demand a button inside the heading. For
  // developer convenience, the button is injected using ShadowDOM and
  // is styled in a way that it is practically invisible. This way the
  // button’s accessible functionality is preserved while still allowing
  // the developer to freely style the headings.
  //
  // Another advantage is focus management. If the button inside ShadowDOM has
  // focus, `document.activeElement` returns the containing
  // `<howto-accordion-heading>` element rather than the button itself.
  const shadowDOMTemplate = document.createElement('template');
  shadowDOMTemplate.innerHTML = `
    <style>
      :host {
        contain: content;
      }
      button {
        display: block;
        background-color: initial;
        border: initial;
        width: 100%;
      }
    </style>
    <button><slot></slot></button>
  `;

  /**
   * `HowtoAccordionHeading` is the element for the headings in the accordion.
   * Accordion to the WAI ARIA Best Practices, each heading needs to wrap a
   * `<button>`. This element puts that element in the ShadowDOM, as it is more
   * convenient to use and doesn’t make server-side rendering or styling more
   *  problematic. This element dispatches a `howto-accordion-change` event when
   * it is supposed to expand.
   *
   * The WAI ARIA Best Practices also recommend setting `aria-level` depending
   * on what level the headings are. It is hard to determine the level of a
   * heading algorithmically and is not strictly necessary to have an accessible
   * accordion. To keep the code more accessible, this element does not set
   * `aria-level` but leaves that to the developer.
   *
   * Clicking the button or pressing space or enter while the button has focus
   * will expand the heading. Changing the `expanded` attribute or property will
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
      // handler will always be the `<howto-accordion-heading>`, even if the
      // handler is hooked up to other elements.
      this._onClick = this._onClick.bind(this);

      // Create an open ShadowDOM mode and delegate focus. That means that the
      // the host element can’t get focus, but elements in the  shadow root can.
      // Note that the `:focus` selector will match on _both_ the host element
      // as well as the focused element in the ShadowDOM.
      this.attachShadow({
        mode: 'open',
        delegatesFocus: true,
      });
      // Import the ShadowDOM template.
      this.shadowRoot.appendChild(
        document.importNode(shadowDOMTemplate.content, true)
      );
      this._shadowButton = this.shadowRoot.querySelector('button');
    }

    /**
     * `connectedCallback()` sets up the role, event handler and initial state.
     */
    connectedCallback() {
      if (!this.hasAttribute('role'))
        this.setAttribute('role', 'heading');
      if (!this.id)
        this.id = `howto-accordion-heading-generated-${headingIdCounter++}`;
      this._shadowButton.addEventListener('click', this._onClick);
      this._shadowButton.setAttribute('aria-expanded', 'false');
    }

    /**
     * `disconnectedCallback` cleans up the event handlers set up in
     * `connectedCallback`.
     */
    disconnectedCallback() {
      this._shadowButton.removeEventListener('click', this._onClick);
    }

    /**
     * `attributeChangedCallback` processes changes to the `expanded` attribute.
     */
    attributeChangedCallback(name) {
      // `expanded` is a boolean attribute it is either set or not set. The
      // actual value is irrelevant.
      const value = this.hasAttribute('expanded');
      this._shadowButton.setAttribute('aria-expanded', value);
    }

    get expanded() {
      return this.hasAttribute('expanded');
    }

    /**
     * Properties and their corresponding attributes should mirror one another.
     * To this effect, the property setter for `expanded` handles truthy/falsy
     * values and reflects those to the state of the attribute. It’s important
     * to note that there are no side effects taking place in the property
     * setter. For example, the setter does not set `aria-expanded`. Instead,
     * that work happens in the `attributeChangedCallback`. As a general rule,
     * make property setters very dumb, and if setting a property or attribute
     * should cause a side effect (like setting a corresponding ARIA attribute)
     * do that work in the `attributeChangedCallback`. This will avoid having to
     * manage complex attribute/property reentrancy scenarios.
     */
    set expanded(value) {
      // Properties can be set to all kinds of string values. This makes sure
      // it’s converted to a proper boolean value using JavaScript’s truthiness
      // & falsiness principles.
      value = Boolean(value);
      if (value)
        this.setAttribute('expanded', '');
      else
        this.removeAttribute('expanded');
    }

    /**
     * `_onClick` is the event handler for a click. A click toggles the expanded
     * and the collapsed state.
     */
    _onClick() {
      this.expanded = !this.expanded;

      // Dispatch an event that signals a request to expand to the
      // `<howto-accordion>` element.
      this.dispatchEvent(
        new CustomEvent('change', {
          detail: {isExpandedNow: this.expanded},
          bubbles: true,
        })
      );
    }
  }
  window.customElements
    .define('howto-accordion-heading', HowtoAccordionHeading);

  // `panelIdCounter` counts the number of IDs generated for panels and is used
  // to generated new, unique IDs.
  let panelIdCounter = 0;

  /**
   * `HowtoAccordionPanel` is the element for the expandable and collapsible
   * content. Accordion to the WAI ARIA Best Practices, each panel should be
   * set the `aria-hidden` attribute to `true` if it is collapsed. This element
   * relies on CSS styles to apply `display: none` to hide it from the
   * accessibility tree instead.
   */
  class HowtoAccordionPanel extends HTMLElement {
    constructor() {
      super();
    }

    /**
     * `connectedCallback()` sets up the role and the ID of the element.
     */
    connectedCallback() {
      if (!this.hasAttribute('role'))
        this.setAttribute('role', 'region');
      if (!this.id)
        this.id = `howto-accordion-panel-generated-${panelIdCounter++}`;
    }

    get expanded() {
      return this.hasAttribute('expanded');
    }

    set expanded(val) {
      const value = Boolean(val);
      if (value)
        this.setAttribute('expanded', '');
      else
        this.removeAttribute('expanded');
    }
  }
  window.customElements
    .define('howto-accordion-panel', HowtoAccordionPanel);


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


