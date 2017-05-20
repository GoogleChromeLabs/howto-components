A `HowtoRadioGroup` is a set of checkable buttons, where only one button may
be checked at a time. The `HowtoRadioGroup` element wraps a set of
`HowtoRadioButton` children and manages their checked states in response to
user keyboard actions such as pressing arrow keys to select the next radio
button, or if the user clicks with a mouse.

The `HowtoRadioGroup` uses a technique called [roving
tabindex](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#Technique_1_oving_tabindex)
to manage which `HowtoRadioButton` child is currently focusable. In a
nutshell, the currently focusable child will have a `tabindex=0`, and all
other children will have a `tabindex=-1`. This ensures that the `RadioGroup`
itself is only a single tab stop, and focus always lands on whichever child
is currently checked. In the case where no child is checked, focus will land
on the first `HowtoRadioButton` child in the `HowtoRadioGroup`.

The `HowtoRadioGroup` uses `aria-checked=true` to indicate the checked state
of its `HowtoRadioButton` children. Only one child may be set to
`aria-checked=true`.  Note that unlike most boolean attributes in HTML,
boolean ARIA attributes take a literal string value of either `"true"` or
`"false"`.

See: https://www.w3.org/TR/wai-aria-practices-1.1/#radiobutton
