const expect = chai.expect;

describe('dash-tabs', function() {
  before(dashElements.before());
  after(dashElements.after());
  beforeEach(function() {
    this.container.innerHTML = `
      <dash-tabs>
        <dash-tabs-tab role="heading">Tab 1</dash-tabs-tab>
        <dash-tabs-panel role="region">Content 1</dash-tabs-panel>
        <dash-tabs-tab role="heading">Tab 2</dash-tabs-tab>
        <dash-tabs-panel role="region">Content 2</dash-tabs-panel>
        <dash-tabs-tab role="heading">Tab 3</dash-tabs-tab>
        <dash-tabs-panel role="region">Content 3</dash-tabs-panel>
      </dash-tabs>
    `;
    return Promise.all([
      dashElements.waitForElement('dash-tabs'),
      dashElements.waitForElement('dash-tabs-tab'),
      dashElements.waitForElement('dash-tabs-panel'),
    ]).then(_ => {
      this.tabpanel = this.container.querySelector('dash-tabs');
      this.tabs = Array.from(this.container.querySelectorAll('dash-tabs-tab'));
      this.panels =
        Array.from(this.container.querySelectorAll('dash-tabs-panel'));
    });
  });

  it('should know about all the tabs', function() {
    expect(
      this.tabpanel._allTabs()
    ).to.have.length(this.container.querySelectorAll('dash-tabs-tab').length);
  });

  it('should know about all the panels', function() {
    expect(
      this.tabpanel._allPanels()
    ).to.have.length(this.container.querySelectorAll('dash-tabs-panel').length);
  });

  it('should add `aria-labelledby` to panels', function() {
    this.panels.forEach(panel => {
      expect(panel.getAttribute('aria-labelledby')).to.have.length.above(0);
    });
  });

  it('should add `role` to panels', function() {
    this.panels.forEach(panel => {
      expect(panel.getAttribute('role')).to.equal('tabpanel');
    });
  });

  it('should upgrade `role` of tabs', function() {
    this.tabs.forEach(panel => {
      expect(panel.getAttribute('role')).to.equal('tab');
    });
  });

  it('should only have one visible panel initially', function() {
    expect(
      this.panels.filter(
        panel => panel.getAttribute('aria-hidden') !== 'true'
      )
    ).to.have.lengthOf(1);
  });

  it('should have one selected tab initially', function() {
    expect(
      this.tabs.filter(
        tab => tab.getAttribute('aria-selected') === 'true'
      )
    ).to.have.lengthOf(1);
  });

  it('should switch visibility when calling `_selectTab()`', function() {
    const selectedTab =
      this.tabs.find(
        tab => tab.getAttribute('aria-selected') === 'true'
      );
    const selectedPanel =
      this.panels.find(
        panel => panel.id === selectedTab.getAttribute('aria-controls')
      );
    const otherTab = this.tabs.find(tab => tab !== selectedTab);
    const otherPanel =
      this.panels.find(panel =>
        panel.id === otherTab.getAttribute('aria-controls'));

    expect(otherTab.getAttribute('aria-selected')).to.equal('false');
    expect(otherPanel.getAttribute('aria-hidden')).to.equal('true');
    this.tabpanel._selectTab(otherTab);
    expect(otherTab.getAttribute('aria-selected')).to.equal('true');
    expect(otherPanel.getAttribute('aria-hidden')).to.equal('false');
    expect(selectedTab.getAttribute('aria-selected')).to.equal('false');
    expect(selectedPanel.getAttribute('aria-hidden')).to.equal('true');
  });
});
