## Summary {: #summary }

A `<howto-toggle-button>` represents a boolean option in a form. The most common type
of toggle button is a dual-type which allows the user to toggle between two
choices -- pressed and not pressed.

The element attempts to self apply the attributes `role="button"` and
`tabindex="0"` when it is first created. The `role` attribute helps assistive
technology like a screen reader tell the user what kind of control this is.
The `tabindex` attribute opts the element into the tab order, making it keyboard
focusable and operable. To learn more about these two topics, check out
[What can ARIA do?][what-aria] and [Using tabindex][using-tabindex].

When the toggle button is pressed, it adds a `pressed` boolean attribute, and sets
a corresponding `pressed` property to `true`. In addition, the element sets an
`aria-pressed` attribute to either `"true"` or `"false"`, depending on its
state. Clicking on the toggle button with a mouse, space bar or enter key, toggles these
pressed states.

The toggle button also supports a `disabled` state. If either the `disabled` property
is set to true or the `disabled` attribute is applied, the toggle button sets
`aria-disabled="true"` and removes the `tabindex` attribute.

## Reference {: #reference }

- [Toggle Button Pattern in ARIA Authoring Practices 1.1][toggle-button-pattern]
- [What can ARIA Do?][what-aria]
- [Using tabindex][using-tabindex]

[toggle-button-pattern]: https://www.w3.org/TR/wai-aria-practices-1.1/#button
[what-aria]: https://developers.google.com/web/fundamentals/accessibility/semantics-aria/#what_can_aria_do
[using-tabindex]: https://developers.google.com/web/fundamentals/accessibility/focus/using-tabindex
