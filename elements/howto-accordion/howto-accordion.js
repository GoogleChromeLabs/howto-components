/**
 * Accordions are a pattern to limit visible content by separating
 * it into multiple panels. Any panel can be expanded or collapsed, giving
 * the user control over which content is visible.
 *
 * By either clicking or by using the arrow keys the user changes the
 * selection of the active heading. With enter or space the active headings
 * can be toggled between expanded and collapsed state.
 *
 * The headings and the panels have the classes `expanded` or `collapsed` assigned to them
 * depending on their state.
 *
 * All panels should be styled to be visible if JavaScript is disabled.
 */
// TODO: Comments, expanded property
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
   * As per the WAI-ARIA best practices, the headings are `<button>`s. Panels
   * can be any element, but must be adjacent to a heading.
   */
  class HowtoAccordion extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.addEventListener('click', this._onClick);
      this.addEventListener('keydown', this._onKeyDown);

      // Acquire all headings and panels inside the element
      const headings = this._allHeadings();
      const panels = this._allPanels();


      // Set up `aria-controls` and `aria-labelledby` on headings and panels.
      headings.forEach(heading => {
        const panel = this._panelForHeading(heading);

        // Headings and panels need an ID so they can cross-reference each other
        // using `aria-labelledby` and `aria-controls`.
        if (!heading.id)
          heading.id = `howto-accordion-generated-${idCounter++}`;
        if (!panel.id)
          panel.id = `howto-accordion-generated-${idCounter++}`;
        heading.setAttribute('aria-controls', panel.id);
        panel.setAttribute('aria-labelledby', heading.id);

        // Assign the appropriate roles to headings and panels.
        if (!heading.hasAttribute('role'))
          heading.setAttribute('role', 'heading');
        heading.setAttribute('tabindex', '-1');
        if (!panel.hasAttribute('role'))
          panel.setAttribute('role', 'region');
      });

      // Set all the panels to the collapsed state to have a well-defined
      // initial state.
      panels.forEach(panel => this._collapsePanel(panel));

      // Check if any of the headings have been marked as
      // expanded. If so, all the associated panels get expanded.
      headings
        .filter(heading => heading.classList.contains('expanded'))
        .forEach(heading => {
          const panel = this._panelForHeading(heading);
          this._expand(heading, panel);
        });
      headings[0].setAttribute('tabindex', '0');
    }

    /**
     * `disconnectedCallback` removes all the event listeners that
     * `connectedCallback` added.
     */
    disconnectedCallback() {
      this.removeEventListener('click', this._onClick);
      this.removeEventListener('keydown', this._onKeyDown);
    }

    _isHeading(elem) {
      return elem.tagName === 'BUTTON' && elem.parentElement === this;
    }

    /**
     * `_onClick` handles clicks inside the accordion. The handler makes sure
     * the click originated from one of the headings before reacting to it.
     */
    _onClick(event) {
      let target = event.target;
      // Climb up the DOM tree.
      while(true) {
        // If the loop ends up at the containing `<howto-accordion>`, the click
        // did not originate on a heading. Abort.
        if (target === this) return;
        // If the loops finds a heading, expand that heading.
        if (this._isHeading(target)) break;
        target = target.parentElement;
      }

      this._toggle(target);
    }

    /**
     * `_onKeyDown` handles key presses inside the accordion.
     */
    _onKeyDown(event) {
      // If the keypress did not originate from heading,
      // it was a keypress inside the a panel or empty space. Nothing to do.
      if (!this._isHeading(event.target)) return;
      // Don’t handle modifier shortcuts typically used by assistive technology.
      if (event.altKey) return;

      // The switch-case will determine which heading should be focused
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
      // Utilizing roving tabindex, make the currently focused heading
      // unfocusable and focus the new heading.
      document.activeElement.setAttribute('tabindex', '-1');
      newHeading.setAttribute('tabindex', '0');
      newHeading.focus();
    }

    /**
     * `_toggle` toggles the state of the given heading and the corresponding
     * panel.
     */
    _toggle(heading) {
      const panel = this._panelForHeading(heading);
      if(heading.classList.contains('expanded'))
        this._collapse(heading, panel);
      else
        this._expand(heading, panel);
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
      return Array.from(this.querySelectorAll('*:not(button)'));
    }

    /**
     * `_allHeadings` returns all the headings in the accordion.
     */
    _allHeadings() {
      return Array.from(this.querySelectorAll('button'));
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
     * `_expandPanel` puts the given panel in the expanded state. This function
     * does not do any animation.
     */
    _expandPanel(panel) {
      panel.setAttribute('aria-hidden', 'false');
      panel.classList.remove('collapsed');
      panel.classList.add('expanded');
    }

    /**
     * `_expandHeading` puts the given heading in the expanded state. This
     * function does not do any animation.
     */
    _expandHeading(heading) {
      heading.setAttribute('aria-expanded', 'true');
      heading.classList.add('expanded');
      heading.classList.remove('collapsed');
    }

    _expand(heading, panel) {
      // This `animation` class is a marker if the element is currently
      // animating. It can be used to change styles if needed but is also
      // used to discard additional expand/collapse commands while the animation
      // is still ongoing.
      this.classList.add('animating');
      this._expandHeading(heading);

      // Wait for next frame for the new styles to get applied.
      requestAnimationFramePromise()
        // Animate the panels and headings to reveal the newly activated panel.
        .then(_ => this._animateIn(panel))
        .then(_ => {
          this.classList.remove('animating');
          this._expandPanel(panel);
        });
    }

    _collapsePanel(panel) {
      panel.setAttribute('aria-hidden', 'true');
      panel.classList.remove('expanded');
      panel.classList.add('collapsed');
    }

    _collapseHeading(heading) {
      heading.setAttribute('aria-expanded', 'false');
      heading.classList.add('collapsed');
      heading.classList.remove('expanded');
    }

    _collapse(heading, panel) {
      this.classList.add('animating');
      this._collapseHeading(heading);

      requestAnimationFramePromise()
        .then(_ => this._animateOut(panel))
        .then(_ => {
          this.classList.remove('animating');
          this._collapsePanel(panel);
        });
    }

    /**
     * `_animateIn` determines the height of the panel and uses that value for
     * the animation.
     */
    _animateIn(panel) {
      panel.classList.remove('collapsed');
      panel.classList.add('expanded');
      const height = panel.getBoundingClientRect().height;
      panel.classList.remove('expanded');

      return this._animate(panel, -height, 0);
    }

    /**
     * Same as `_animateIn` but in the other direction.
     */
    _animateOut(panel) {
      panel.classList.add('expanded');
      const height = panel.getBoundingClientRect().height;
      panel.classList.remove('expanded');

      return this._animate(panel, 0, -height);
    }

    /**
     * `_animate` animates a translation on the Y axis from one offset to
     * another. It takes care of promoting all the elements, making sure they
     * will be painted in the right order during animation and cleans up
     * afterwards.
     */
    _animate(panel, startOffset, endOffset) {
      // Turn the list of children into a proper array with all the helper
      // functions defined on it.
      const children = Array.from(this.children);
      // Find the index of the panel that is being animated.
      const idx = children.indexOf(panel);
      // Only that panel and all the headings and panels _after_ the given panel
      // need to be animated.
      const animatedChildren = children.slice(idx);

      // All following styles are only set for the duration of the animation.

      // `<dash-accordion>` will be switched to `overflow: hidden`.
      // Some children will be translated
      // to the top of the page and might peek out behind the first heading
      // without this attribute.
      this.style.overflow = 'hidden';
      // All children will be set to `position: relative` so that the accordion
      // has full control over paint order using `z-index`.
      children.forEach(child => {
        child.style.position = 'relative';
        // All children _before_ the animated ones need to be painted _over_
        // all the animated children. Therefore, all the non-animated children
        // get `z-index: 2`;
        child.style.zIndex = 2;
      });

      // All the animated children get `z-index: 0` and get translated to the
      // start position. Because this is a CSS transition we don’t need to
      // use `will-change`.
      animatedChildren.forEach(child => {
        child.style.position = 'relative';
        child.style.zIndex = 1;
        child.style.transform = `translateY(${startOffset}px)`;
      });
      // Wait a frame to apply the styles.
      return requestAnimationFramePromise()
        .then(_ => {
          // Set all animated children to their end position.
          animatedChildren.forEach(child => {
            child.style.transform = `translateY(${endOffset}px)`;
            child.classList.add('animating');
          });
        })
        // Wait for the transition to finish
        .then(_ => transitionEndPromise(panel))
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


