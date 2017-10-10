project_path: /web/_project.yaml
book_path: /web/fundamentals/_book.yaml

{# wf_updated_on: 2017-10-10#}
{# wf_published_on: 2017-04-06 #}
{# wf_blink_components: Blink>DOM #}

# HowTo: Components – &lt;howto-label&gt; {: .page-title }

{% include "web/_shared/contributors/ewagasperowicz.html" %}
{% include "web/_shared/contributors/robdodson.html" %}
{% include "web/_shared/contributors/surma.html" %}

<link rel="stylesheet" href="main.css">

## Summary {: #summary }

A `<howto-label>` emulates the built-in `<label>` element, and allows assigning
an accessible name to custom elements.

## Reference {: #reference }



## Demo {: #demo }
{% framebox height="auto" width="100%" class="demo" suppress_site_styles="true" %}
<!--
Copyright 2017 Google Inc. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

<style>
  body {
    padding: 20px;
  }
  div {
    margin-bottom: 10px;
  }

  howto-label,
  howto-checkbox {
    vertical-align: middle;
  }
</style>

<div>
  <howto-label for="foo">
    Click Me
  </howto-label>
  <howto-checkbox id="foo"></howto-checkbox>
</div>

<div>
  <howto-label>
    Click Me Too
    <howto-checkbox></howto-checkbox>
  </howto-label>
</div>

<div>
  <howto-label for="bar" id="baz">
    Click Me As Well
  </howto-label>
  <howto-checkbox id="bar"></howto-checkbox>
</div>

<div>
  <howto-label>
    <strong>Click Me Last</strong>
    <howto-checkbox howto-label-target></howto-checkbox>
  </howto-label>
</div>


<script src="https://cdn.rawgit.com/webcomponents/webcomponentsjs/d5b7ca65/webcomponents-sd-ce.js"></script>
<script>
  devsite.framebox.AutoSizeClient.initAutoSize(true);
  (function() {
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

  })();
</script>
</html>

{% endframebox %}

## Example usage {: #usage }
<ul class="literate demo" id="howto-label_demo">

<li class="linecomment ">
<div class="literate-text empty"></div>
<pre><code class="literate-code ">&lt;style&gt;
<span class="indent">&nbsp;&nbsp;</span>body {
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>padding: 20px;
<span class="indent">&nbsp;&nbsp;</span>}
<span class="indent">&nbsp;&nbsp;</span>div {
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>margin-bottom: 10px;
<span class="indent">&nbsp;&nbsp;</span>}

<span class="indent">&nbsp;&nbsp;</span>howto-label,
<span class="indent">&nbsp;&nbsp;</span>howto-checkbox {
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>vertical-align: middle;
<span class="indent">&nbsp;&nbsp;</span>}
&lt;/style&gt;

&lt;div&gt;
<span class="indent">&nbsp;&nbsp;</span>&lt;howto-label for="foo"&gt;
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>Click Me
<span class="indent">&nbsp;&nbsp;</span>&lt;/howto-label&gt;
<span class="indent">&nbsp;&nbsp;</span>&lt;howto-checkbox id="foo"&gt;&lt;/howto-checkbox&gt;
&lt;/div&gt;

&lt;div&gt;
<span class="indent">&nbsp;&nbsp;</span>&lt;howto-label&gt;
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>Click Me Too
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>&lt;howto-checkbox&gt;&lt;/howto-checkbox&gt;
<span class="indent">&nbsp;&nbsp;</span>&lt;/howto-label&gt;
&lt;/div&gt;

&lt;div&gt;
<span class="indent">&nbsp;&nbsp;</span>&lt;howto-label for="bar" id="baz"&gt;
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>Click Me As Well
<span class="indent">&nbsp;&nbsp;</span>&lt;/howto-label&gt;
<span class="indent">&nbsp;&nbsp;</span>&lt;howto-checkbox id="bar"&gt;&lt;/howto-checkbox&gt;
&lt;/div&gt;

&lt;div&gt;
<span class="indent">&nbsp;&nbsp;</span>&lt;howto-label&gt;
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>&lt;strong&gt;Click Me Last&lt;/strong&gt;
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>&lt;howto-checkbox howto-label-target&gt;&lt;/howto-checkbox&gt;
<span class="indent">&nbsp;&nbsp;</span>&lt;/howto-label&gt;
&lt;/div&gt;</code></pre>
</li>

</ul>

## Code {: #code }
<ul class="literate code" id="howto-label_impl">
  
<li class="blockcomment ">
<div class="literate-text empty"></div>
<pre><code class="literate-code ">(function() {</code></pre>
</li>

<li class="linecomment empty">
<div class="literate-text empty"></div>
<pre><code class="literate-code empty"></code></pre>
</li>

<li class="blockcomment ">
<div class="literate-text "><p><code>howtoLabelCounter</code> counts the number of <code>&lt;howto-label&gt;</code> instances created.
The number is used to generated new, unique IDs.</p>
</div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span>let howtoLabelCounter = 0;</code></pre>
</li>

<li class="linecomment empty">
<div class="literate-text empty"></div>
<pre><code class="literate-code empty"></code></pre>
</li>

<li class="blockcomment ">
<div class="literate-text "><p>Cloning contents from a &lt;template&gt; element is more performant
than using innerHTML because it avoids addtional HTML parse costs.</p>
</div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span>const template = document.createElement('template');</code></pre>
</li>

<li class="linecomment ">
<div class="literate-text empty"></div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span>template.innerHTML = `
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>&lt;style&gt;
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>:host {
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>cursor: default;
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>}
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>&lt;/style&gt;
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>&lt;slot&gt;&lt;/slot&gt;
<span class="indent">&nbsp;&nbsp;</span>`;

<span class="indent">&nbsp;&nbsp;</span>
<span class="indent">&nbsp;&nbsp;</span>class HowToLabel extends HTMLElement {
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>static get observedAttributes() {
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>return ['for'];
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>}

<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>constructor() {
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>super();
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>this.attachShadow({mode: 'open'});
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>this.shadowRoot.appendChild(template.content.cloneNode(true));</code></pre>
</li>

<li class="linecomment ">
<div class="literate-text "><p>The <slot> will be used again when checking for wrapped children
 so it makes sense to cache a reference to it.</p>
</div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>this._slot = this.shadowRoot.querySelector('slot');</code></pre>
</li>

<li class="linecomment ">
<div class="literate-text "><p>Listen for the slotchange event to label any wrapped children</p>
</div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>this._slot.addEventListener('slotchange', this._onSlotChange.bind(this));
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>this.addEventListener('click', this._onClick);
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>}</code></pre>
</li>

<li class="blockcomment ">
<div class="literate-text "><p>connectedCallback() will run once the element is attached to the document.
It&#39;s the earliest point at which you may touch attributes, and is a good
time to auto-generate an id for the element if it does not already have
one. The labelled element will use this id to refer to the label with
aria-labelledby.</p>
</div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>connectedCallback() {</code></pre>
</li>

<li class="linecomment empty">
<div class="literate-text empty"></div>
<pre><code class="literate-code empty"></code></pre>
</li>

<li class="linecomment ">
<div class="literate-text "><p>Fire _updateLabel at startup to label any wrapped elements.</p>
</div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>this._updateLabel();
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>}

<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>get for() {
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>const value = this.getAttribute('for');
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>return value === null ? '' : value;
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>}

<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>set for(value) {
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>this.setAttribute('for', value);
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>}

<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>attributeChangedCallback(name, oldVal, newVal) {
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>this._updateLabel();
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>}</code></pre>
</li>

<li class="blockcomment ">
<div class="literate-text "><p>Remove any previous labels.
Find the new element to label.
Label it.</p>
</div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>_updateLabel() {</code></pre>
</li>

<li class="linecomment empty">
<div class="literate-text empty"></div>
<pre><code class="literate-code empty"></code></pre>
</li>

<li class="linecomment ">
<div class="literate-text "><p>Under polyfill you may end up in situations where elements referenced
 by the label are parsed <em>after</em> the label is connected, so defer
 looking for them until the next microtask.</p>
</div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>Promise.resolve()
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>.then(_ =&gt; {</code></pre>
</li>

<li class="linecomment ">
<div class="literate-text "><p>Greedily generate id if one is not already present.</p>
</div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>if (!this.id) {
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>this.id = `howto-label-generated-${howtoLabelCounter++}`;
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>}
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>let oldTarget = this._currentLabelTarget();
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>let newTarget = this._findTarget();
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>if (!newTarget || oldTarget === newTarget) {
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>return;
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>}
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>if (oldTarget) {
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>oldTarget.removeAttribute('aria-labelledby');
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>}
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>newTarget.setAttribute('aria-labelledby', this.id);
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>});
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>}

<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>_onSlotChange(event) {
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>this._updateLabel();
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>}

<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>_onClick(event) {
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>let el = this._currentLabelTarget();</code></pre>
</li>

<li class="linecomment ">
<div class="literate-text "><p>If nothing is labeled, or if a wrapped child was clicked on, return.</p>
</div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>if (!el || event.target === el) {
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>return;
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>}
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>el.focus();
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>el.click();
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>}

<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>_currentLabelTarget() {</code></pre>
</li>

<li class="linecomment ">
<div class="literate-text "><p>Query inside of the current scope. This could either be a shadow root
 or the main document.</p>
</div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>let scope = this.getRootNode();
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>return scope.querySelector(`[aria-labelledby="${this.id}"]`);
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>}</code></pre>
</li>

<li class="blockcomment ">
<div class="literate-text "><p>If there is a for property, return the element with that id.
Else, return the explicitly labeled child.
Else, return the first element child (assume it&#39;s implicitly labeled).</p>
</div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>_findTarget() {</code></pre>
</li>

<li class="linecomment ">
<div class="literate-text empty"></div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>if (this.for) {</code></pre>
</li>

<li class="linecomment ">
<div class="literate-text "><p>external target</p>
</div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>let scope = this.getRootNode();
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>return scope.getElementById(this.for);
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>}</code></pre>
</li>

<li class="linecomment ">
<div class="literate-text "><p>Get all non-text slotted children</p>
</div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>let slottedChildren =
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>this._slot.assignedNodes({flatten: true})
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>.filter(child =&gt; child.nodeType !== Node.TEXT_NODE);</code></pre>
</li>

<li class="linecomment ">
<div class="literate-text "><p>Find the first one that defines an explicit external target</p>
</div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>let el =
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>slottedChildren
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>.find(child =&gt; child.hasAttribute('howto-label-target'));</code></pre>
</li>

<li class="linecomment ">
<div class="literate-text "><p>Return that first explicit external target, or
 the first child if there is none.</p>
</div>
<pre><code class="literate-code "><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>return el || slottedChildren[0];
<span class="indent">&nbsp;&nbsp;</span><span class="indent">&nbsp;&nbsp;</span>}
<span class="indent">&nbsp;&nbsp;</span>}
<span class="indent">&nbsp;&nbsp;</span>customElements.define('howto-label', HowToLabel);
})();</code></pre>
</li>

</ul>
