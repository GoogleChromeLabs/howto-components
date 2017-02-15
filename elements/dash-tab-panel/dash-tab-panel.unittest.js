const expect = chai.expect;

describe('dash-tablist', function() {
  before(dashElements.before());
  after(dashElements.after());
  beforeEach(function() {
    this.container.innerHTML = `
      <dash-tablist>
        <header role="tab" id="tab1" aria-controls="panel1">Tab 1</header>
        <section id="panel1" role="tabpanel">Content 1</section>
        <header role="tab" id="tab2" aria-controls="panel2">Tab 2</header>
        <section id="panel2" role="tabpanel">Content 2</section>
        <header role="tab" id="tab3" aria-controls="panel3">Tab 3</header>
        <section id="panel3" role="tabpanel">Content 3</section>
      </dash-tablist>
    `;
    this.tabpanel = this.container.querySelector('dash-tablist');
    this.tabs = Array.from(
      this.container.querySelectorAll('[role="tab"]')
    );
    this.panels = Array.from(
      this.container.querySelectorAll('[role="tabpanel"]')
    );
    return dashElements.waitForElement('dash-tablist');
  });

  it('should add `aria-labelledby` to panels', function() {
    this.panels.forEach(panel => {
      expect(panel.getAttribute('aria-labelledby')).to.have.length.above(0);
    });
  });

  it('should only have one visible panel initially', function() {
    expect(this.panels.filter(panel => !panel.classList.contains('hidden')))
      .to.have.lengthOf(1);
  });

  it('should have one selected tab initially', function() {
    expect(this.tabs.filter(panel => panel.classList.contains('selected')))
      .to.have.lengthOf(1);
  });

  it('should switch visibility when calling `_selectTab()`', function() {
    const selectedTab =
      this.tabs.find(tab => tab.classList.contains('selected'));
    const selectedPanel =
      this.panels.find(panel =>
        panel.id === selectedTab.getAttribute('aria-controls'));
    const otherTab = this.tabs.find(tab => tab !== selectedTab);
    const otherPanel =
      this.panels.find(panel =>
        panel.id === otherTab.getAttribute('aria-controls'));

    expect(otherTab.classList.contains('selected')).to.equal(false);
    expect(otherPanel.classList.contains('hidden')).to.equal(true);
    this.tabpanel._selectTab(otherTab);
    expect(otherTab.classList.contains('selected')).to.equal(true);
    expect(otherPanel.classList.contains('hidden')).to.equal(false);
    expect(selectedTab.classList.contains('selected')).to.equal(false);
    expect(selectedPanel.classList.contains('hidden')).to.equal(true);
  });
});
