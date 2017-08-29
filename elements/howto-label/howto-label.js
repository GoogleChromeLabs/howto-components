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
    <slot></slot>
  `;

  class HowToLabel extends HTMLElement {
    static get observedAttributes() {
      return ['for'];
    }

    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      // Listen for the slotchange event to label any wrapped children
      this.shadowRoot.querySelector('slot')
        .addEventListener('slotchange', this._forChanged.bind(this));
      this.addEventListener('click', this._onClick.bind(this));
    }

    /**
     * connectedCallback() will run once the element is attached to the document.
     * It's the earliest point at which you may touch attributes, and is a good
     * time to auto-generate an id for the element if it does not already have
     * one. The labelled element will use this id to refer to the label with
     * aria-labelledby.
     */
    connectedCallback() {
      if (!this.id) {
        this.id = `howto-label-generated-${howtoLabelCounter++}`;
      }

      // Fire _forChanged at startup to label any wrapped elements.
      this._forChanged();
    }

    get for() {
      const value = this.getAttribute('for');
      return value === null ? '' : value;
    }

    set for(value) {
      this.setAttribute('for', value);
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (name === 'for') {
        this._forChanged();
      }
    }

    /**
     * Remove any previous labels.
     * Find the new element to label.
     * Label it.
     */
    _forChanged() {
      let target = this._currentLabelTarget();
      if (target) {
        target.removeAttribute('aria-labelledby');
      }
      target = this._findTarget();
      target.setAttribute('aria-labelledby', this.id);
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
      } else {
        let slottedChildren = this.shadowRoot
          .querySelector('slot').assignedNodes({flatten: true});
        let el;
        slottedChildren.forEach(child => {
          // Ignore text nodes
          if (child.nodeType === Node.TEXT_NODE) {
            return;
          }
          // Implicit internal target, first element child
          if (!el) {
            el = child;
          }
          // Explicit internal target
          if (child.hasAttribute('howto-label-target')) {
            el = child;
          }
        });
        return el;
      }
    }
  }
  customElements.define('howto-label', HowToLabel);
})();
