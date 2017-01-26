const expect = chai.expect;

describe('dash-tab-panel', function() {
  before(dashElements.before());
  after(dashElements.after());
  beforeEach(function() {
    this.container.innerHTML = `
      <dash-tab-panel>
        <header aria-role="tab" aria-controls="tab1">Tab 1</header>
        <section id="tab1" aria-role="tabpanel">Content 1</section>
        <header aria-role="tab" aria-controls="tab2">Tab 2</header>
        <section id="tab2" aria-role="tabpanel">Content 2</section>
        <header aria-role="tab" aria-controls="tab3">Tab 3</header>
        <section id="tab3" aria-role="tabpanel">Content 3</section>
      </dash-tab-panel>
    `;
    this.tabpanel = this.container.querySelector('dash-tab-panel');
    this.tabs = Array.from(
      this.container.querySelectorAll('[aria-role="tab"]')
    );
    this.panels = Array.from(
      this.container.querySelectorAll('[aria-role="tabpanel"]')
    );
  });

  it('should only have one visible panel initially',
    dashElements.elementTest('dash-tab-panel', function() {
      expect(this.panels.filter(p => !p.classList.contains('hidden')))
        .to.have.lengthOf(1);
    })
  );

  it('should have one selected tab initially',
    dashElements.elementTest('dash-tab-panel', function() {
      expect(this.tabs.filter(p => p.classList.contains('selected')))
        .to.have.lengthOf(1);
    })
  );

  it('should switch visibility when calling `selectTab()`',
    dashElements.elementTest('dash-tab-panel', function() {
      const selectedTab = this.tabs.find(t => t.classList.contains('selected'));
      const selectedPanel =
        this.panels.find(p =>
          p.id === selectedTab.getAttribute('aria-controls'));
      const otherTab = this.tabs.find(p => p !== selectedTab);
      const otherPanel =
        this.panels.find(p =>
          p.id === otherTab.getAttribute('aria-controls'));

      expect(otherTab.classList.contains('selected')).to.equal(false);
      expect(otherPanel.classList.contains('hidden')).to.equal(true);
      this.tabpanel.selectTab(otherTab);
      expect(otherTab.classList.contains('selected')).to.equal(true);
      expect(otherPanel.classList.contains('hidden')).to.equal(false);
      expect(selectedTab.classList.contains('selected')).to.equal(false);
      expect(selectedPanel.classList.contains('hidden')).to.equal(true);
    })
  );
});
