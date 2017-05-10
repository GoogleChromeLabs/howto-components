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
   * A helper to quickly identify `HowToTreeItem`/`HowToTreeItemGroup` nodes.
   * Because both `HowToTreeItem` and `HowToTreeItemGroup` elements can have
   * a `role=treeitem`, this helper will match against either.
   */
  function isTreeItem(node) {
    return node.nodeName.toLowerCase() === 'howto-tree-item' ||
           node.nodeName.toLowerCase() === 'howto-tree-item-group';
  }

  /**
   * A helper to specifically identify `HowToTreeItemGroup` elements.
   */
  function isTreeItemGroup(node) {
    return node.nodeName.toLowerCase() === 'howto-tree-item-group';
  }

  // `HowToTreeItemCounter` counts the number of `treeItem` instances
  // created. The number is used to generated new, unique `id`s.
  let HowToTreeItemCounter = 0;

  class HowToTreeItem extends HTMLElement {
    static get observedAttributes() {
      return ['selected'];
    }

    connectedCallback() {
      if (!this.hasAttribute('role'))
        this.setAttribute('role', 'treeitem');

      // If the element doesn't already have an `id`, generate one for it.
      // Every node needs an `id` so it can be referenced by
      // `aria-activedescendant`.
      if (!this.id)
        this.id = `howto-tree-item-generated-${HowToTreeItemCounter++}`;
    }

    /**
     * Properties and their corresponding attributes should mirror one another.
     * To this effect, the property setter for `selected` handles truthy/falsy
     * values and reflects those to the state of the attribute.
     * It's important to note that there are no side effects taking place in
     * the property setter. For example, the setter does not set
     * `aria-selected`.
     * Instead, that work happens in the `attributeChangedCallback`.
     * As a general rule, make property setters very dumb, and if setting a
     * property or attribute should cause a side effect (like setting a
     * corresponding ARIA attribute) do that work in the
     * `attributeChangedCallback`. This will avoid having to manage complex
     * attribute/property reentrancy scenarios.
     */
    set selected(value) {
      const isSelected = Boolean(value);
      if (isSelected)
        this.setAttribute('selected', '');
      else
        this.removeAttribute('selected');
    }

    get selected() {
      return this.hasAttribute('selected');
    }

    attributeChangedCallback(name, value) {
      // Set `aria-selected` to match the state of `selected`. This will
      // convey the state to assistive technology like screen readers.
      if (name === 'selected')
        this.setAttribute('aria-selected', this.selected);
    }
  }

  /**
   * Define a custom element, `<howto-tree-item>`, and associate it with the
   * `HowToTreeItem` class.
   */
  window.customElements.define('howto-tree-item', HowToTreeItem);

  /**
   * `HowToTreeItemGroup` is a simple container that holds `HowToTreeItem`
   * children and can be expanded or collapsed.
   * Because a `HowToTreeItemGroup` is also a treeItem, and can be selected,
   * it inherits from the `HowToTreeItem` element.
   */
  class HowToTreeItemGroup extends HowToTreeItem {
    /**
     * Append an `expanded` attribute, to the list of `observedAttributes`.
     * This getter also demonstrates a pattern for guarding against a situation
     * where the parent may not have defined any `observedAttributes`, in
     * which case an empty array is used.
     */
    static get observedAttributes() {
      return (super.observedAttributes || []).concat(['expanded']);
    }

    connectedCallback() {
      super.connectedCallback();
      // An expandable treeItem must have an explicit `aria-expanded` value.
      // This handles the case where the element starts without an
      // `[expanded]` attribute. In that scenario, the element would be set
      // to `aria-expanded=false`.
      this.setAttribute('aria-expanded', this.expanded);

      // This first child should be a `<label>` element. Custom Elements are
      // not currently supported by the `<label>` element, but hopefully
      // they will be in the future. In the meantime, set the `aria-label`
      // for the `HowToTreeItem`, equal to the `<label>` text.
      // Without this labeling, the element's name will be computed based on
      // its text content plus the text content of all of its children, making
      // it so verbose as to be unusable.
      if (!this.hasAttribute('aria-label')) {
        let label = this.querySelector('label');
        if (!label) {
          console.error(`The first child of a <howto-tree-item> that ` +
            `contains a <howto-tree-group> must be a <label>.`);
        } else {
          this.setAttribute('aria-label', label.textContent.trim());
        }
      }
    }

    set expanded(value) {
      const isExpanded = Boolean(value);
      if (isExpanded)
        this.setAttribute('expanded', '');
      else
        this.removeAttribute('expanded');
    }

    get expanded() {
      return this.hasAttribute('expanded');
    }

    /**
     * If the changed attribute is `expanded`, then let the instance handle
     * it. Otherwise, pass the changed attribute call on to the parent class.
     * This example uses the rest and spread operators to keep the code tidy.
     */
    attributeChangedCallback(name, ...theArgs) {
      // Set `aria-expanded` to match the state of `expanded`. This will
      // convey the state to assistive technology like screen readers.
      if (name === 'expanded') {
        this.setAttribute('aria-expanded', this.expanded);
        return;
      }
      super.attributeChangedCallback(name, ...theArgs);
    }
  }

  /**
   * Define a custom element, `<howto-tree-item-group>`, and associate it with
   * the `HowToTreeItemGroup` class.
   */
  window.customElements.define('howto-tree-item-group', HowToTreeItemGroup);

  /**
   * `HowToTree` is responsible for handling user input and updating the
   * expanded/collapsed and selected state for its children. It also manages
   * the currently active child using `aria-activedescendant`.
   */
  class HowToTree extends HTMLElement {
    connectedCallback() {
      if (!this.hasAttribute('role'))
        this.setAttribute('role', 'tree');
      if (!this.hasAttribute('tabindex'))
        this.setAttribute('tabindex', 0);

      // The element needs to do some manual input event handling to allow
      // switching with arrow keys and Home/End.
      this.addEventListener('keydown', this._onKeyDown);
      this.addEventListener('click', this._onClick);
      this.addEventListener('focus', this._onFocus);

      // Before the elements starts booting, it waits for both
      // the `<howto-tree-item>` and `<howto-tree-item-group>` to load.
      Promise.all([
        customElements.whenDefined('howto-tree-item'),
        customElements.whenDefined('howto-tree-item-group'),
      ]).then(_ => {
        // Acquire all `HowToTreeItem`/`HowToTreeItemGroup` instances inside
        // the element.
        const treeItems = this._allTreeItems();
        // If there are no `treeItems`, then the tree is empty. Abort.
        if (treeItems.length === 0)
          return;

        // The element checks if any child has been marked as selected.
        // If so, it will mark it as the current `aria-activedescendant`.
        const selectedTreeItem = treeItems.find(treeItem => treeItem.selected);
        if (selectedTreeItem) {
          this._focusTreeItem(selectedTreeItem);
        }
      });
    }

    /**
     * `disconnectedCallback` removes the event listeners that
     * `connectedCallback` added.
     */
    disconnectedCallback() {
      this.removeEventListener('keydown', this._onKeyDown);
      this.removeEventListener('click', this._onClick);
      this.removeEventListener('focus', this._onFocus);
    }

    /**
     * Returns a list of visible `HowToTreeItem`/`HowToTreeItemGroup` elements.
     * This is useful when the user wants to try to move to the next or previous
     * item in the list.
     * If an item is a child of a parent who is `.expaned=false`
     * then it is considered invisible and is not added to the list.
     */
    _allTreeItems() {
      const treeItems = [];
      // A recursive function that visits every child and builds a list.
      // This produces similar results to calling querySelectorAll,
      // but allows for filtering of the children based on whether or not
      // their parent is currently expanded.
      function findTreeItems(node) {
        for (let el of Array.from(node.children)) {
          // If the child is a `HowToTreeItem` or `HowToTreeItemGroup`, add it
          // to the list of results.
          if (isTreeItem(el))
            treeItems.push(el);
          // If it is a `HowToTreeItemGroup` and it's collapsed, don’t descend.
          // This will ignore any children and treat them as if they are
          // invisible.
          if (isTreeItemGroup(el) && !el.expanded)
            continue;
          // Otherwise, if the element is expanded OR we've hit something
          // else like a `<div>`, continue to descend and look for
          // more `treeItems`.
          findTreeItems(el);
        }
      }
      findTreeItems(this);
      return treeItems;
    }

    /**
     * When focus moves into the element, if a `treeItem` is not already
     * active, mark the first `treeItem` as active.
     */
    _onFocus(event) {
      if (!this._currentTreeItem())
        this._focusFirstTreeItem();
    }

    /**
     * `_onKeyDown` handles key presses inside the tree.
     */
    _onKeyDown(event) {
      // Don’t handle modifier shortcuts typically used by assistive technology.
      if (event.altKey)
        return;

      // Grab a reference to the `currentTreeItem` as it's almost always
      // passed as an argument to one of the actions to be taken.
      const currentTreeItem = this._currentTreeItem();

      switch (event.keyCode) {
        case KEYCODE.UP:
          this._focusPrevTreeItem(currentTreeItem);
          break;

        case KEYCODE.DOWN:
          this._focusNextTreeItem(currentTreeItem);
          break;

        case KEYCODE.LEFT:
          this._collapseTreeItem(currentTreeItem);
          break;

        case KEYCODE.RIGHT:
          this._expandTreeItem(currentTreeItem);
          break;

        case KEYCODE.HOME:
          this._focusFirstTreeItem();
          break;

        case KEYCODE.END:
          this._focusLastTreeItem();
          break;

        case KEYCODE.SPACE:
        case KEYCODE.ENTER:
          this._toggleTreeItem(currentTreeItem);
          this._selectTreeItem(currentTreeItem);
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
     * Find the `treeItem` associated with the element that was clicked.
     * Focus the `treeItem` and make it the current selected item as well.
     */
    _onClick(event) {
      // A loop that will work its way upward until it finds
      // the `treeItem` associated with the event target. This allows
      // clicking on a `<label>` or `<div>` within a `HowToTreeItemGroup`
      // and ensures the right element is always being focused/selected.
      let item = event.target;
      while (item && !isTreeItem(item))
        item = item.parentElement;

      this._focusTreeItem(item);
      this._selectTreeItem(item);
      this._toggleTreeItem(item);
    }

    /**
     * Return the current active `treeItem` if there is one. Otherwise,
     * return null.
     */
    _currentTreeItem() {
      return this.querySelector('.active');
    }

    /**
     * Attempt to find the previous `treeItem` in the list. If one exists,
     * focus it. Otherwise just ignore the command.
     */
    _focusPrevTreeItem(currentTreeItem) {
      const treeItems = this._allTreeItems();
      const idx = treeItems.lastIndexOf(currentTreeItem) - 1;
      if (idx >= 0)
        this._focusTreeItem(treeItems[idx]);
    }

    /**
     * Attempt to find the next `treeItem` in the list. If one exists,
     * focus it. Otherwise just ignore the command.
     */
    _focusNextTreeItem(currentTreeItem) {
      const treeItems = this._allTreeItems();
      const idx = treeItems.lastIndexOf(currentTreeItem) + 1;
      if (idx < treeItems.length)
        this._focusTreeItem(treeItems[idx]);
    }

    /**
     * Focus the first `treeItem` in the tree. Useful for when the user
     * presses the [home] key.
     */
    _focusFirstTreeItem() {
      const firstTreeItem = Array.from(this.children)
        .find(item => isTreeItem(item));
      this._focusTreeItem(firstTreeItem);
    }

    /**
     * Focus the last `HowToTreeItem` in the tree. Useful for when the user
     * presses the [end] key.
     */
    _focusLastTreeItem() {
      const treeItems = this._allTreeItems();
      this._focusTreeItem(treeItems[treeItems.length - 1]);
    }

    /**
     * Mark the passed in element as the new `aria-activedescendant` and give
     * it an `.active` class for easy styling.
     */
    _focusTreeItem(treeItem) {
      this.setAttribute('aria-activedescendant', treeItem.id);

      // There can be only one active item at a time.
      // Find any previous active item and remove its active class.
      const activeItem = this.querySelector('.active');
      if (activeItem)
        activeItem.classList.remove('active');
      treeItem.classList.add('active');
    }

    /**
     * If focus is on an open node, close the node.
     * If focus is on a child node that is also either a leaf node or a closed
     * parent node, move focus to its parent node.
     */
    _collapseTreeItem(currentTreeItem) {
      if (isTreeItemGroup(currentTreeItem) && currentTreeItem.expanded) {
        currentTreeItem.expanded = false;
        return;
      }
      // Walk up the tree till you find the parent `HowToTreeItem`.
      // If this is a root node, do nothing. Otherwise, collapse the parent
      // and move focus to it.
      let parent = currentTreeItem.parentElement;
      if (parent === this)
        return;
      while (!isTreeItemGroup(parent))
        parent = parent.parentElement;
      parent.expanded = false;
      this._focusTreeItem(parent);
    }

    /**
     * If focus is on a closed node, opens the node.
     */
    _expandTreeItem(currentTreeItem) {
      if (isTreeItemGroup(currentTreeItem))
        currentTreeItem.expanded = true;
    }

    /**
     * Flip the `HowToTreeItemGroup` between open and closed states.
     */
    _toggleTreeItem(currentTreeItem) {
      if (!isTreeItemGroup(currentTreeItem))
        return;
      if (currentTreeItem.expanded)
        this._collapseTreeItem(currentTreeItem);
      else
        this._expandTreeItem(currentTreeItem);
    }

    /**
     * Perform the default action for a `treeItem`. If the item is a parent
     * node, toggle its expanded/collapsed state. If the item is an end
     * node, dispatch an event with a reference to the node. If this was
     * a file picker, an application could listen for this event and open
     * the file based on the item's name.
     */
    _selectTreeItem(currentTreeItem) {
      // There can only be one selected element at time.
      // Look at all the children and toggle any selected ones off.
      this.querySelectorAll('[selected]')
        .forEach(item => item.selected = false);
      currentTreeItem.selected = true;

      // Dispatch a non-bubbling event containing a reference to the selected
      // node. The reason to choose non-bubbling is explained in
      // [this Medium post.](https://medium.com/dev-channel/custom-elements-that-work-anywhere-898e1dd2bc48#.w6ww4mgfc)
      this.dispatchEvent(new CustomEvent('howto-tree-item-selected', {
        detail: {
          item: currentTreeItem,
        },
        bubbles: false,
      }));
    }
  }

  /**
   * Define a custom element, `<howto-tree>`, and associate it with the
   * `HowToTree` class.
   */
  window.customElements.define('howto-tree', HowToTree);
})();
