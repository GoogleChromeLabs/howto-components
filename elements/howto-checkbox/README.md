## Summary {: summary }

A `<howto-checkbox` represents a boolean option in a form. The most common type
of checkbox is a dual-type which allows the user to toggle between two
choices -- checked and unchecked.

The element attempts to self apply the attributes `role="checkbox"` and
`tabindex="0"` when it is first created. The `role` attribute helps assistive
technology like a screen reader tell the user what kind of control this is.
The `tabindex` attribute opts the element into the tab order, making it keyboard
focusable and operable. To learn more about these two topics, check out
[What can ARIA do?][what-aria] and [Using tabindex][using-tabindex].

When the checkbox is checked, it adds a `[checked]` boolean attribute, and sets
a corresponding `checked` property to `true`. In addition, the element sets an
`[aria-checked]` attribute to either `"true"` or `"false"`, depending on its
state. Clicking on the checkbox with a mouse, or space bar, toggles these
checked states.

The checkbox also supports a `disabled` state. If either the `disabled` property
is set to true or the `[disabled]` attribute is applied, the checkbox sets
`aria-disabled="true"` and set `tabindex="-1"`.

## Tips and best practices {: tips-best-practices }

### Why do ARIA attributes need a "true" or "false" string? {: why-aria }

Unlike other boolean attributes, ARIA attributes require a literal string of
either `"true"` or `"false"`.

```html
<howto-checkbox checked aria-checked="true">
```

This is because for certain ARIA attributes the absence of the attribute might
mean something different than false. For example, `aria-pressed="false"`
indicates that a control can be toggled, but is currently in the off state.
Whereas the absence of an `aria-pressed` attribute indicates that the control is
not toggleable at all.

### Don't override the page author {: dont-override }

It's possible that a developer using this element might want to give it a
different role, for example, `role="switch"`. Similarly they might want the
control to not be focusable just yet, so they might set `tabindex="-1"`. It's
important to respect the developer's wishes and not surpise them by overiding
their configuration. For this reason, the element checks to see if those
attributes have been set, before applying its own values.

```js
connectedCallback() {
  if (!this.hasAttribute('role'))
    this.setAttribute('role', 'checkbox');
  if (!this.hasAttribute('tabindex'))
    this.setAttribute('tabindex', 0);
```

### Make properties lazy {: lazy-properties }

A developer might attempt to set a property on the element before its definition
has been loaded. This is especially true if the developer is using a framework
which handles loading components, stamping them to the page, and binding their
properties to a model.

```html
<!--
Here Angular is declaratively binding its model's isChecked property to the
checkbox's checked property. If the definition for howto-checkbox was lazy loaded
it's possible that Angular might attempt to set the checked property before
the element has upgraded.
-->
<howto-checkbox [checked]="defaults.isChecked"></howto-checkbox>
```

A Custom Element should handle this scenario by checking if any properties have
already been set on its instance. The `<howto-checkbox>` demonstrates this
pattern using a method called `_upgradeProperty`.

```js
connectedCallback() {
  ...
  this._upgradeProperty('checked');
}

_upgradeProperty(prop) {
  if (this.hasOwnProperty(prop)) {
    let value = this[prop];
    delete this[prop];
    this[prop] = value;
  }
}
```

`_upgradeProperty` captures the value from the unupgraded instance and deletes
the property so it does not shadow the Custom Element's own property setter.
This way, when the element's definition does finally load, it can immediately
reflect the correct state.

### Avoid reentrancy issues {: avoid-reentrancy }

It's tempting to use the `attributeChangedCallback` to reflect state to an
underlying property, for example:

```js
// When the [checked] attribute changes, set the checked property to match.
attributeChangedCallback(name, oldValue, newValue) {
  if (name === 'checked')
    this.checked = newValue;
}
```

But this can create an infinite loop if the property setter also reflects to
the attribute.

```js
set checked(value) {
  const isChecked = Boolean(value);
  if (isChecked)
    // OOPS! This will cause an infinite loop because it triggers the
    // attributeChangedCallback() which then sets this property again.
    this.setAttribute('checked', '');
  else
    this.removeAttribute('checked');
}
```

An alternative is to allow the property setter to reflect to the attribute, and
have the getter determine it's value based on the attribute.

```js
set checked(value) {
  const isChecked = Boolean(value);
  if (isChecked)
    this.setAttribute('checked', '');
  else
    this.removeAttribute('checked');
}

get checked() {
  return this.hasAttribute('checked');
}
```

In this example, adding or removing the attribute will also effectively set the
property.

Finally, the `attributeChangedCallback` can be used to just handle side effects
like applying ARIA states.

```js
attributeChangedCallback(name, oldValue, newValue) {
  const hasValue = newValue !== null;
  switch (name) {
    case 'checked':
      // Note the attributeChangedCallback is only handling the *side effects*
      // of setting the attribute.
      this.setAttribute('aria-checked', hasValue);
      break;
    ...
  }
}
```


## Reference {: reference }

- [Checkbox pattern in ARIA Authoring Practices 1.1][checkbox-pattern]
- [What can ARIA do?][what-aria]
- [Using tabindex][using-tabindex]

[checkbox-pattern]: https://www.w3.org/TR/wai-aria-practices-1.1/#checkbox
[what-aria]: https://developers.google.com/web/fundamentals/accessibility/semantics-aria/#what_can_aria_do
[using-tabindex]: https://developers.google.com/web/fundamentals/accessibility/focus/using-tabindex
