## Summary {: #summary }

A `<howto-tooltip>` is a popup that displays information related to an element
when the element receives keyboard focus or the mouse hovers over it.
The element that triggers the tooltip references the tooltip element with
`aria-describedby`.

The element self-applies the role `tooltip` and sets `tabindex` to -1, as the
tooltip itself can never be focused.

## Reference {: #reference }

- [Tooltip pattern in ARIA Authoring Practices 1.1][tooltip-pattern]

[tooltip-pattern]: https://www.w3.org/TR/wai-aria-practices-1.1/#tooltip
