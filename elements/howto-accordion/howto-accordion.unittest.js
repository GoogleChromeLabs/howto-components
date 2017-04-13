(function() {
  const expect = chai.expect;

  describe('howto-accordion', function() {
    before(dashElements.before());
    after(dashElements.after());
    beforeEach(function() {
      this.container.innerHTML = `
        <howto-accordion>
          <button id="lol">Tab 1</button>
          <section>Content 1</section>
          <button>Tab 2</button>
          <section>Content 2</section>
          <button>Tab 3</button>
          <section>Content 3</section>
        </howto-accordion>
      `;
      return Promise.all([
        dashElements.waitForElement('howto-accordion'),
      ]).then(_ => {
        this.accordion = this.container.querySelector('howto-accordion');
        this.headings =
          Array.from(this.container.querySelectorAll('button'));
        this.panels =
          Array.from(this.container.querySelectorAll('section'));
      });
    });

    it('should know about all the headings', function() {
      expect(
        this.accordion._allHeadings()
      ).to.have.length(
        this.headings.length
      );
    });

    it('should’t overwrite existing IDs with generated ones', function() {
      expect(this.headings[0].id).to.equal('lol');
      expect(this.panels[0].getAttribute('aria-labelledby')).to.equal('lol');
    });

    it('should know about all the panels', function() {
      expect(
        this.accordion._allPanels()
      ).to.have.length(
        this.panels.length
      );
    });

    it('should add `aria-labelledby` to panels', function() {
      this.panels.forEach(panel => {
        expect(panel.getAttribute('aria-labelledby')).to.have.length.above(0);
      });
    });

    it('should ensure IDs to all headings', function() {
      this.headings.forEach(heading => {
        expect(heading.id).to.have.length.above(0);
      });
    });

    it('should add `role` to panels', function() {
      this.panels.forEach(panel => {
        expect(panel.getAttribute('role')).to.equal('region');
      });
    });
  });
})();
