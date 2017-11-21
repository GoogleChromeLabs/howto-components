## Summary {: #summary }

A `<howto-slider>` represents a slider in a form. The slider allows user
to select a value from a range of value.

The element attempts to self apply the attributes `role="slider"` and
`tabindex="0"` when it is first created. The `role` attribute helps assistive
technology like a screen reader tell the user what kind of control this is.
The `tabindex` attribute opts the element into the tab order, making it keyboard
focusable and operable. To learn more about these two topics, check out
[What can ARIA do?][what-aria] and [Using tabindex][using-tabindex].

When the slider is moved, it sets `value` attribute. In addition, 
the element sets an `aria-valuenow` attribute to corresponding value. Clicking on 
the slider will change its value based on the distance in which it is clicked.
Also, on pressing `right` / `up` arrow key the value is increased by `1`.
On pressing `left` / `down` arrow key the value is decreased by `1` respectively.
You can also press `pageUp` / `pageDown` to increase / decrease the value by `10`
respectively. This also gives an option to press `home` / `end` button to go to 
`minimum` and `maximum` values respectively.

Warning: Just because you _can_ build a custom element slider, doesn't
necessarily mean that you _should_. As this example shows, you will need to add
your own keyboard, labeling, and ARIA support. It's also important to note that
the native `<form>` element will NOT submit values from a custom element. You
will need to wire that up yourself using AJAX or a hidden `<input>` field. 

## Reference {: #reference }

- [Checkbox Pattern in ARIA Authoring Practices 1.1][checkbox-pattern]
- [What can ARIA Do?][what-aria]
- [Using tabindex][using-tabindex]

[checkbox-pattern]: https://www.w3.org/TR/wai-aria-practices/examples/slider/slider-1.html
[what-aria]: https://developers.google.com/web/fundamentals/accessibility/semantics-aria/#what_can_aria_do
[using-tabindex]: https://developers.google.com/web/fundamentals/accessibility/focus/using-tabindex
