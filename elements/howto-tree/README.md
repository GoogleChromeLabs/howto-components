A `HowToTree` presents a hierarchical list of children. Each node in the tree
is represented as either a `HowToTreeItem` or a `HowToTreeItemGroup`.
A `HowToTreeItem` should only contain text and is considered a "leaf" node.
A `HowToTreeItemGroup` can contain `HowToTreeItem` children and is considered
a "parent" node. The first child of a `HowToTreeItemGroup` should be a
`<label>`. Its second child should be a `<div>` element, which will hold all
of its `HowToTreeItem` children. A `<div>` is used because it has an implicit
accessible role of `group`, which is required by the ARIA Authoring Practices
Guide.

Parent nodes can be either collapsed or expanded to reveal their children.
The state of the parent node is conveyed through the use of a `aria-expanded`
attribute.

Depending on the implementation, trees can support either single or
multi selection. The `HowToTree` element supports single selection, so
there can only be one selected element at a time. The currently selected
element is indicated by the `selected` attribute.

Unlike the [`DashRadioGroup`](./howto-radio-group.html), which uses roving
tabindex to indicate which child is currently active, the `HowToTree` uses
`aria-activedescendant` and the `id` of the currently active child. The
effect is similar to using roving tabindex, and is presented in this case to
show an alternative approach to indicating active children.
