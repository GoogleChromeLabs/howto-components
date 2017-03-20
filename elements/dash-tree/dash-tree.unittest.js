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
        <dash-tree-item>Project3</dash-tree-item>
      </dash-tree>
    `;
    return Promise.all([
      dashElements.waitForElement('dash-tree'),
      dashElements.waitForElement('dash-tree-item'),
      dashElements.waitForElement('dash-tree-group'),
    ]).then(_ => {
      this.tree = this.container.querySelector('dash-tree');
    });
  });

  it('should know about all the visible tree-items', function() {
    expect(this.tree._allTreeItems()).to.have.length(3);
  });
});
