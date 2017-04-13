(function() {
  const expect = chai.expect;

  describe('howto-tree', function() {
    before(howtoComponents.before());
    after(howtoComponents.after());
    beforeEach(function() {
      this.container.innerHTML = `
        <howto-tree>
          <howto-tree-item>Project1</howto-tree-item>
          <howto-tree-item>
            <label>Project 2</label>
            <howto-tree-group>
              <howto-tree-item>File1</howto-tree-item>
            </howto-tree-group>
          </howto-tree-item>
          <howto-tree-item aria-selected="true">Project3</howto-tree-item>
        </howto-tree>
      `;
      return Promise.all([
        howtoComponents.waitForElement('howto-tree'),
        howtoComponents.waitForElement('howto-tree-item'),
        howtoComponents.waitForElement('howto-tree-group'),
      ]).then(_ => {
        this.tree = this.container.querySelector('howto-tree');
        this.firstTreeItem = this.tree.querySelector('howto-tree-item');
        this.parentTreeItem = this.tree
          .querySelector('howto-tree-item:nth-of-type(2)');
        this.selectedTreeItem = this.tree
          .querySelector('howto-tree-item[aria-selected="true"]');
        this.firstTreeGroup = this.tree.querySelector('howto-tree-group');
      });
    });

    it('should know about all the visible tree-items', function() {
      expect(this.tree._allTreeItems()).to.have.length(3);
    });

    it('should add [role=tree] to the tree', function() {
      expect(this.tree.getAttribute('role')).to.equal('tree');
    });

    it('should apply [tabindex=0]', function() {
      expect(this.tree.getAttribute('tabindex')).to.equal('0');
    });

    it('should make any [aria-selected] child the activedescendant',
      function() {
        expect(this.tree.getAttribute('aria-activedescendant'))
          .to.equal(this.selectedTreeItem.getAttribute('id'));
      });

    describe('howto-tree-item', function() {
      it('should apply [role=treeitem]', function() {
        expect(this.firstTreeItem.getAttribute('role')).to.equal('treeitem');
      });

      it('should generate ids', function() {
        const treeItem = this.tree.querySelector('howto-tree-item');
        expect(treeItem.getAttribute('id'))
          .to.match(/^howto-tree-item-generated-.*$/);
      });

      it('should apply [aria-expanded=false]', function() {
        expect(this.parentTreeItem.getAttribute('aria-expanded'))
          .to.equal('false');
      });

      it('should toggle [aria-expanded]', function() {
        this.parentTreeItem.expanded = true;
        expect(this.parentTreeItem.getAttribute('aria-expanded'))
          .to.equal('true');
      });

      it('should use `<label>` to apply [aria-label] to parent nodes',
        function() {
          expect(this.parentTreeItem.getAttribute('aria-label'))
            .to.equal('Project 2');
        });
    });

    describe('howto-tree-group', function() {
      it('should apply [role=group]', function() {
        expect(this.firstTreeGroup.getAttribute('role')).to.equal('group');
      });
    });
  });
})();
