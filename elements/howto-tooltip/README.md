## Summary

A tooltip is a popup that displays information related to an element
when the element receives keyboard focus or the mouse hovers over it.
The element that triggers the tooltip references the tooltip element with
`aria-describedby`.

The element self-applies the role `tooltip` and sets `tabindex` to -1, as the
tooltip itself can never be focused.

## Tips and best practices {: #tips-best-practices }

### Don't override the page author {: #dont-override }

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

## References

* [Tooltip pattern in ARIA Authoring Practices 1.1]

[Tooltip pattern in ARIA Authoring Practices 1.1]: https://www.w3.org/TR/wai-aria-practices-1.1/#tooltip
