# `<howto-checkbox>`

## Summary

A `<howto-checkbox` represents a boolean option in a form. The most common type
of checkbox is a dual-type which allows the user to toggle between two
choices -- checked and unchecked.

The element should attempt to self apply the attributes `role="checkbox"` and
`tabindex="0"` when it is first created. The `role` attribute helps assistive
technology like a screen reader tell the user what kind of control this is.
The `tabindex` attribute opts the element into the tab order, making it keyboard
focusable and operable. To learn more about these two topics, check out
[What can ARIA do?][What can ARIA do?] and [Using tabindex][Using tabindex].

When the checkbox is checked, it should add a
`[checked]` boolean attribute, and set a corresponding `checked` property to
`true`. In addition, the element should set an `[aria-checked]` attribute to
either `"true"` or `"false"`, depending on its state. Clicking on the checkbox
with a mouse, or space bar, should toggle these checked states.

The checkbox should also support a `disabled` state. If either the
`disabled` property is set to true or the `[disabled]` attribute is applied, the
element should set `aria-disabled="true"` and set `tabindex="-1"`.

## Tips and best practices

### Why do ARIA attributes need a "true" or "false" string?

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

### Don't override the page author

When the checkbox is created it should attempt to set its `role` and `tabindex`
in the `connectedCallback`.

```js
connectedCallback() {
  if (!this.hasAttribute('role'))
    this.setAttribute('role', 'checkbox');
  if (!this.hasAttribute('tabindex'))
    this.setAttribute('tabindex', 0);
```

It's possible that a developer using this element might want to give it a
different role, for example, `role="switch"`, if they're using it in a different
context. Similarly they might want the control to not be focusable just yet, so
they may set `tabindex="-1"`. It's important to respect the developer's wishes
and not surpise them by overiding their configuration. For this reason, the
element should check to see if those attributes have been set, before applying
its own values.

### Make properties lazy

A developer may attempt to set a property on the element before its definition
has been loaded. This is especially true if the developer is using a framework
which handles loading components, stamping them to the page, and binding their
properties to a model.

```html
<!--
Here Angular is declaratively binding its model's isChecked property to the
checkbox's checked property.
-->
<howto-checkbox [checked]="defaults.isChecked"></howto-checkbox>
```

A Custom Element should be able to handle this scenario by checking its instance
for any already set properties during its connected phase. The
`<howto-checkbox>` demonstrates this pattern using a method called
`_upgradeProperty`.

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

### Avoid reentrancy issues

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

In this example, removing the attribute will also effectively set the property
to `false`.

Finally, the `attributeChangedCallback` can be used to handle side effects like
applying ARIA states.

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


## Reference

[Checkbox pattern in ARIA Authoring Practices 1.1][Checkbox pattern in ARIA Authoring Practices 1.1]

[What can ARIA do?][What can ARIA do?]

[Using tabindex][Using tabindex]

[Checkbox pattern in ARIA Authoring Practices 1.1]: https://www.w3.org/TR/wai-aria-practices-1.1/#checkbox
[What can ARIA do?]: https://developers.google.com/web/fundamentals/accessibility/semantics-aria/#what_can_aria_do
[Using tabindex]: https://developers.google.com/web/fundamentals/accessibility/focus/using-tabindex
