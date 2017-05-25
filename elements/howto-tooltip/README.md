## Summary

A tooltip is a popup that displays information related to an element
when the element receives keyboard focus or the mouse hovers over it.
The element that triggers the tooltip references the tooltip element with
`aria-describedby`.

The element self-applies the role `tooltip` and sets `tabindex` to -1, as the
tooltip itself can never be focused.

## Tips and best practices

### Don't override the page author

When the tooltip is created it should attempt to set its `role` and `tabindex`
in the `connectedCallback`.

```js
connectedCallback() {
  if (!this.hasAttribute('role'))
    this.setAttribute('role', 'tooltip');
  if (!this.hasAttribute('tabindex'))
    this.setAttribute('tabindex', -1);
```

It's possible that a developer using this element might want to give it a
different role if they're using it in a different
context. It's important to respect the developer's wishes
and not surpise them by overiding their configuration. For this reason, the
element should check to see if those attributes have been set, before applying
its own values.

## References

* [Tooltip pattern in ARIA Authoring Practices 1.1]

[Tooltip pattern in ARIA Authoring Practices 1.1]: https://www.w3.org/TR/wai-aria-practices-1.1/#tooltip
