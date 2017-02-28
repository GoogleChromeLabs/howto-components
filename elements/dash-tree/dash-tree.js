/**
 * // TODO: Big tree comment.
 */

(function() {
  /**
   * Define keycodes to help with handling keyboard events.
   */
  const KEYCODE = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    HOME: 36,
    END: 35,
    SPACE: 32,
    ENTER: 13,
  };

  /**
   * A helper to quickly identify `<dash-treeitem>` nodes
   */
  function isTreeItem(node) {
    return node.nodeName.toLowerCase() === 'dash-treeitem';
  }

  /**
   * A helper to quickly identify ARIA states.
   * Note that ARIA attributes require a literal string value of "true"/"false".
   */
  function isExpanded(node) {
    return node.getAttribute('aria-expanded') === 'true';
  }

  // `dashTreeItemCounter` counts the number of `<dash-treeitem>` instances
  // created. The number is used to generated new, unique IDs.
  let dashTreeItemCounter = 0;

  class DashTreeItem extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      // The element needs to do some manual input event handling to allow
      // switching with arrow keys and Home/End.
      this.addEventListener('keydown', this._onKeyDown);
      this.addEventListener('click', this._onClick);

      this.setAttribute('role', 'treeitem');

      // If the element doesn't already have an ID, generate one for it.
      // This will make it easier to set the element as active using
      // aria-activedescendant.
      if (!this.id)
        this.id = `dash-treeitem-generated-${dashTreeItemCounter++}`;

      // If the element contains a child then it's a parent node
      if (this.firstElementChild) {
          // If the element is not explicitly already expanded by the user, then
          // set it to closed.
          if (!isExpanded(this))
            this.setAttribute('aria-expanded', false);

          // Set the `aria-label` to the first bit of text. Otherwise the label
          // for this element will be computed based on its text content plus
          // the text content of all of its children. Making it so verbose as to
          // be unusable. This first child should ideally be a `<span>` element,
          // but it may also just be a line of text.
          if (!this.hasAttribute('aria-label'))
            this.setAttribute('aria-label', this.firstChild.textContent.trim());
      }
    }
  }

  /**
   * Define a custom element, `<dash-treeitem>`, and associate it with the
   * `DashTreeItem` class.
   */
  window.customElements.define('dash-treeitem', DashTreeItem);

  class DashTreeGroup extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.setAttribute('role', 'group');
    }
  }

  /**
   * Define a custom element, `<dash-treegroup>`, and associate it with the
   * `DashTreeGroup` class.
   */
  window.customElements.define('dash-treegroup', DashTreeGroup);

  class DashTree extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      // The element needs to do some manual input event handling to allow
      // switching with arrow keys and Home/End.
      this.addEventListener('keydown', this._onKeyDown);
      this.addEventListener('click', this._onClick);

      this.setAttribute('role', 'tree');
      this.setAttribute('tabindex', 0);

      // Before the elements starts booting, it waits for both
      // the `<dash-treeitem>` and `<dash-treegroup>` to load.
      Promise.all([
        customElements.whenDefined('dash-treeitem'),
        customElements.whenDefined('dash-treegroup'),
      ]).then(_ => {
        // Acquire all treeitems inside the element
        const treeItems = this._allTreeItems();
        // If there are no treeItems, then the tree is empty. Abort.
        if (treeItems.length === 0) return;

        // TODO: Handle a child that is already aria-selected=true?
      });
    }

    _allTreeItems() {
      const treeItems = [];
      // A recursive function that visits every child and builds a tree
      // This produces the same results as calling querySelectorAll,
      // but writing the tree ourselves lets us toggle which elements
      // are visible.
      function findTreeitems(node, isVisible) {
        let el = node.firstElementChild;
        while (el) {
          // Ignore children like `<span>` and `<dash-treegroup>`.
          // If the element has children, descend into them looking for
          // more treeitems.
          if (!isTreeItem(el)) {
            if (el.firstElementChild) {
              findTreeitems(el, isVisible);
              return;
            }
          }

          if (isTreeItem(el)) {
            treeItems.push(el);
            el.visible = isVisible;
            // If at any point we hit a parent with aria-expanded=false
            // from then on, set all descendants to visible=false.
            // Otherwise, set immediate descendants' visibility to whatever
            // expanded state this parent element currently has.
            findTreeitems(el, isVisible && isExpanded(el));
          }

          // Look for sibling elements and continue tree walking.
          el = el.nextElementSibling;
        }
      }
      findTreeitems(this, true);
      return treeItems;
    }

    /**
     * `_onKeyDown` handles key presses inside the tree.
     */
    _onKeyDown(event) {
      // Don’t handle modifier shortcuts typically used by assistive technology.
      if (event.altKey) return;

      switch (event.keyCode) {
        case KEYCODE.UP:
          this._focusPrevTreeItem();
          break;

        case KEYCODE.DOWN:
          this._focusNextTreeItem();
          break;

        case KEYCODE.LEFT:
          this._collapseTreeItem();
          break;

        case KEYCODE.RIGHT:
          this._expandTreeItem();
          break;

        case KEYCODE.HOME:
          this._focusFirstTreeItem();
          break;

        case KEYCODE.END:
          this._focusLastTreeItem();
          break;

        case KEYCODE.SPACE:
        case KEYCODE.ENTER:
          this._selectTreeItem();
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
     * Return the current activedescendant if there is one. Otherwise,
     * return null.
     */
    _currentTreeItem() {
      const activeDescendant = this.getAttribute('aria-activeDescendant');
      if (activeDescendant) {
        return this.querySelector(`#${activeDescendant}`);
      }

      return null;
    }

    /**
     * `_nextTreeItem` gets the treeitem that comes after the currently active
     * one.
     */
    _focusNextTreeItem() {
      const treeItems = this._allTreeItems();
      const currentItem = this._currentTreeItem();

      let next = undefined;
      for (let i = treeItems.length - 1; i >= 0; i--) {
        let treeItem = treeItems[i];
        if (treeItem === currentItem) {
          break;
        }
        if (treeItem.visible) {
          next = treeItem;
        }
      }
      if (next)
        this._focusTreeItem(next);
    }

    /**
     * `_prevTreeItem` gets the treeitem that comes before the currently
     * selected one.
     */
    _focusPrevTreeItem() {
      const treeItems = this._allTreeItems();
      const currentItem = this._currentTreeItem();

      let prev = undefined;
      for (let i = 0; i < treeItems.length; i++) {
        let treeItem = treeItems[i];
        if (treeItem === currentItem) {
          break;
        }
        if (treeItem.visible) {
          prev = treeItem;
        }
      }
      if (prev)
        this._focusTreeItem(prev);
    }

    /**
     * Focus the first `<dash-treeitem>` in the tree.
     */
    _focusFirstTreeItem() {
      this._focusTreeItem(this.querySelector('dash-treeitem'));
    }

    /**
     * Focus the last `<dash-treeitem>` in the tree that is focusable without
     * opening a node.
     */
    _focusLastTreeItem() {
      const treeItems = this._allTreeItems();
      for (let i = treeItems.length - 1; i >= 0; i--) {
        let treeItem = treeItems[i];
        if (treeItem.visible) {
          this._focusTreeItem(treeItem);
          break;
        }
      }
    }

    /**
     * `_focusTreeItem` marks the given treeitem as the new activedescendant.
     */
    _focusTreeItem(treeItem) {
      this.setAttribute('aria-activedescendant', treeItem.id);

      // There can be only one active item at a time.
      // Find any previous active item and remove its active class.
      const activeItem = this.querySelector('.active');
      if (activeItem)
        activeItem.classList.remove('active');
      // If the element is expandable then it should have a <span> label
      // as an immediate child. Put the `active` class on that child instead.
      if (treeItem.hasAttribute('aria-expanded')) {
        treeItem.firstElementChild.classList.add('active');
        return;
      }
      treeItem.classList.add('active');
    }

    /**
     * If focus is on an open node, closes the node.
     * If focus is on a child node that is also either an end node or a closed
     * node, move focus to its parent node.
     */
    _collapseTreeItem() {
      const treeItem = this._currentTreeItem();
      if (treeItem.firstElementChild && isExpanded(treeItem)) {
        treeItem.setAttribute('aria-expanded', 'false');
        return;
      }
      // Walk up the tree till you find the parent `<dash-treeitem>`.
      // If this is a root node, do nothing. Otherwise, collapse the parent
      // and move focus to it.
      let parent = treeItem.parentElement;
      if (parent === this)
        return;
      while (!isTreeItem(parent)) {
        parent = parent.parentElement;
      }
      parent.setAttribute('aria-expanded', 'false');
      this._focusTreeItem(parent);
    }

    _expandTreeItem() {
      const treeItem = this._currentTreeItem();
      if (treeItem.firstElementChild) {
        treeItem.setAttribute('aria-expanded', 'true');
      }
    }

    /**
     * Perform the default action for a treeitem. If the item is a parent
     * node, toggle its expanded/collapsed state. If the item is an end
     * node, dispatch an event with a reference to the node. If this was
     * a file picker, an application could listen for this event and open
     * the file based on the item's name.
     */
    _selectTreeItem() {
      // Set the item to aria-selected and remove aria-selected from
      // any other nodes
      const treeItem = this._currentTreeItem();
      const treeItems = this.querySelectorAll('dash-treeitem');
      for (let i = 0; i < treeItems.length; i++) {
        treeItems[i].removeAttribute('aria-selected');
      }
      treeItem.setAttribute('aria-selected', 'true');

      // There can be only one selected item at a time.
      // Find any previous selected item and remove its selected class.
      const selectedItem = this.querySelector('.selected');
      if (selectedItem)
        selectedItem.classList.remove('selected');

      if (treeItem.hasAttribute('aria-expanded')) {
        if (isExpanded(treeItem)) {
          this._collapseTreeItem();
        } else {
          this._expandTreeItem();
        }
        // Since this is an expandable element, set the selected class
        // on its `<span>` label.
        treeItem.firstElementChild.classList.add('selected');
        return;
      }
      treeItem.classList.add('selected');

      // Dispatch a non-bubbling event containing a reference to the selected
      // node. The reason to choose non-bubbling is explained in this post
      // https://medium.com/dev-channel/custom-elements-that-work-anywhere-898e1dd2bc48#.w6ww4mgfc
      // TODO: How do you deep link a Medium post???
      dispatchEvent(new CustomEvent('dash-tree-item-selected', {
        detail: {
          item: treeItem,
        },
        bubbles: false,
      }));
    }

    /**
     * `disconnectedCallback` removes the event listeners that
     * `connectedCallback` added.
     */
    disconnectedCallback() {
      this.removeEventListener('keydown', this._onKeyDown);
      this.removeEventListener('click', this._onClick);
    }
  }

  /**
   * Define a custom element, `<dash-tree>`, and associate it with the
   * `DashTree` class.
   */
  window.customElements.define('dash-tree', DashTree);
})();
