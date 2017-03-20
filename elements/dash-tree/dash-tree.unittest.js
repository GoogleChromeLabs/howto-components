(function() {
  const expect = chai.expect;

  describe.only('dash-tree', function() {
    before(dashElements.before());
    after(dashElements.after());
    beforeEach(function() {
      this.container.innerHTML = `
        <dash-tree>
          <dash-tree-item>Project1</dash-tree-item>
          <dash-tree-item>
            <label>Project 2</label>
            <dash-tree-group role="list">
              <dash-tree-item>File1</dash-tree-item>
            </dash-tree-group>
          </dash-tree-item>
          <dash-tree-item aria-selected="true">Project3</dash-tree-item>
        </dash-tree>
      `;
      return Promise.all([
        dashElements.waitForElement('dash-tree'),
        dashElements.waitForElement('dash-tree-item'),
        dashElements.waitForElement('dash-tree-group'),
      ]).then(_ => {
        this.tree = this.container.querySelector('dash-tree');
        this.firstTreeItem = this.tree.querySelector('dash-tree-item');
        this.parentTreeItem = this.tree
          .querySelector('dash-tree-item:nth-of-type(2)');
        this.selectedTreeItem = this.tree
          .querySelector('dash-tree-item[aria-selected="true"]');
        this.firstTreeGroup = this.tree.querySelector('dash-tree-group');
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

    describe('dash-tree-item', function() {
      it('should apply [role=treeitem]', function() {
        expect(this.firstTreeItem.getAttribute('role')).to.equal('treeitem');
      });

      // TODO: Figure out regex syntax for Chai
      // it('should generate ids', function() {
      //   const treeItem = this.tree.querySelector('dash-tree-item');
      //   expect(treeItem.getAttribute('id'))
      //     .to.match('dash-tree-item-generated-*');
      // });

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

    describe('dash-tree-group', function() {
      it('should apply [role=group]', function() {
        expect(this.firstTreeGroup.getAttribute('role')).to.equal('group');
      });
    });
  });
})();
