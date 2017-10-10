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
   * `howtoLabelCounter` counts the number of `<howto-label>` instances created.
   * The number is used to generated new, unique IDs.
   */
  let howtoLabelCounter = 0;

  /**
   * Cloning contents from a &lt;template&gt; element is more performant
   * than using innerHTML because it avoids addtional HTML parse costs.
   */
  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      :host {
        cursor: default;
      }
    </style>
    <slot></slot>
  `;

  // HIDE
  // ShadyCSS will rename classes as needed to ensure style scoping.
  ShadyCSS.prepareTemplate(template, 'howto-checkbox');
  // /HIDE

  class HowToLabel extends HTMLElement {
    static get observedAttributes() {
      return ['for'];
    }

    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      // The <slot> will be used again when checking for wrapped children
      // so it makes sense to cache a reference to it.
      this._slot = this.shadowRoot.querySelector('slot');
      // Listen for the slotchange event to label any wrapped children
      this._slot.addEventListener('slotchange', this._onSlotChange.bind(this));
      this.addEventListener('click', this._onClick);
    }

    /**
     * connectedCallback() will run once the element is attached to the document.
     * It's the earliest point at which you may touch attributes, and is a good
     * time to auto-generate an id for the element if it does not already have
     * one. The labelled element will use this id to refer to the label with
     * aria-labelledby.
     */
    connectedCallback() {
      // HIDE
      // Shim Shadow DOM styles. This needs to be run in `connectedCallback()`
      // because if you shim Custom Properties (CSS variables) the element
      // will need access to its parent node.
      ShadyCSS.styleElement(this);
      // /HIDE

      // Fire _updateLabel at startup to label any wrapped elements.
      this._updateLabel();
    }

    get for() {
      const value = this.getAttribute('for');
      return value === null ? '' : value;
    }

    set for(value) {
      this.setAttribute('for', value);
    }

    attributeChangedCallback(name, oldVal, newVal) {
      this._updateLabel();
    }

    /**
     * Remove any previous labels.
     * Find the new element to label.
     * Label it.
     */
    _updateLabel() {
      // Under polyfill you may end up in situations where elements referenced
      // by the label are parsed _after_ the label is connected, so defer
      // looking for them until the next microtask.
      Promise.resolve()
        .then(_ => {
          // Greedily generate id if one is not already present.
          if (!this.id) {
            this.id = `howto-label-generated-${howtoLabelCounter++}`;
          }
          let oldTarget = this._currentLabelTarget();
          let newTarget = this._findTarget();
          if (!newTarget || oldTarget === newTarget) {
            return;
          }
          if (oldTarget) {
            oldTarget.removeAttribute('aria-labelledby');
          }
          newTarget.setAttribute('aria-labelledby', this.id);
        });
    }

    _onSlotChange(event) {
      this._updateLabel();
    }

    _onClick(event) {
      let el = this._currentLabelTarget();
      // If nothing is labeled, or if a wrapped child was clicked on, return.
      if (!el || event.target === el) {
        return;
      }
      el.focus();
      el.click();
    }

    _currentLabelTarget() {
      // Query inside of the current scope. This could either be a shadow root
      // or the main document.
      let scope = this.getRootNode();
      return scope.querySelector(`[aria-labelledby="${this.id}"]`);
    }

    /**
     * If there is a for property, return the element with that id.
     * Else, return the explicitly labeled child.
     * Else, return the first element child (assume it's implicitly labeled).
     */
    _findTarget() {
      if (this.for) {
        // external target
        let scope = this.getRootNode();
        return scope.getElementById(this.for);
      }

      // Get all non-text slotted children
      let slottedChildren =
        this._slot.assignedNodes({flatten: true})
          .filter(child => child.nodeType !== Node.TEXT_NODE);
      // Find the first one that defines an explicit external target
      let el =
        slottedChildren
          .find(child => child.hasAttribute('howto-label-target'));
      // Return that first explicit external target, or
      // the first child if there is none.
      return el || slottedChildren[0];
    }
  }
  customElements.define('howto-label', HowToLabel);
})();
